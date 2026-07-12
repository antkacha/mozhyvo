import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function getCallerOrgId(userId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data: org } = await admin.from("orgs").select("id").eq("user_id", userId).maybeSingle();
  if (org) return org.id;
  const { data: member } = await admin.from("org_members").select("org_id").eq("user_id", userId).maybeSingle();
  return member?.org_id ?? null;
}

// PATCH /api/org/applications/[id] — update status or internal note
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = await getCallerOrgId(user.id);
  if (!orgId) return NextResponse.json({ error: "No org" }, { status: 403 });

  const body = await req.json() as Record<string, unknown>;
  const admin = createAdminClient();

  const { error } = await admin
    .from("org_applications")
    .update(body)
    .eq("id", params.id)
    .eq("org_id", orgId); // security: only update own org's applications

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
