import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listUserOrgs, pickActiveOrg, type OrgAccess } from "@/lib/org-access";

export const dynamic = "force-dynamic";

const CONTEXT_COOKIE = "mzv_active_context";
const ORG_COOKIE = "mzv_active_org";
const COOKIE_OPTS = { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" as const };

type Context = "personal" | "org";

// Real membership only — orgs/org_members via lib/org-access, never
// user_metadata (that's the exact field that's lied about org status before).
// A DB failure is reported as a 500, never as "no orgs" — otherwise a blip
// would silently hide every org the user belongs to.

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ hasOrgAccess: false, org: null, orgs: [], activeOrgId: null, activeContext: "personal" });
  }

  let orgs: OrgAccess[];
  try {
    orgs = await listUserOrgs(user.id);
  } catch (e) {
    console.error("[me/context] org lookup failed:", e);
    return NextResponse.json({ error: "Не вдалося завантажити організації" }, { status: 500 });
  }

  // The stored org only counts if the user still belongs to it; otherwise
  // fall back to their first org.
  const org = pickActiveOrg(orgs, req.cookies.get(ORG_COOKIE)?.value);
  // A cookie claiming "org" only counts if the user actually has org access
  // right now — membership can be revoked after the cookie was set.
  const activeContext: Context = req.cookies.get(CONTEXT_COOKIE)?.value === "org" && org ? "org" : "personal";

  return NextResponse.json({
    hasOrgAccess: orgs.length > 0,
    org,
    orgs,
    activeOrgId: org?.id ?? null,
    activeContext,
  });
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null) as { context?: Context; orgId?: string } | null;
  const context = body?.context;
  if (context !== "personal" && context !== "org") {
    return NextResponse.json({ error: "Invalid context" }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });

  if (context === "org") {
    let orgs: OrgAccess[];
    try {
      orgs = await listUserOrgs(user.id);
    } catch (e) {
      console.error("[me/context] org lookup failed:", e);
      return NextResponse.json({ error: "Не вдалося завантажити організації" }, { status: 500 });
    }
    if (!orgs.length) return NextResponse.json({ error: "No org access" }, { status: 403 });

    // Never trust the client: an explicit orgId must be one the user belongs to.
    const requested = typeof body?.orgId === "string" ? body.orgId : undefined;
    if (requested && !orgs.some((o) => o.id === requested)) {
      return NextResponse.json({ error: "No access to this org" }, { status: 403 });
    }
    const org = pickActiveOrg(orgs, requested ?? req.cookies.get(ORG_COOKIE)?.value)!;
    res.cookies.set(ORG_COOKIE, org.id, COOKIE_OPTS);
  }

  res.cookies.set(CONTEXT_COOKIE, context, COOKIE_OPTS);
  return res;
}
