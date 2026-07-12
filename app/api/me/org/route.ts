import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/slugify";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ org: null, role: null });

  const admin = createAdminClient();

  // Try to find org owned by this user (bypasses RLS)
  const { data: org } = await admin
    .from("orgs")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (org) return NextResponse.json({ org, role: "owner" });

  // Check team membership
  const { data: membership } = await admin
    .from("org_members")
    .select("org_id, role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (membership) {
    const { data: memberOrg } = await admin
      .from("orgs")
      .select("*")
      .eq("id", membership.org_id)
      .single();
    if (memberOrg) return NextResponse.json({ org: memberOrg, role: membership.role });
  }

  // Bootstrap: first login after email confirmation — create org from auth metadata
  const meta = user.user_metadata ?? {};
  if ((meta.role === "org" || meta.role === "coordinator") && meta.org_name) {
    const orgName = meta.org_name as string;
    const baseSlug = slugify(orgName);
    const uniqueSlug = `${baseSlug}-${user.id.slice(0, 6)}`;

    const orgFormat = (meta.org_format as string) ?? "official";
    const socials: Record<string, string> = {};
    if (meta.org_instagram) socials.instagram = `https://instagram.com/${meta.org_instagram}`;
    if (meta.org_telegram)  socials.telegram  = `https://t.me/${meta.org_telegram}`;
    if (meta.org_facebook)  socials.facebook  = `https://facebook.com/${meta.org_facebook}`;

    const { data: created } = await admin
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
      return NextResponse.json({ org: created, role: "owner" });
    }

    // Insert may have failed due to duplicate — re-fetch
    const { data: refetched } = await admin
      .from("orgs").select("*").eq("user_id", user.id).maybeSingle();
    if (refetched) return NextResponse.json({ org: refetched, role: "owner" });
  }

  return NextResponse.json({ org: null, role: null });
}

export async function PATCH(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  // Resolve the org ID for this user (owner or member)
  let orgId: string | null = null;
  const { data: ownedOrg } = await admin
    .from("orgs")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (ownedOrg) {
    orgId = ownedOrg.id;
  } else {
    const { data: membership } = await admin
      .from("org_members")
      .select("org_id")
      .eq("user_id", user.id)
      .maybeSingle();
    orgId = membership?.org_id ?? null;
  }

  if (!orgId) return NextResponse.json({ error: "No org found" }, { status: 404 });

  const body = await req.json() as Record<string, unknown>;
  const { error } = await admin
    .from("orgs")
    .update(body)
    .eq("id", orgId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
