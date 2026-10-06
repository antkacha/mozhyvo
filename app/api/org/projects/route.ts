import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { requireActiveOrg } from "@/lib/active-org";
import { createAdminClient } from "@/lib/supabase/admin";
import { pickProjectFields, canPublish, PUBLISH_REQUIRES_VERIFIED } from "@/lib/project-fields";

export async function GET() {
  const ctx = await requireActiveOrg();
  if (ctx.response) return ctx.response;
  const orgId = ctx.org.id;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("org_projects")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ projects: data });
}

export async function POST(req: NextRequest) {
  const ctx = await requireActiveOrg();
  if (ctx.response) return ctx.response;
  const orgId = ctx.org.id;

  const body = await req.json().catch(() => null) as unknown;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  // Same allowlist as project edit; org_id always comes from the caller's
  // active org, never the body. id/views/saves/timestamps stay DB defaults.
  const safeBody = pickProjectFields(body as Record<string, unknown>);
  if (safeBody.status === "published" && !canPublish(ctx.org.status)) {
    return NextResponse.json({ error: PUBLISH_REQUIRES_VERIFIED }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("org_projects")
    .insert({ ...safeBody, org_id: orgId })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidateTag("projects");
  return NextResponse.json({ project: data });
}
