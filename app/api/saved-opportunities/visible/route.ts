import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Given a list of saved opportunity_slug values, returns which ones still
// point to a real, published, non-blocked project. Used by SavedContext to
// keep the "Збережені" count in the header in sync with what the saved
// list actually shows — org_projects isn't safely readable from the
// browser client (every other read of it goes through an admin-client
// server route too), so this can't just be a direct Supabase query.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as { slugs?: string[] } | null;
  const slugs = body?.slugs?.filter((s) => typeof s === "string" && s) ?? [];
  if (slugs.length === 0) return NextResponse.json({ visible: [] });

  const admin = createAdminClient();
  const { data: projects, error } = await admin
    .from("org_projects")
    .select("id, status, orgs!inner(status)")
    .in("id", slugs)
    .eq("status", "published");

  if (error) {
    // Fail open — a transient DB error shouldn't make someone's saved
    // list look empty. The caller falls back to treating these as visible.
    return NextResponse.json({ visible: slugs, error: error.message }, { status: 200 });
  }

  const visible = (projects ?? [])
    .filter((p) => {
      const org = p.orgs as unknown as { status?: string };
      return org?.status !== "rejected" && org?.status !== "blocked";
    })
    .map((p) => p.id as string);

  return NextResponse.json({ visible });
}
