import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

// Keep the handler always dynamic — handler runs on every request,
// but the DB queries inside are served from Next.js Data Cache
// and invalidated via revalidateTag("projects") on any mutation.
export const dynamic = "force-dynamic";

type OrgEntry = { id: string; name: string; slug?: string | null; status?: string | null };

const fetchProjectsFromDB = unstable_cache(
  async () => {
    const admin = createAdminClient();

    const { data: projects, error: projError } = await admin
      .from("org_projects")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (projError) throw new Error(projError.message);

    const rows = (projects ?? []) as Record<string, unknown>[];
    const orgIds = Array.from(new Set(rows.map((r) => r.org_id as string).filter(Boolean)));

    let orgs: OrgEntry[] = [];
    if (orgIds.length > 0) {
      const { data, error: orgsError } = await admin
        .from("orgs")
        .select("id, name, slug, status")
        .in("id", orgIds);
      if (!orgsError) orgs = (data ?? []) as OrgEntry[];
    }

    return { rows, orgs };
  },
  ["public-opportunities"],
  // revalidate: 60 = 1-minute fallback TTL in case revalidateTag is ever missed.
  // Primary invalidation: revalidateTag("projects") in all project mutation routes.
  { tags: ["projects"], revalidate: 60 },
);

export async function GET() {
  // today is evaluated fresh on every request — deadline filter stays accurate
  // even when rows are served from cache.
  const today = new Date().toISOString().split("T")[0];

  let rows: Record<string, unknown>[];
  let orgs: OrgEntry[];
  try {
    ({ rows, orgs } = await fetchProjectsFromDB());
  } catch (e) {
    console.error("[public/opportunities] DB fetch error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }

  const orgsMap = new Map(orgs.map((o) => [o.id, o]));

  const visible = rows
    .filter((row) => {
      const org = orgsMap.get(row.org_id as string);
      if (org?.status === "rejected" || org?.status === "blocked") return false;
      const deadline = (row.deadline as string) ?? "";
      if (deadline && /^\d{4}-\d{2}-\d{2}$/.test(deadline) && deadline < today) return false;
      return true;
    })
    .map((row) => ({ ...row, orgs: orgsMap.get(row.org_id as string) ?? null }));

  console.log(`[public/opportunities] ${visible.length}/${rows.length} returned`);

  return NextResponse.json(
    { projects: visible },
    // Browser must not cache; only Next.js Data Cache (server-side) is used.
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
  );
}
