import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  // Step 1: fetch all published org_projects (no join — avoids PostgREST FK requirement)
  const { data: projects, error: projError } = await admin
    .from("org_projects")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (projError) {
    console.error("[public/opportunities] projects query error:", projError.message);
    return NextResponse.json({ error: projError.message }, { status: 500 });
  }

  const rows = projects ?? [];

  // Step 2: collect unique org_ids and fetch org info
  const orgIds = Array.from(new Set(rows.map((r) => r.org_id as string).filter(Boolean)));
  let orgsMap: Map<string, { id: string; name: string; slug?: string; status?: string }> = new Map();

  if (orgIds.length > 0) {
    const { data: orgs, error: orgsError } = await admin
      .from("orgs")
      .select("id, name, slug, status")
      .in("id", orgIds);

    if (orgsError) {
      console.error("[public/opportunities] orgs query error:", orgsError.message);
    } else {
      orgsMap = new Map((orgs ?? []).map((o) => [o.id as string, o as { id: string; name: string; slug?: string; status?: string }]));
    }
  }

  // Step 3: join + filter in JS
  const visible = rows
    .filter((row) => {
      const org = orgsMap.get(row.org_id as string);

      // Exclude projects whose org is blocked or rejected
      if (org?.status === "rejected" || org?.status === "blocked") return false;

      // Exclude expired deadlines (only YYYY-MM-DD format — empty string = rolling = always include)
      const deadline = (row.deadline as string) ?? "";
      if (deadline && /^\d{4}-\d{2}-\d{2}$/.test(deadline) && deadline < today) return false;

      return true;
    })
    .map((row) => {
      const org = orgsMap.get(row.org_id as string);
      return { ...row, orgs: org ?? null };
    });

  // DIAGNOSTIC — remove after confirming cache source
  console.log(
    `[public/opportunities] DB_SELECT=${rows.length} AFTER_JS_FILTER=${visible.length} ts=${Date.now()}`,
  );
  if (rows.length > 0) {
    console.log(
      "[public/opportunities] SELECT titles:",
      rows.map((r) => `${r.id?.slice(0, 8)}…${r.title}`).join(" | "),
    );
  }

  return NextResponse.json(
    { projects: visible },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
  );
}
