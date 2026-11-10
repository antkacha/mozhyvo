import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// Given a list of saved opportunity_slug values, returns which ones still
// point to a real, published project of a verified org. Used by SavedContext to
// keep the "Збережені" count in the header in sync with what the saved
// list actually shows — org_projects isn't safely readable from the
// browser client (every other read of it goes through an admin-client
// server route too), so this can't just be a direct Supabase query.
//
// Only for signed-in users (it's about their saved items), at most
// MAX_SLUGS per call (SavedContext sends them in chunks).
const MAX_SLUGS = 100;
const MAX_SLUG_LEN = 200;

export async function POST(req: NextRequest) {
  const { data: { user } } = await createClient().auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null) as { slugs?: unknown } | null;
  const raw = body?.slugs;
  if (!Array.isArray(raw) || raw.length > MAX_SLUGS || raw.some((s) => typeof s !== "string" || s.length > MAX_SLUG_LEN)) {
    return NextResponse.json({ error: `slugs: up to ${MAX_SLUGS} strings of ≤${MAX_SLUG_LEN} chars` }, { status: 400 });
  }
  const slugs = Array.from(new Set((raw as string[]).filter(Boolean)));
  if (slugs.length === 0) return NextResponse.json({ visible: [] });

  const admin = createAdminClient();
  const { data: projects, error } = await admin
    .from("org_projects")
    .select("id, orgs!inner(status)")
    .in("id", slugs)
    .eq("status", "published");

  if (error) {
    // Fail open — a transient DB error shouldn't make someone's saved
    // list look empty. The caller falls back to treating these as visible.
    console.error("[saved-visible]", error.message);
    return NextResponse.json({ visible: slugs });
  }

  const visible = (projects ?? [])
    .filter((p) => {
      const org = p.orgs as unknown as { status?: string };
      return org?.status === "verified";
    })
    .map((p) => p.id as string);

  return NextResponse.json({ visible });
}
