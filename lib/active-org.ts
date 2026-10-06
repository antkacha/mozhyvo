import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { ACTIVE_ORG_COOKIE, canManageTeam, resolveActiveOrg, type OrgAccess } from "@/lib/org-access";

// The one place API routes find out "which org am I acting as". The org comes
// from the mzv_active_org cookie, but only via resolveActiveOrg — which only
// ever returns an org the user owns or is a member of (falling back to their
// first org). Never take an org id from the request body/query instead.

/** The active org for this user in the current request, or null if they have none. Throws on DB error. */
export async function getActiveOrgForRequest(userId: string): Promise<OrgAccess | null> {
  return resolveActiveOrg(userId, cookies().get(ACTIVE_ORG_COOKIE)?.value);
}

type ActiveOrgResult =
  | { user: User; org: OrgAccess; response?: never }
  | { response: NextResponse; user?: never; org?: never };

/**
 * Route guard: authenticated user + their active org.
 * 401 if signed out, 403 if they have no org (or, with ownerOnly, aren't its
 * owner), 500 if the org lookup itself failed.
 */
export async function requireActiveOrg(opts: { ownerOnly?: boolean; ownerOnlyMessage?: string } = {}): Promise<ActiveOrgResult> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };

  let org: OrgAccess | null;
  try {
    org = await getActiveOrgForRequest(user.id);
  } catch (e) {
    console.error("[active-org] org lookup failed:", e);
    return { response: NextResponse.json({ error: "Не вдалося завантажити організацію" }, { status: 500 }) };
  }
  if (!org) return { response: NextResponse.json({ error: "No org" }, { status: 403 }) };
  if (opts.ownerOnly && !canManageTeam(org)) {
    return { response: NextResponse.json({ error: opts.ownerOnlyMessage ?? "Only the org owner can do this" }, { status: 403 }) };
  }
  return { user, org };
}
