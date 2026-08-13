import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const COOKIE_NAME = "mzv_active_context";
const COOKIE_OPTS = { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" as const };

type Context = "personal" | "org";

// Real membership only — orgs/org_members, never user_metadata (that's the
// exact field that's lied about org status before).
async function getOrgAccess(userId: string) {
  const admin = createAdminClient();
  const { data: owned } = await admin.from("orgs").select("id, name").eq("user_id", userId).maybeSingle();
  if (owned) return { id: owned.id as string, name: owned.name as string, isOwner: true };

  const { data: member } = await admin.from("org_members").select("org_id").eq("user_id", userId).maybeSingle();
  if (!member) return null;

  const { data: org } = await admin.from("orgs").select("id, name").eq("id", member.org_id).maybeSingle();
  if (!org) return null;
  return { id: org.id as string, name: org.name as string, isOwner: false };
}

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ hasOrgAccess: false, org: null, activeContext: "personal" });

  const org = await getOrgAccess(user.id);
  const rawCookie = req.cookies.get(COOKIE_NAME)?.value;
  // A cookie claiming "org" only counts if the user actually has org access
  // right now — membership can be revoked after the cookie was set.
  const activeContext: Context = rawCookie === "org" && org ? "org" : "personal";

  return NextResponse.json({ hasOrgAccess: !!org, org, activeContext });
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null) as { context?: Context } | null;
  const context = body?.context;
  if (context !== "personal" && context !== "org") {
    return NextResponse.json({ error: "Invalid context" }, { status: 400 });
  }

  if (context === "org") {
    const org = await getOrgAccess(user.id);
    if (!org) return NextResponse.json({ error: "No org access" }, { status: 403 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, context, COOKIE_OPTS);
  return res;
}
