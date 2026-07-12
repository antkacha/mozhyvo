import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// Temporary debug endpoint — shows org data for the current user
export async function GET() {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated", authError });
  }

  const admin = createAdminClient();

  const [orgRes, profileRes] = await Promise.all([
    admin.from("orgs").select("id, name, slug, status, user_id, created_at").eq("user_id", user.id).maybeSingle(),
    admin.from("profiles").select("id, role").eq("id", user.id).maybeSingle(),
  ]);

  const allOrgsRes = await admin.from("orgs").select("id, name, user_id").limit(20);

  return NextResponse.json({
    userId: user.id,
    email: user.email,
    userMetaRole: user.user_metadata?.role,
    userMetaOrgName: user.user_metadata?.org_name,
    profileRole: profileRes.data?.role,
    orgForThisUser: orgRes.data,
    orgQueryError: orgRes.error?.message,
    allOrgs: allOrgsRes.data,
  });
}
