import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { requireActiveOrg } from "@/lib/active-org";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertAffected, ApiError } from "@/lib/supabase/assert-rows";
import { pickProjectFields, canPublish, PUBLISH_REQUIRES_VERIFIED } from "@/lib/project-fields";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const ctx = await requireActiveOrg();
  if (ctx.response) return ctx.response;
  const orgId = ctx.org.id;

  const body = await req.json() as Record<string, unknown>;
  const safeBody = pickProjectFields(body);
  if (Object.keys(safeBody).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  try {
    const admin = createAdminClient();

    // A non-verified org can't move a project TO published. Re-sending
    // "published" for a project that already is (the edit form always sends
    // its current status) is not a publish, so ordinary edits still work.
    if (safeBody.status === "published" && !canPublish(ctx.org.status)) {
      const { data: current } = await admin
        .from("org_projects").select("status").eq("id", params.id).eq("org_id", orgId).limit(1);
      if (current?.[0]?.status !== "published") {
        return NextResponse.json({ error: PUBLISH_REQUIRES_VERIFIED }, { status: 403 });
      }
    }

    assertAffected(
      await admin
        .from("org_projects")
        .update(safeBody)
        .eq("id", params.id)
        .eq("org_id", orgId)
        .select("id"),
      "Project"
    );
    revalidateTag("projects");
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof ApiError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const ctx = await requireActiveOrg();
  if (ctx.response) return ctx.response;
  const orgId = ctx.org.id;

  try {
    const admin = createAdminClient();
    assertAffected(
      await admin
        .from("org_projects")
        .delete()
        .eq("id", params.id)
        .eq("org_id", orgId)
        .select("id"),
      "Project"
    );
    revalidateTag("projects");
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof ApiError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
