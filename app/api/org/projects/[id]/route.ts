import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertAffected, ApiError } from "@/lib/supabase/assert-rows";

async function getCallerOrgId(userId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data: org } = await admin.from("orgs").select("id").eq("user_id", userId).maybeSingle();
  if (org) return org.id;
  const { data: member } = await admin.from("org_members").select("org_id").eq("user_id", userId).maybeSingle();
  return member?.org_id ?? null;
}

const ALLOWED_PROJECT_FIELDS = new Set([
  "title", "type", "type_name", "short_description", "full_description",
  "requirements", "benefits", "tags", "deadline", "deadline_display",
  "country", "city", "location", "flag", "format", "funding", "funding_details",
  "duration", "languages", "age_min", "age_max", "status", "auto_close",
  "form_questions", "external_apply_url", "info_pack_url",
]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = await getCallerOrgId(user.id);
  if (!orgId) return NextResponse.json({ error: "No org" }, { status: 403 });

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
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = await getCallerOrgId(user.id);
  if (!orgId) return NextResponse.json({ error: "No org" }, { status: 403 });

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
