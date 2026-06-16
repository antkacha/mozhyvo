import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  // Verify caller is authenticated org user
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email, role } = await req.json() as { email: string; role: string };
  if (!email || !role) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const admin = createAdminClient();

  // Send invitation email via Supabase (uses configured Gmail SMTP)
  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://mozhyvo.vercel.app"}/auth/confirm?next=/dashboard`,
    data: { role: "org", invited_role: role, invited_by: user.email },
  });

  if (error) {
    // If user already exists, that's OK — just return success so they can still be added to the team
    if (error.message.includes("already been registered")) {
      return NextResponse.json({ ok: true, alreadyExists: true });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
