import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";

// Keeps the Supabase project active by querying it on a schedule.
// Triggered externally (cron-job.org, GitHub Actions, etc.) since Vercel
// Hobby only allows daily cron. The caller passes CRON_SECRET either as
// `Authorization: Bearer <secret>` or `?secret=<secret>` — some free
// ping services can't set custom headers, so the query param is a fallback.
function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const authHeader = req.headers.get("authorization");
  const headerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;
  const provided = headerToken ?? req.nextUrl.searchParams.get("secret");
  if (!provided) return false;

  const a = Buffer.from(provided);
  const b = Buffer.from(secret);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { count, error } = await admin
    .from("profiles")
    .select("id", { count: "exact", head: true });

  if (error) {
    console.error("[cron/ping] Supabase error:", error.message);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  console.log(`[cron/ping] Supabase is alive. profiles count: ${count}`);
  return NextResponse.json({ ok: true, count, ts: new Date().toISOString() });
}
