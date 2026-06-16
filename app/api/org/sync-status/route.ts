import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Maps org-side status → user-facing status
const USER_STATUS: Record<string, string> = {
  new:       "pending",
  reviewing: "reviewing",
  selected:  "accepted",
  rejected:  "rejected",
};

export async function POST(req: NextRequest) {
  // Verify the caller is an authenticated org user
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orgAppId, orgStatus, projectId, email } = await req.json() as {
    orgAppId: string;
    orgStatus: string;
    projectId: string;
    email: string;
  };

  if (!orgAppId || !orgStatus || !projectId || !email) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Verify this org_application actually belongs to the caller's org
  const { data: orgApp } = await supabase
    .from("org_applications")
    .select("id, org_id")
    .eq("id", orgAppId)
    .single();

  if (!orgApp) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Use admin client to update applications table (bypasses RLS)
  const admin = createAdminClient();
  const userStatus = USER_STATUS[orgStatus] ?? "pending";

  const { error } = await admin
    .from("applications")
    .update({ status: userStatus })
    .eq("opportunity_slug", projectId)
    .eq("email", email);

  if (error) {
    console.error("[sync-status] failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
