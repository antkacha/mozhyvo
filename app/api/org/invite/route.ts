import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { EMAIL_FROM, SITE_URL } from "@/lib/email-template";

function buildInviteEmail(orgName: string, roleLabel: string, role: string): string {
  const accessItems =
    role === "admin"
      ? [
          { icon: "📋", bg: "#EEF0FD", title: "Заявки учасників",   sub: "Переглядайте та обробляйте заявки" },
          { icon: "🗂️", bg: "#ECFDF5", title: "Програми",           sub: "Публікуйте та редагуйте можливості" },
          { icon: "👥", bg: "#FFF7ED", title: "Команда",             sub: "Запрошуйте колег та керуйте ролями" },
        ]
      : [
          { icon: "📋", bg: "#EEF0FD", title: "Заявки учасників",   sub: "Переглядайте та обробляйте заявки" },
          { icon: "🗂️", bg: "#ECFDF5", title: "Програми",           sub: "Доступ до проєктів організації" },
        ];

  const itemsHtml = accessItems.map(({ icon, bg, title, sub }) => `
<tr><td style="padding-bottom:14px;">
  <table cellpadding="0" cellspacing="0"><tr>
    <td style="width:44px;height:44px;background:${bg};border-radius:12px;text-align:center;vertical-align:middle;font-size:20px;">${icon}</td>
    <td style="padding-left:14px;vertical-align:middle;">
      <p style="margin:0;font-size:14px;font-weight:700;color:#0F0F0F;">${title}</p>
      <p style="margin:3px 0 0;font-size:13px;color:#6B7280;">${sub}</p>
    </td>
  </tr></table>
</td></tr>`).join("");

  return `<!DOCTYPE html>
<html lang="uk">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:40px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">
<tr><td style="border-radius:24px;overflow:hidden;box-shadow:0 4px 40px rgba(59,79,232,0.13);">
<table width="100%" cellpadding="0" cellspacing="0">

<!-- Blue header -->
<tr><td style="background:#3B4FE8;padding:36px 44px 40px;">
  <img src="https://lqtikyzevpjbtueajpsh.supabase.co/storage/v1/object/public/assets/mozhyvo-logo-white.png" alt="Моживо" width="180" style="display:block;width:180px;height:auto;margin-bottom:32px;"/>
  <h1 style="margin:0 0 12px;font-size:28px;font-weight:900;color:#ffffff;line-height:1.25;">Вас запросили<br/>до команди</h1>
  <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.85);line-height:1.7;">Організація <strong style="color:#ffffff;">${orgName}</strong> додала вас<br/>як <strong style="color:#FFD600;">${roleLabel}</strong> на платформі Моживо.</p>
</td></tr>

<!-- White body -->
<tr><td style="background:#ffffff;padding:36px 44px 44px;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="text-align:center;padding-bottom:32px;">
    <a href="${SITE_URL}/dashboard" style="display:inline-block;background:#3B4FE8;color:#ffffff;padding:17px 52px;border-radius:100px;font-weight:700;font-size:16px;text-decoration:none;">Перейти до дешборду →</a>
  </td></tr></table>

  <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="height:1px;background:#F3F4F6;"></td></tr></table>

  <p style="font-size:11px;font-weight:700;color:#9CA3AF;margin:24px 0 16px;text-transform:uppercase;letter-spacing:0.08em;">Що вам тепер доступно</p>

  <table width="100%" cellpadding="0" cellspacing="0">
    ${itemsHtml}
  </table>

  <table width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 16px;"><tr><td style="height:1px;background:#F3F4F6;"></td></tr></table>
  <p style="font-size:12px;color:#9CA3AF;margin:0;line-height:1.8;">
    Маєте питання? Напишіть нам:<br/>
    <a href="mailto:hello@mozhyvo.com.ua" style="color:#3B4FE8;">hello@mozhyvo.com.ua</a>
  </p>
</td></tr>

</table>
</td></tr>

<!-- Footer -->
<tr><td style="padding:24px 0 8px;text-align:center;">
  <p style="font-size:12px;color:#9CA3AF;margin:0 0 4px;">Моживо — платформа можливостей для молоді України</p>
  <p style="font-size:12px;color:#9CA3AF;margin:0;">
    <a href="${SITE_URL}" style="color:#9CA3AF;text-decoration:underline;">mozhyvo.com.ua</a>
    &nbsp;·&nbsp;
    <a href="mailto:hello@mozhyvo.com.ua" style="color:#9CA3AF;text-decoration:underline;">hello@mozhyvo.com.ua</a>
  </p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

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

      await resend.emails.send({
        from: EMAIL_FROM,
        to: email,
        subject: `Вас додано до команди ${org.name} на Моживо`,
        html: buildInviteEmail(org.name, roleLabel, role),
      });
    } catch (e) {
      console.error("[invite] email failed:", e);
    }
  }

  return NextResponse.json({ ok: true });
}
