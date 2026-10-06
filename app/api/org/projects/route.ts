import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { requireActiveOrg } from "@/lib/active-org";
import { createAdminClient } from "@/lib/supabase/admin";

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

  const body = await req.json() as Record<string, unknown>;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("org_projects")
    .insert({ ...body, org_id: orgId })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  revalidateTag("projects");
  return NextResponse.json({ project: data });
}
