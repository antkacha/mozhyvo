import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { listUserOrgs } from "@/lib/org-access";

// Who may see which fields of another user's profile — the single source of
// truth. Users include minors, so anything that lets someone contact or
// identify a person is private.
//
// PUBLIC (anyone, signed in or not): name, avatar, city, education, bio,
// interests, languages.
// PRIVATE (contacts / identifying details): only for
//   a) the user themselves,
//   b) platform admins (profiles.role = 'admin'),
//   c) the owner or a member of an org this user applied to
//      (an org_applications row with any status except 'withdrawn').
//
// Server-side only. Callers must select/return private columns only when
// canViewPrivateProfile() is true — never fetch them "just in case".

export const PUBLIC_PROFILE_FIELDS = [
  "first_name", "last_name", "avatar_url", "city", "institution", "degree",
  "bio", "interests", "languages",
] as const;

/** Everything else a profile holds that identifies or reaches the person. */
export const PRIVATE_PROFILE_FIELDS = [
  "cv_url", "telegram", "linkedin_url", "phone", "email", "country", "graduation_year",
] as const;

export type PublicProfileField = (typeof PUBLIC_PROFILE_FIELDS)[number];
export type PrivateProfileField = (typeof PRIVATE_PROFILE_FIELDS)[number];

export async function canViewPrivateProfile(
  viewerId: string | null | undefined,
  profileId: string,
  admin: SupabaseClient = createAdminClient(),
): Promise<boolean> {
  if (!viewerId) return false;
  if (viewerId === profileId) return true;

  const { data: viewer } = await admin.from("profiles").select("role").eq("id", viewerId).maybeSingle();
  if (viewer?.role === "admin") return true;

  const orgIds = (await listUserOrgs(viewerId, admin)).map((o) => o.id);
  if (orgIds.length === 0) return false;

  const { data: apps, error } = await admin
    .from("org_applications")
    .select("id")
    .eq("applicant_user_id", profileId)
    .in("org_id", orgIds)
    .neq("status", "withdrawn")
    .limit(1);
  return !error && !!apps?.length;
}
