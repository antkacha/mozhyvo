import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function assertAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  return profile?.role === "admin" ? user : null;
}

// Deletes explicitly in dependency order rather than trusting DB-level
// cascades — org_applications/saved_opportunities have needed app-level
// orphan filtering before (deleting a project alone already left orphans
// in both), so this doesn't assume FK cascades cover the chain.
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const user = await assertAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = createAdminClient();
  const orgId = params.id;

  const { data: org } = await admin.from("orgs").select("id, name, user_id").eq("id", orgId).maybeSingle();
  if (!org) return NextResponse.json({ error: "Org not found" }, { status: 404 });

  const { data: projects } = await admin.from("org_projects").select("id").eq("org_id", orgId);
  const projectIds = (projects ?? []).map((p) => p.id as string);

  // Grab member ids before their org_members rows are gone — needed below
  // to clean up their has_org_access metadata flag.
  const { data: members } = await admin.from("org_members").select("user_id").eq("org_id", orgId);
  const memberIds = (members ?? []).map((m) => m.user_id as string);

  if (projectIds.length > 0) {
    const { error: savedErr } = await admin
      .from("saved_opportunities")
      .delete()
      .in("opportunity_slug", projectIds);
    if (savedErr) {
      console.error("[admin org delete] saved_opportunities cleanup failed:", savedErr.message, "org:", orgId);
      return NextResponse.json({ error: "Не вдалося видалити збережені можливості цієї організації" }, { status: 500 });
    }
  }

  const { error: appsErr } = await admin.from("org_applications").delete().eq("org_id", orgId);
  if (appsErr) {
    console.error("[admin org delete] org_applications cleanup failed:", appsErr.message, "org:", orgId);
    return NextResponse.json({ error: "Не вдалося видалити заявки цієї організації" }, { status: 500 });
  }

  const { error: projectsErr } = await admin.from("org_projects").delete().eq("org_id", orgId);
  if (projectsErr) {
    console.error("[admin org delete] org_projects cleanup failed:", projectsErr.message, "org:", orgId);
    return NextResponse.json({ error: "Не вдалося видалити можливості цієї організації" }, { status: 500 });
  }

  const { error: membersErr } = await admin.from("org_members").delete().eq("org_id", orgId);
  if (membersErr) {
    console.error("[admin org delete] org_members cleanup failed:", membersErr.message, "org:", orgId);
    return NextResponse.json({ error: "Не вдалося видалити команду цієї організації" }, { status: 500 });
  }

  const { error: orgErr } = await admin.from("orgs").delete().eq("id", orgId);
  if (orgErr) {
    console.error("[admin org delete] orgs delete failed:", orgErr.message, "org:", orgId);
    return NextResponse.json({ error: "Не вдалося видалити організацію" }, { status: 500 });
  }

  // Sever the data bootstrapOrgFromMetadata keys off — user_metadata.role
  // stays "org" forever otherwise, since nothing else ever clears it. That's
  // exactly what let a deleted org get silently recreated the next time the
  // owner loaded /dashboard, before this cleanup existed. Best-effort: the
  // org row itself is already gone regardless of whether this succeeds.
  const { data: ownerAuth } = await admin.auth.admin.getUserById(org.user_id);
  if (ownerAuth?.user) {
    const meta = { ...ownerAuth.user.user_metadata };
    delete meta.org_name;
    delete meta.org_type;
    delete meta.org_country;
    delete meta.org_city;
    delete meta.org_website;
    delete meta.org_registration_number;
    delete meta.org_description;
    delete meta.org_format;
    delete meta.org_instagram;
    delete meta.org_telegram;
    delete meta.org_facebook;
    delete meta.has_org_access;
    meta.role = "seeker";
    await admin.auth.admin.updateUserById(org.user_id, { user_metadata: meta });
  }
  await admin.from("profiles").update({ role: "seeker" }).eq("id", org.user_id);

  // Same has_org_access cleanup members/[userId] already does when someone
  // is individually removed — here for everyone who was on this org's team.
  for (const memberId of memberIds) {
    const { data: otherMembership } = await admin
      .from("org_members").select("id").eq("user_id", memberId).maybeSingle();
    if (otherMembership) continue;
    const { data: memberAuth } = await admin.auth.admin.getUserById(memberId);
    if (memberAuth?.user) {
      const meta = { ...memberAuth.user.user_metadata };
      delete meta.has_org_access;
      await admin.auth.admin.updateUserById(memberId, { user_metadata: meta });
    }
  }

  revalidateTag("projects");
  return NextResponse.json({ ok: true });
}
