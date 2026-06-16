import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email, role } = await req.json() as { email: string; role: string };
  if (!email || !role) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const admin = createAdminClient();

  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://mozhyvo.vercel.app"}/auth/confirm?next=/dashboard`;
  console.log("[invite] sending to:", email, "redirectTo:", redirectTo);

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo,
    data: { role: "org", invited_role: role, invited_by: user.email },
  });

  console.log("[invite] result:", { data, error });

  if (error) {
    console.error("[invite] error:", error.message);
    if (error.message.toLowerCase().includes("already been registered") ||
        error.message.toLowerCase().includes("already registered")) {
      return NextResponse.json({ ok: false, error: "Цей email вже зареєстрований на Моживо. Додайте їх вручну або вони можуть увійти самостійно." }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
