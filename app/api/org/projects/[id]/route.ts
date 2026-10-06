import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { requireActiveOrg } from "@/lib/active-org";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertAffected, ApiError } from "@/lib/supabase/assert-rows";

const ALLOWED_PROJECT_FIELDS = new Set([
  "title", "type", "type_name", "short_description", "full_description",
  "requirements", "benefits", "tags", "deadline", "deadline_display",
  "country", "city", "location", "flag", "format", "funding", "funding_details",
  "duration", "languages", "age_min", "age_max", "status", "auto_close",
  "form_questions", "external_apply_url", "info_pack_url", "photo_url", "important_note",
  "has_fee", "fee_amount", "fee_who",
  "apply_method", "apply_email", "apply_email_subject", "apply_instructions",
]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const ctx = await requireActiveOrg();
  if (ctx.response) return ctx.response;
  const orgId = ctx.org.id;

  const body = await req.json() as Record<string, unknown>;
  const safeBody = Object.fromEntries(
    Object.entries(body).filter(([k]) => ALLOWED_PROJECT_FIELDS.has(k))
  );
  if (Object.keys(safeBody).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  try {
    const admin = createAdminClient();
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
