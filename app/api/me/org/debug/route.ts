import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  // Find org by user_id (same logic as PATCH)
  const { data: ownedOrg, error: ownedErr } = await admin
    .from("orgs")
    .select("id, slug, name, website, socials, status, user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  // Also check for any org where this user_id appears
  const { data: allOrgs } = await admin
    .from("orgs")
    .select("id, slug, name, website, socials, status, user_id")
    .eq("user_id", user.id);

  return NextResponse.json({
    userId: user.id,
    ownedOrg,
    ownedOrgError: ownedErr?.message,
    allOrgsWithThisUserId: allOrgs,
  });
}
