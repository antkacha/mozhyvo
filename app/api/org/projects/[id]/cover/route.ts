import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { lookup } from "dns/promises";
import { isIP } from "net";
import sharp from "sharp";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { COVER_ALLOWED_TYPES, COVER_MAX_BYTES, COVER_WIDTH, COVER_HEIGHT, COVER_BUCKET } from "@/lib/cover-photo";

export const runtime = "nodejs";
// Vercel Hobby's hard function limit is 10s — this route must always
// finish (success or a clean caught error) inside that ceiling, so a
// killed function never reaches the client instead of our own JSON error.
// TOTAL_FETCH_BUDGET_MS below bounds the external-fetch phase to leave
// the remaining ~2s for sharp + Storage upload + the DB write.
export const maxDuration = 9;

// Whole-redirect-chain budget (headers + body read), NOT per hop — a
// previous version re-armed this timer on every redirect, so a URL with
// even 2 slow hops could take up to MAX_REDIRECTS × 8s, blowing well past
// the platform's own limit before our try/catch ever got a chance to
// return a clean error.
const TOTAL_FETCH_BUDGET_MS = 7000;
const MAX_REDIRECTS = 4;

async function getCallerOrgId(userId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data: org } = await admin.from("orgs").select("id").eq("user_id", userId).maybeSingle();
  if (org) return org.id;
  const { data: member } = await admin.from("org_members").select("org_id").eq("user_id", userId).maybeSingle();
  return member?.org_id ?? null;
}

function isPrivateIp(ip: string): boolean {
  if (isIP(ip) === 4) {
    const [a, b] = ip.split(".").map(Number);
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    return false;
  }
  const lower = ip.toLowerCase();
  if (lower === "::1") return true;
  if (lower.startsWith("fc") || lower.startsWith("fd")) return true; // fc00::/7 unique local
  if (lower.startsWith("fe80")) return true; // link-local
  if (lower.startsWith("::ffff:")) return isPrivateIp(lower.slice(7)); // IPv4-mapped
  return false;
}

async function assertPublicHost(hostname: string): Promise<void> {
  let address: string;
  try {
    ({ address } = await lookup(hostname));
  } catch {
    throw new Error("Не вдалося визначити адресу хоста");
  }
  if (isPrivateIp(address)) throw new Error("Заборонена адреса");
}

/** Downloads a remote image with SSRF guards, a byte cap, and manual redirect re-validation. */
async function fetchRemoteImage(startUrl: string): Promise<Buffer> {
  let currentUrl = startUrl;
  const deadline = Date.now() + TOTAL_FETCH_BUDGET_MS;
  const TIMEOUT_MESSAGE = "Не вдалося завантажити зображення (таймаут або мережева помилка)";

  for (let hop = 0; hop < MAX_REDIRECTS; hop++) {
    if (Date.now() >= deadline) throw new Error(TIMEOUT_MESSAGE);

    const parsed = new URL(currentUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("Дозволені лише http/https посилання");
    }
    await assertPublicHost(parsed.hostname);

    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) throw new Error(TIMEOUT_MESSAGE);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), remainingMs);
    let res: Response;
    try {
      res = await fetch(parsed.toString(), { signal: controller.signal, redirect: "manual" });
    } catch {
      throw new Error(TIMEOUT_MESSAGE);
    } finally {
      clearTimeout(timeout);
    }

    if ([301, 302, 303, 307, 308].includes(res.status)) {
      const loc = res.headers.get("location");
      if (!loc) throw new Error("Редирект без адреси призначення");
      currentUrl = new URL(loc, currentUrl).toString();
      continue;
    }

    if (!res.ok) throw new Error(`Не вдалося завантажити зображення (${res.status})`);

    const contentType = res.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();
    if (!contentType || !COVER_ALLOWED_TYPES.includes(contentType)) {
      throw new Error("Посилання не веде на зображення JPG/PNG/WebP");
    }

    const contentLength = res.headers.get("content-length");
    if (contentLength && Number(contentLength) > COVER_MAX_BYTES) {
      throw new Error("Зображення більше за 4 МБ");
    }
    if (!res.body) throw new Error("Порожня відповідь");

    const reader = res.body.getReader();
    const chunks: Uint8Array[] = [];
    let total = 0;
    for (;;) {
      if (Date.now() >= deadline) {
        await reader.cancel();
        throw new Error(TIMEOUT_MESSAGE);
      }
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > COVER_MAX_BYTES) {
        await reader.cancel();
        throw new Error("Зображення більше за 4 МБ");
      }
      chunks.push(value);
    }
    return Buffer.concat(chunks);
  }
  throw new Error("Забагато редиректів");
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = await getCallerOrgId(user.id);
  if (!orgId) return NextResponse.json({ error: "No org" }, { status: 403 });

  const admin = createAdminClient();
  const { data: project } = await admin
    .from("org_projects")
    .select("id")
    .eq("id", params.id)
    .eq("org_id", orgId)
    .maybeSingle();
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const body = await req.json().catch(() => null) as { url?: string } | null;
  const url = body?.url?.trim();
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

  try {
    const raw = await fetchRemoteImage(url);
    const jpeg = await sharp(raw)
      .resize(COVER_WIDTH, COVER_HEIGHT, { fit: "cover", position: "centre" })
      .jpeg({ quality: 85 })
      .toBuffer();

    const path = `${params.id}/cover.jpg`;
    const { error: uploadError } = await admin.storage
      .from(COVER_BUCKET)
      .upload(path, jpeg, { contentType: "image/jpeg", upsert: true });
    if (uploadError) throw new Error(uploadError.message);

    const { data: { publicUrl } } = admin.storage.from(COVER_BUCKET).getPublicUrl(path);
    const photoUrl = `${publicUrl}?v=${Date.now()}`;

    const { error: updateError } = await admin
      .from("org_projects")
      .update({ photo_url: photoUrl })
      .eq("id", params.id)
      .eq("org_id", orgId);
    if (updateError) throw new Error(updateError.message);

    revalidateTag("projects");
    return NextResponse.json({ photoUrl });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Server error" }, { status: 400 });
  }
}
