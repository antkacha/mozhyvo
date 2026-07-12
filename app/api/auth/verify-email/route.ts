import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  EMAIL_FROM, SITE_URL,
  wrapEmailTemplate, emailButton, emailDivider, emailSectionLabel, emailFeatureRow,
} from "@/lib/email-template";

function userEmailHtml(confirmUrl: string, firstName: string): string {
  return wrapEmailTemplate(
    emailButton("Підтвердити email →", confirmUrl, "Посилання дійсне 24 години") +
    emailDivider() +
    emailSectionLabel("Що вас чекає на платформі") +
    `<table width="100%" cellpadding="0" cellspacing="0">
      ${emailFeatureRow("🔍", "#EEF0FD", "Гранти та стипендії", "З усього світу — в одному місці")}
      ${emailFeatureRow("🚀", "#ECFDF5", "Подача заявок онлайн", "Без зайвих реєстрацій і форм")}
      ${emailFeatureRow("🔔", "#FFF7ED", "Нагадування про дедлайни", "Не пропустіть важливі дати")}
    </table>` +
    emailDivider() +
    `<p style="font-size:12px;color:#9CA3AF;margin:0;line-height:1.8;">
      Якщо ви не реєструвались — проігноруйте цей лист.<br/>
      Посилання не відкривається? Скопіюйте в браузер:<br/>
      <a href="${confirmUrl}" style="color:#3B4FE8;word-break:break-all;font-size:11px;">${confirmUrl}</a>
    </p>`,
    {
      heading: "Підтвердіть<br/>вашу пошту",
      subtitle: firstName
        ? `Привіт, ${firstName}! Один клік — і ви на платформі. Тисячі можливостей для молоді України вже чекають.`
        : "Один клік — і ви на платформі. Тисячі можливостей для молоді України вже чекають.",
      preview: "Підтвердіть вашу пошту на Моживо",
    },
  );
}

function orgEmailHtml(confirmUrl: string, orgName: string, isInformal: boolean): string {
  const steps = isInformal
    ? [
        { icon: "✅", bg: "#ECFDF5", title: "Підтвердіть email",   sub: "Натисніть кнопку нижче" },
        { icon: "👀", bg: "#EEF0FD", title: "Ручна перевірка",     sub: "Ми переглянемо заявку та соцмережі" },
        { icon: "📬", bg: "#FFF7ED", title: "Рішення на email",    sub: "Протягом 5 робочих днів" },
        { icon: "🚀", bg: "#ECFDF5", title: "Публікуйте активності", sub: "Після схвалення — одразу до роботи" },
      ]
    : [
        { icon: "✅", bg: "#ECFDF5", title: "Підтвердіть email",     sub: "Натисніть кнопку нижче" },
        { icon: "🔍", bg: "#EEF0FD", title: "Перевірка організації", sub: "Наша команда перевірить дані" },
        { icon: "⏱️", bg: "#FFF7ED", title: "1–3 робочих дні",      sub: "Верифікація займає небагато часу" },
        { icon: "🎉", bg: "#ECFDF5", title: "Публікуйте програми",  sub: "Після верифікації — до роботи" },
      ];

  const subtitle = isInformal
    ? `Ви зареєстрували ${orgName} на Моживо. Після підтвердження ми розглянемо заявку протягом 5 робочих днів.`
    : `Ви зареєстрували ${orgName} на Моживо. Після підтвердження розпочнеться верифікація — 1–3 робочих дні.`;

  return wrapEmailTemplate(
    emailButton("Підтвердити email →", confirmUrl, "Посилання дійсне 24 години") +
    emailDivider() +
    emailSectionLabel("Що відбудеться далі") +
    `<table width="100%" cellpadding="0" cellspacing="0">
      ${steps.map(({ icon, bg, title, sub }) => emailFeatureRow(icon, bg, title, sub)).join("")}
    </table>` +
    emailDivider() +
    `<p style="font-size:12px;color:#9CA3AF;margin:0;line-height:1.8;">
      Якщо ви не реєструвались — проігноруйте цей лист.<br/>
      Посилання не відкривається? Скопіюйте в браузер:<br/>
      <a href="${confirmUrl}" style="color:#3B4FE8;word-break:break-all;font-size:11px;">${confirmUrl}</a>
    </p>`,
    {
      heading: "Підтвердіть пошту<br/>організації",
      subtitle,
      preview: `Підтвердіть пошту — ${orgName} на Моживо`,
    },
  );
}

export async function POST(req: NextRequest) {
  try {
    const { email, role, firstName, orgName, orgFormat } = await req.json() as {
      email: string;
      role: "user" | "org";
      firstName?: string;
      orgName?: string;
      orgFormat?: "official" | "informal";
    };

    if (!email || !process.env.RESEND_API_KEY) {
      return NextResponse.json({ ok: true });
    }

    const admin = createAdminClient();
    const redirectTo =
      role === "org"
        ? `${SITE_URL}/auth/callback?next=/dashboard`
        : `${SITE_URL}/auth/callback?next=/cabinet`;

    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo },
    });

    if (linkError || !linkData?.properties?.action_link) {
      console.error("[verify-email] generateLink failed:", linkError?.message);
      return NextResponse.json({ ok: true });
    }

    const confirmUrl = linkData.properties.action_link;

    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const subject =
      role === "org"
        ? `Підтвердіть email — ${orgName ?? "ваша організація"} на Моживо`
        : "Підтвердіть вашу пошту на Моживо";

    const html =
      role === "org"
        ? orgEmailHtml(confirmUrl, orgName ?? "Ваша організація", orgFormat === "informal")
        : userEmailHtml(confirmUrl, firstName ?? "");

    await resend.emails.send({ from: EMAIL_FROM, to: email, subject, html });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[verify-email] error:", err);
    return NextResponse.json({ ok: true });
  }
}
