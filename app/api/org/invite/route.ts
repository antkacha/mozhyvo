import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  EMAIL_FROM, SITE_URL,
  wrapEmailTemplate, emailButton, emailHeading, emailText, emailInfoBox, emailDivider,
} from "@/lib/email-template";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email, role } = await req.json() as { email: string; role: string };
  if (!email || !role) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const admin = createAdminClient();

  const { data: { users }, error: listError } = await admin.auth.admin.listUsers();
  if (listError) return NextResponse.json({ error: listError.message }, { status: 500 });

  const invitedUser = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!invitedUser) {
    return NextResponse.json({
      error: "Цей користувач ще не зареєстрований на Моживо. Попросіть їх спочатку створити акаунт на сайті.",
    }, { status: 404 });
  }

  const { data: org } = await admin.from("orgs").select("id, name").eq("user_id", user.id).single();
  if (!org) return NextResponse.json({ error: "Org not found" }, { status: 404 });

  const roleLabel = role === "admin" ? "Адміністратора" : "Рецензента";

  await admin.auth.admin.updateUserById(invitedUser.id, {
    user_metadata: { ...invitedUser.user_metadata, has_org_access: true },
  });

  const { error: memberError } = await admin
    .from("org_members")
    .upsert({ org_id: org.id, user_id: invitedUser.id, role, invited_by: user.email }, { onConflict: "org_id,user_id" });

  if (memberError) {
    console.error("[invite] org_members insert failed:", memberError.message);
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  await admin.from("user_notifications").insert({
    user_id: invitedUser.id,
    type: "team_invite",
    title: "Вас додано до команди",
    message: `${org.name} додала вас як ${roleLabel}. Тепер у вас є доступ до дешборду організації.`,
    data: { org_id: org.id, org_name: org.name, role },
  });

  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      const accessItems = role === "admin"
        ? [
            { icon: "📋", text: "Переглядайте та обробляйте заявки учасників" },
            { icon: "🗂️", text: "Публікуйте та редагуйте програми організації" },
            { icon: "👥", text: "Керуйте командою та запрошуйте колег" },
          ]
        : [
            { icon: "📋", text: "Переглядайте та обробляйте заявки учасників" },
            { icon: "🗂️", text: "Доступ до програм та проєктів організації" },
          ];

      await resend.emails.send({
        from: EMAIL_FROM,
        to: email,
        subject: `Вас додано до команди ${org.name} на Моживо`,
        html: wrapEmailTemplate(
          emailHeading("Вас запросили до команди") +
          emailText(`Організація <strong>${org.name}</strong> додала вас на Моживо як <strong>${roleLabel}</strong>.`) +
          emailInfoBox(`
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
              <div style="width:40px;height:40px;background:#3B4FE8;border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <span style="color:#fff;font-weight:900;font-size:16px;">М</span>
              </div>
              <div>
                <p style="margin:0;font-size:15px;font-weight:700;color:#0F0F0F;">${org.name}</p>
                <p style="margin:0;font-size:13px;color:#4B5563;">Ваша роль: <strong style="color:#3B4FE8;">${roleLabel}</strong></p>
              </div>
            </div>
            <div style="height:1px;background:#C7D0FB;margin:0 0 14px;"></div>
            <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#1e3a8a;">Що тепер доступно:</p>
            <div style="display:flex;flex-direction:column;gap:8px;">
              ${accessItems.map(({ icon, text }) => `
                <div style="display:flex;align-items:center;gap:10px;">
                  <span style="font-size:15px;">${icon}</span>
                  <span style="font-size:13px;color:#1e40af;">${text}</span>
                </div>`).join("")}
            </div>`) +
          emailButton("Перейти до дешборду →", `${SITE_URL}/dashboard`) +
          emailDivider() +
          `<p style="font-size:13px;color:#9CA3AF;margin:0;">Маєте питання? Напишіть нам: <a href="mailto:hello@mozhyvo.com.ua" style="color:#3B4FE8;">hello@mozhyvo.com.ua</a></p>`,
          `Вас запросили до команди ${org.name}`,
        ),
      });
    } catch (e) {
      console.error("[invite] email failed:", e);
    }
  }

  return NextResponse.json({ ok: true });
}
