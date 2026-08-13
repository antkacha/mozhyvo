import type { SupabaseClient, User } from "@supabase/supabase-js";
import { slugify } from "@/lib/slugify";

// /org/register never inserts into `orgs` directly — signUp() only stores
// the form fields in user_metadata. This is the one place that turns that
// metadata into a real orgs row, called both right after email confirmation
// (the path that actually matters — see auth/confirm/route.ts) and lazily
// from GET /api/me/org as a defensive fallback for any account that reaches
// a dashboard page without having gone through it yet.
export async function bootstrapOrgFromMetadata(admin: SupabaseClient, user: User) {
  const existing = await admin.from("orgs").select("*").eq("user_id", user.id).maybeSingle();
  if (existing.data) return existing.data;

  const meta = user.user_metadata ?? {};
  if (!((meta.role === "org" || meta.role === "coordinator") && meta.org_name)) return null;

  const orgName = meta.org_name as string;
  const baseSlug = slugify(orgName);
  const uniqueSlug = `${baseSlug}-${user.id.slice(0, 6)}`;

  const orgFormat = (meta.org_format as string) ?? "official";
  const socials: Record<string, string> = {};
  if (meta.org_instagram) socials.instagram = `https://instagram.com/${meta.org_instagram}`;
  if (meta.org_telegram)  socials.telegram  = `https://t.me/${meta.org_telegram}`;
  if (meta.org_facebook)  socials.facebook  = `https://facebook.com/${meta.org_facebook}`;

  const { data: created, error } = await admin
    .from("orgs")
    .insert({
      user_id:             user.id,
      name:                orgName,
      slug:                uniqueSlug,
      type:                (meta.org_type as string) ?? "",
      country:             (meta.org_country as string) ?? "",
      city:                (meta.org_city as string) ?? "",
      website:             (meta.org_website as string) ?? "",
      contact_email:       user.email ?? "",
      description:         (meta.org_description as string) ?? "",
      org_format:          orgFormat,
      registration_number: (meta.org_registration_number as string) ?? "",
      socials:             Object.keys(socials).length > 0 ? socials : {},
      status:              "pending",
    })
    .select("*")
    .single();

  if (created) {
    await admin.from("profiles").upsert({ id: user.id, role: "org" }, { onConflict: "id" });
    return created;
  }

  console.error("[bootstrapOrgFromMetadata] insert failed:", error?.message, "user:", user.id);

  // Insert may have failed on a duplicate from a concurrent request — re-fetch.
  const refetched = await admin.from("orgs").select("*").eq("user_id", user.id).maybeSingle();
  return refetched.data ?? null;
}
