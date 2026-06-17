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

  // Check if invited user is registered
  const { data: { users }, error: listError } = await admin.auth.admin.listUsers();
  if (listError) return NextResponse.json({ error: listError.message }, { status: 500 });

  const invitedUser = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!invitedUser) {
    return NextResponse.json({
      error: "Цей користувач ще не зареєстрований на Моживо. Попросіть їх спочатку створити акаунт на сайті.",
    }, { status: 404 });
  }

  // Get org of the inviting user
  const { data: org } = await supabase.from("orgs").select("id, name").eq("user_id", user.id).single();
  if (!org) return NextResponse.json({ error: "Org not found" }, { status: 404 });

  const roleLabel = role === "admin" ? "Адміністратора" : "Рецензента";

  // Mark invited user so their Header shows Dashboard link without extra DB queries
  await admin.auth.admin.updateUserById(invitedUser.id, {
    user_metadata: { ...invitedUser.user_metadata, has_org_access: true },
  });

  // Add to org_members
  const { error: memberError } = await admin
    .from("org_members")
    .upsert({ org_id: org.id, user_id: invitedUser.id, role, invited_by: user.email }, { onConflict: "org_id,user_id" });

  if (memberError) {
    console.error("[invite] org_members insert failed:", memberError.message);
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  // Create in-app notification for invited user
  await admin.from("user_notifications").insert({
    user_id: invitedUser.id,
    type: "team_invite",
    title: "Вас додано до команди",
    message: `${org.name} додала вас як ${roleLabel}. Тепер у вас є доступ до дешборду організації.`,
    data: { org_id: org.id, org_name: org.name, role },
  });

  // Send email notification via Resend (best-effort)
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mozhyvo.vercel.app";

      await resend.emails.send({
        from: "Моживо <onboarding@resend.dev>",
        to: email,
        subject: `Вас додано до команди ${org.name} на Моживо`,
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:40px 28px;background:#fff">
            <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:28px">
              <div style="background:#3B4FE8;border-radius:10px;width:36px;height:36px;display:flex;align-items:center;justify-content:center">
                <span style="color:white;font-weight:900;font-size:16px">М</span>
              </div>
              <span style="font-weight:900;font-size:20px;color:#0F0F0F">Моживо</span>
            </div>
            <h1 style="font-size:22px;font-weight:800;margin:0 0 12px">Вас додано до команди</h1>
            <p style="font-size:15px;color:#4B5563;line-height:1.7;margin:0 0 8px">
              <strong>${org.name}</strong> додала вас як <strong>${roleLabel}</strong> на Моживо.
            </p>
            <p style="font-size:15px;color:#4B5563;line-height:1.7">
              Тепер у вас є доступ до дешборду організації — ви можете переглядати заявки та проєкти.
            </p>
            <a href="${siteUrl}/dashboard" style="display:inline-block;margin-top:24px;background:#3B4FE8;color:white;padding:14px 32px;border-radius:50px;font-weight:700;font-size:15px;text-decoration:none">
              Перейти до дешборду →
            </a>
            <div style="margin-top:32px;padding-top:20px;border-top:1px solid #F0F0F0;color:#9CA3AF;font-size:12px">
              <p style="margin:0">Моживо — платформа можливостей для молоді України</p>
            </div>
          </div>`,
      });
    } catch (e) {
      console.error("[invite] email failed:", e);
    }
  }

  return NextResponse.json({ ok: true });
}
