import { NextRequest, NextResponse } from "next/server";
import { requireActiveOrg } from "@/lib/active-org";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const ctx = await requireActiveOrg();
  if (ctx.response) return ctx.response;
  const orgId = ctx.org.id;

  const applicationId = req.nextUrl.searchParams.get("applicationId");
  if (!applicationId) return NextResponse.json({ error: "Missing applicationId" }, { status: 400 });

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("org_app_notes")
    .select("*")
    .eq("application_id", applicationId)
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notes: data });
}

export async function POST(req: NextRequest) {
  const ctx = await requireActiveOrg();
  if (ctx.response) return ctx.response;
  const { user, org: { id: orgId } } = ctx;

  const { applicationId, content } = await req.json() as { applicationId?: string; content?: string };
  if (!applicationId || !content?.trim()) {
    return NextResponse.json({ error: "Missing applicationId or content" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", user.id)
    .single();
  const authorName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
    user.email ||
    "Учасник";

  const { data: note, error: noteError } = await admin
    .from("org_app_notes")
    .insert({
      application_id: applicationId,
      org_id: orgId,
      author_id: user.id,
      author_name: authorName,
      content: content.trim(),
    })
    .select()
    .single();

  if (noteError) return NextResponse.json({ error: noteError.message }, { status: 500 });

  await admin.from("org_activity_log").insert({
    application_id: applicationId,
    org_id: orgId,
    actor_id: user.id,
    actor_name: authorName,
    action: "note_added",
    detail: "Додано нотатку",
  });

  return NextResponse.json({ note }, { status: 201 });
}
