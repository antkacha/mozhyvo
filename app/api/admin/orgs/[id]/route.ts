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

  const { data: org } = await admin.from("orgs").select("id, name").eq("id", orgId).maybeSingle();
  if (!org) return NextResponse.json({ error: "Org not found" }, { status: 404 });

  const { data: projects } = await admin.from("org_projects").select("id").eq("org_id", orgId);
  const projectIds = (projects ?? []).map((p) => p.id as string);

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

  revalidateTag("projects");
  return NextResponse.json({ ok: true });
}
