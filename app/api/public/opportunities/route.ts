import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  // Step 1: fetch all published projects (no org-status gate — org can be pending or verified)
  const { data, error } = await admin
    .from("org_projects")
    .select("*, orgs!inner(id, name, slug, status)")
    .eq("status", "published")
    .or(`deadline.is.null,deadline.eq.,deadline.gte.${today}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[public/opportunities] query error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Step 2: exclude blocked/rejected orgs in JS (avoids PostgREST related-table filter quirks)
  const visible = (data ?? []).filter((row) => {
    const orgStatus = (row.orgs as { status?: string } | null)?.status;
    return orgStatus !== "rejected" && orgStatus !== "blocked";
  });

  return NextResponse.json(
    { projects: visible },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
  );
}
