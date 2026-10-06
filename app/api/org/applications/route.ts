import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireActiveOrg } from "@/lib/active-org";
import { createAdminClient } from "@/lib/supabase/admin";

// GET /api/org/applications?projectId=xxx — list applications for caller's org
// Withdrawn applications are excluded: the candidate cancelled, nothing to action.
export async function GET(req: NextRequest) {
  const ctx = await requireActiveOrg();
  if (ctx.response) return ctx.response;
  const orgId = ctx.org.id;

  const admin = createAdminClient();
  const projectId = req.nextUrl.searchParams.get("projectId");

  let query = admin
    .from("org_applications")
    .select("*")
    .eq("org_id", orgId)
    .neq("status", "withdrawn")
    .order("submitted_at", { ascending: false });

  if (projectId) query = query.eq("project_id", projectId);

  const { data: rawData, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Exclude applications whose project was deleted — every consumer (sidebar
  // badge, dashboard "new applications" stat, per-project counts, the list
  // itself) reads from this one route, so filtering here keeps them all in
  // sync instead of each re-deriving "does this project still exist" (or
  // not) independently. Defensive regardless of whether org_applications has
  // a DB-level FK/cascade to org_projects.
  const projectIds = Array.from(new Set((rawData ?? []).map((a) => a.project_id as string)));
  let existingProjectIds = new Set<string>();
  if (projectIds.length > 0) {
    const { data: existingProjects } = await admin
      .from("org_projects")
      .select("id")
      .in("id", projectIds);
    existingProjectIds = new Set((existingProjects ?? []).map((p) => p.id as string));
  }
  const data = (rawData ?? []).filter((a) => existingProjectIds.has(a.project_id as string));

  // Batch-fetch avatar_urls from profiles for all applicants
  const userIds = (data ?? [])
    .map((a) => a.applicant_user_id as string | null)
    .filter((id): id is string => !!id);

  let avatarMap: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await admin
      .from("profiles")
      .select("id, avatar_url")
      .in("id", userIds);
    avatarMap = Object.fromEntries(
      (profiles ?? [])
        .filter((p) => p.avatar_url)
        .map((p) => [p.id as string, p.avatar_url as string])
    );
  }

  const result = (data ?? []).map((a) => ({
    ...a,
    avatar_url: a.applicant_user_id ? (avatarMap[a.applicant_user_id as string] ?? null) : null,
  }));

  return NextResponse.json({ applications: result });
}

// Applicant-provided org_applications columns. id, org_id,
// applicant_user_id, status, submitted_at and the org-only internal_note
// are server/DB-set; project_title is taken from the project itself.
const APPLICANT_FIELDS = new Set([
  "first_name", "last_name", "email", "phone", "country", "institution",
  "degree", "motivation", "languages", "cv_url", "portfolio_url", "custom_answers",
]);

// POST /api/org/applications — submit application to org (called after user submits)
export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const projectId = body.project_id;
  if (!projectId || typeof projectId !== "string") return NextResponse.json({ error: "Missing project_id" }, { status: 400 });

  const admin = createAdminClient();

  // Resolve org_id from the project
  const { data: project } = await admin
    .from("org_projects")
    .select("org_id, title")
    .eq("id", projectId)
    .maybeSingle();

  if (!project?.org_id) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const applicantFields = Object.fromEntries(
    Object.entries(body).filter(([k]) => APPLICANT_FIELDS.has(k))
  );

  const { error } = await admin.from("org_applications").insert({
    ...applicantFields,
    project_id: projectId,
    project_title: project.title,
    org_id: project.org_id,
    applicant_user_id: user.id,
    status: "new",
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
