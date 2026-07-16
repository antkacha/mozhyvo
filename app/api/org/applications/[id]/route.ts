import { NextRequest, NextResponse } from "next/server";
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

const ALLOWED_APPLICATION_FIELDS = new Set(["status", "internal_note"]);

const STATUS_LABEL: Record<string, string> = {
  new: "Нова",
  reviewing: "Розглядається",
  selected: "Відібрано",
  rejected: "Відхилено",
};

// PATCH /api/org/applications/[id] — update status or internal note
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orgId = await getCallerOrgId(user.id);
  if (!orgId) return NextResponse.json({ error: "No org" }, { status: 403 });

  const body = await req.json() as Record<string, unknown>;
  const safeBody = Object.fromEntries(
    Object.entries(body).filter(([k]) => ALLOWED_APPLICATION_FIELDS.has(k))
  );
  if (Object.keys(safeBody).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  try {
    const admin = createAdminClient();

    // Pre-fetch old status before update so we can log the transition
    let oldStatus: string | null = null;
    if (safeBody.status) {
      const { data: existing } = await admin
        .from("org_applications")
        .select("status")
        .eq("id", params.id)
        .eq("org_id", orgId)
        .single();
      oldStatus = existing?.status ?? null;
    }

    assertAffected(
      await admin
        .from("org_applications")
        .update(safeBody)
        .eq("id", params.id)
        .eq("org_id", orgId)
        .select("id"),
      "Application"
    );

    // Log status change to activity log
    if (safeBody.status && oldStatus && oldStatus !== safeBody.status) {
      const { data: profile } = await admin
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", user.id)
        .single();
      const actorName =
        [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
        user.email ||
        "Учасник";

      const oldLabel = STATUS_LABEL[oldStatus] ?? oldStatus;
      const newLabel = STATUS_LABEL[safeBody.status as string] ?? (safeBody.status as string);

      await admin.from("org_activity_log").insert({
        application_id: params.id,
        org_id: orgId,
        actor_id: user.id,
        actor_name: actorName,
        action: "status_changed",
        detail: `${oldLabel} → ${newLabel}`,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof ApiError) return NextResponse.json({ error: e.message }, { status: e.status });
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
