import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  EMAIL_FROM, SITE_URL,
  wrapEmailTemplate, emailButton, emailDivider, emailSectionLabel, emailFeatureRow,
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

      const accessRows =
        role === "admin"
          ? [
              emailFeatureRow("📋", "#EEF0FD", "Заявки учасників",    "Переглядайте та обробляйте заявки"),
              emailFeatureRow("🗂️", "#ECFDF5", "Програми",            "Публікуйте та редагуйте можливості"),
              emailFeatureRow("👥", "#FFF7ED", "Команда",              "Запрошуйте колег та керуйте ролями"),
            ]
          : [
              emailFeatureRow("📋", "#EEF0FD", "Заявки учасників",    "Переглядайте та обробляйте заявки"),
              emailFeatureRow("🗂️", "#ECFDF5", "Програми",            "Доступ до проєктів організації"),
            ];

      await resend.emails.send({
        from: EMAIL_FROM,
        to: email,
        subject: `Вас додано до команди ${org.name} на Моживо`,
        html: wrapEmailTemplate(
          emailButton("Перейти до дешборду →", `${SITE_URL}/dashboard`) +
          emailDivider() +
          emailSectionLabel("Що вам тепер доступно") +
          `<table width="100%" cellpadding="0" cellspacing="0">
            ${accessRows.join("")}
          </table>` +
          emailDivider() +
          `<p style="font-size:12px;color:#9CA3AF;margin:0;line-height:1.8;">
            Маєте питання? <a href="mailto:hello@mozhyvo.com.ua" style="color:#3B4FE8;">hello@mozhyvo.com.ua</a>
          </p>`,
          {
            heading: "Вас запросили<br/>до команди",
            subtitle: `${org.name} додала вас як ${roleLabel} на платформі Моживо.`,
            preview: `Вас запросили до команди ${org.name}`,
          },
        ),
      });
    } catch (e) {
      console.error("[invite] email failed:", e);
    }
  }

  return NextResponse.json({ ok: true });
}
