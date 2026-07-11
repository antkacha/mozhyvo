import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Called by Vercel Cron every 3 days to keep Supabase project active.
// Vercel verifies the CRON_SECRET header before executing.
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
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
