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

export async function GET(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = await getCallerOrgId(user.id);
  if (!orgId) return NextResponse.json({ error: "No org" }, { status: 403 });

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
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = await getCallerOrgId(user.id);
  if (!orgId) return NextResponse.json({ error: "No org" }, { status: 403 });

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
