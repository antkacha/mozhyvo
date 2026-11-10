import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSameOrigin, foreignOriginResponse } from "@/lib/same-origin";

// Project view counter. Counts at most once per visitor per project per 24 h
// (httpOnly cookie holding short hashes of viewed ids + when), ignores
// obvious bots, and only counts published projects of verified orgs.
// Always answers the same {ok:true} so it can't be used to probe which ids
// exist (drafts, pending orgs).
//
// NOTE: the increment is read-then-write, not atomic — two simultaneous
// views can count as one. Fine for a display counter; an atomic version
// needs a SQL function (see the S3 report).

const COOKIE = "mzv_viewed";
const WINDOW_MS = 24 * 60 * 60_000;
const MAX_ENTRIES = 60; // ~60 × 15 chars ≈ 0.9 KB cookie
const BOT_UA = /bot|crawl|spider|preview|slurp|facebookexternalhit|headless|lighthouse/i;

const ok = () => NextResponse.json({ ok: true });
const idHash = (id: string) => createHash("sha256").update(id).digest("base64url").slice(0, 8);

/** Cookie format: "<hash8>.<epochMinutes base36>" joined by "~". Drops expired/garbage entries. */
function readViewed(raw: string | undefined, now: number): Map<string, number> {
  const out = new Map<string, number>();
  for (const part of (raw ?? "").split("~")) {
    const [h, t] = part.split(".");
    const at = parseInt(t ?? "", 36) * 60_000;
    if (h?.length === 8 && Number.isFinite(at) && now - at < WINDOW_MS) out.set(h, at);
  }
  return out;
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isSameOrigin(req)) return foreignOriginResponse();
  const { id } = params;
  if (!id || id.length > 100) return ok();
  if (BOT_UA.test(req.headers.get("user-agent") ?? "")) return ok();

  const now = Date.now();
  const viewed = readViewed(req.cookies.get(COOKIE)?.value, now);
  const h = idHash(id);
  if (viewed.has(h)) return ok();

  try {
    const admin = createAdminClient();
    const { data: row } = await admin
      .from("org_projects")
      .select("views, status, orgs!inner(status)")
      .eq("id", id)
      .eq("status", "published")
      .maybeSingle();
    const orgStatus = (row?.orgs as unknown as { status?: string } | null)?.status;
    if (!row || orgStatus !== "verified") return ok();

    await admin
      .from("org_projects")
      .update({ views: ((row.views as number | null) ?? 0) + 1 })
      .eq("id", id);
  } catch {
    return ok();
  }

  viewed.set(h, now);
  const entries = Array.from(viewed.entries()).sort((a, b) => b[1] - a[1]).slice(0, MAX_ENTRIES);
  const res = ok();
  res.cookies.set(COOKIE, entries.map(([k, at]) => `${k}.${Math.floor(at / 60_000).toString(36)}`).join("~"), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/projects",
    maxAge: 24 * 60 * 60,
  });
  return res;
}
