import { lookup } from "dns/promises";
import { isIP } from "net";
import { COVER_ALLOWED_TYPES, COVER_MAX_BYTES } from "@/lib/cover-photo";

// Server-side image download used by the "paste a link" upload paths
// (project cover URL import, org cover URL tab). Moved here unchanged from
// app/api/org/projects/[id]/cover/route.ts so both share one SSRF-guarded
// implementation. Callers run on Vercel Hobby (10s function limit): the whole
// fetch is bounded by TOTAL_FETCH_BUDGET_MS, leaving ~2s for sharp, Storage
// upload and the DB write.

// Whole-redirect-chain budget (headers + body read), NOT per hop — a
// previous version re-armed this timer on every redirect, so a URL with
// even 2 slow hops could take up to MAX_REDIRECTS × 8s, blowing well past
// the platform's own limit before our try/catch ever got a chance to
// return a clean error.
const TOTAL_FETCH_BUDGET_MS = 7000;
const MAX_REDIRECTS = 4;

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
export async function fetchRemoteImage(startUrl: string): Promise<Buffer> {
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
