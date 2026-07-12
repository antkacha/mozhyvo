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

// GET /api/org/applications?projectId=xxx — list applications for caller's org
export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = await getCallerOrgId(user.id);
  if (!orgId) return NextResponse.json({ error: "No org" }, { status: 403 });

  const admin = createAdminClient();
  const projectId = req.nextUrl.searchParams.get("projectId");

  let query = admin
    .from("org_applications")
    .select("*")
    .eq("org_id", orgId)
    .order("submitted_at", { ascending: false });

  if (projectId) query = query.eq("project_id", projectId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ applications: data ?? [] });
}

// POST /api/org/applications — submit application to org (called after user submits)
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as Record<string, unknown>;
  const projectId = body.project_id as string;
  if (!projectId) return NextResponse.json({ error: "Missing project_id" }, { status: 400 });

  const admin = createAdminClient();

  // Resolve org_id from the project
  const { data: project } = await admin
    .from("org_projects")
    .select("org_id")
    .eq("id", projectId)
    .maybeSingle();

  if (!project?.org_id) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const { error } = await admin.from("org_applications").insert({
    ...body,
    org_id: project.org_id,
    status: "new",
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
