import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

// Multi-org access — the single source of truth for "which orgs can this user
// act as". Ownership lives in orgs.user_id (owners have NO org_members row);
// membership lives in org_members. A user may own one org AND be a member of
// others, or be a member of several — so nothing here uses maybeSingle/single.
//
// Server-side only (uses the service-role client by default).

export interface OrgAccess {
  id: string;
  name: string;
  status: string;
  role: string; // "owner" for owners, otherwise the org_members.role (e.g. "admin")
  isOwner: boolean;
}

type OrgRow = { id: string; name: string | null; status: string | null };
type MemberRow = { org_id: string; role: string | null };

const byName = (a: OrgAccess, b: OrgAccess) =>
  a.name.localeCompare(b.name, "uk") || a.id.localeCompare(b.id);

/**
 * Pure merge: owned orgs first, then member orgs, each alphabetical by name.
 * De-duplicates by org id, preferring the owner entry. Member rows whose org
 * no longer exists are dropped.
 */
export function mergeOrgAccess(
  owned: OrgRow[],
  memberships: MemberRow[],
  memberOrgs: OrgRow[],
): OrgAccess[] {
  const ownedAccess: OrgAccess[] = owned.map((o) => ({
    id: o.id,
    name: o.name ?? "",
    status: o.status ?? "",
    role: "owner",
    isOwner: true,
  }));
  const ownedIds = new Set(ownedAccess.map((o) => o.id));

  const orgById = new Map(memberOrgs.map((o) => [o.id, o]));
  const memberAccess = new Map<string, OrgAccess>();
  for (const m of memberships) {
    if (ownedIds.has(m.org_id) || memberAccess.has(m.org_id)) continue;
    const org = orgById.get(m.org_id);
    if (!org) continue;
    memberAccess.set(m.org_id, {
      id: org.id,
      name: org.name ?? "",
      status: org.status ?? "",
      role: m.role ?? "member",
      isOwner: false,
    });
  }

  return [...ownedAccess.sort(byName), ...Array.from(memberAccess.values()).sort(byName)];
}

/**
 * Pure pick: the requested org if the user actually has it, otherwise the
 * first org (or null). A user can never "act as" an org they don't belong to.
 */
export function pickActiveOrg(orgs: OrgAccess[], requestedOrgId?: string | null): OrgAccess | null {
  if (requestedOrgId) {
    const match = orgs.find((o) => o.id === requestedOrgId);
    if (match) return match;
  }
  return orgs[0] ?? null;
}

/** Every org the user owns or is a member of (0, 1 or many). */
export async function listUserOrgs(
  userId: string,
  admin: SupabaseClient = createAdminClient(),
): Promise<OrgAccess[]> {
  const [ownedRes, memberRes] = await Promise.all([
    admin.from("orgs").select("id, name, status").eq("user_id", userId),
    admin.from("org_members").select("org_id, role").eq("user_id", userId),
  ]);
  if (ownedRes.error) throw new Error(ownedRes.error.message);
  if (memberRes.error) throw new Error(memberRes.error.message);

  const owned = (ownedRes.data ?? []) as OrgRow[];
  const memberships = (memberRes.data ?? []) as MemberRow[];

  const memberOrgIds = Array.from(new Set(memberships.map((m) => m.org_id)));
  let memberOrgs: OrgRow[] = [];
  if (memberOrgIds.length) {
    const orgsRes = await admin.from("orgs").select("id, name, status").in("id", memberOrgIds);
    if (orgsRes.error) throw new Error(orgsRes.error.message);
    memberOrgs = (orgsRes.data ?? []) as OrgRow[];
  }

  return mergeOrgAccess(owned, memberships, memberOrgs);
}

/** The org the user is acting as: requestedOrgId if valid, else their first org, else null. */
export async function resolveActiveOrg(
  userId: string,
  requestedOrgId?: string | null,
  admin?: SupabaseClient,
): Promise<OrgAccess | null> {
  return pickActiveOrg(await listUserOrgs(userId, admin), requestedOrgId);
}

/** Team management (invites, roles, removal) is owner-only; admin members manage opportunities. */
export function canManageTeam(orgAccess: OrgAccess | null | undefined): boolean {
  return orgAccess?.isOwner === true;
}
