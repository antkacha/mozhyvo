import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ hasDashboard: false });

  const admin = createAdminClient();
  const [{ data: org }, { data: member }] = await Promise.all([
    admin.from("orgs").select("id").eq("user_id", user.id).maybeSingle(),
    admin.from("org_members").select("id").eq("user_id", user.id).maybeSingle(),
  ]);

  return NextResponse.json({ hasDashboard: !!(org || member) });
}
