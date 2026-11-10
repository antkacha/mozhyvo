import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { assertAffected, ApiError } from "@/lib/supabase/assert-rows";
import { revalidateOrg } from "@/lib/revalidate-org";

async function assertAdmin() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  return profile?.role === "admin" ? user : null;
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const user = await assertAdmin();
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const admin = createAdminClient();
    const { data: project } = await admin.from("org_projects").select("org_id").eq("id", params.id).maybeSingle();
    assertAffected(
      await admin
        .from("org_projects")
        .delete()
        .eq("id", params.id)
        .select("id"),
      "Project"
    );
    revalidateTag("projects");
    if (project?.org_id) await revalidateOrg({ id: project.org_id as string });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof ApiError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
