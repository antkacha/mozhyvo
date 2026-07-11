import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  EMAIL_FROM, SITE_URL,
  wrapEmailTemplate, emailButton, emailHeading, emailText, emailInfoBox,
} from "@/lib/email-template";

function userEmailHtml(confirmUrl: string, firstName: string): string {
  return wrapEmailTemplate(
    emailHeading("Підтвердіть вашу пошту") +
    emailText(`Привіт${firstName ? `, ${firstName}` : ""}! Ви зареєструвались на <strong>Моживо</strong> — платформі можливостей для молоді України.`) +
    emailText("Натисніть кнопку нижче, щоб підтвердити email і отримати доступ до тисяч можливостей.") +
    emailButton("Підтвердити email →", confirmUrl) +
    emailInfoBox(`
      <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#0F0F0F;">Що вас чекає на Моживо:</p>
      <div style="display:flex;flex-direction:column;gap:8px">
        <div style="display:flex;align-items:center;gap:10px"><span style="font-size:16px">🔍</span><span style="font-size:13px;color:#4B5563">Гранти, стипендії та обміни в одному місці</span></div>
        <div style="display:flex;align-items:center;gap:10px"><span style="font-size:16px">📋</span><span style="font-size:13px;color:#4B5563">Подавайте заявки прямо на платформі</span></div>
        <div style="display:flex;align-items:center;gap:10px"><span style="font-size:16px">🔔</span><span style="font-size:13px;color:#4B5563">Нагадування про дедлайни</span></div>
      </div>`) +
    `<p style="font-size:12px;color:#9CA3AF;margin-top:20px;">
      Кнопка не працює? Скопіюйте це посилання у браузер:<br/>
      <span style="color:#3B4FE8;word-break:break-all">${confirmUrl}</span>
    </p>`,
    "Підтвердіть вашу пошту на Моживо",
  );
}

function orgEmailHtml(confirmUrl: string, orgName: string, isInformal: boolean): string {
  const verificationNote = isInformal
    ? `Після підтвердження ваш профіль потрапить на <strong>ручну перевірку</strong>. Ми зв'яжемось з вами протягом 5 робочих днів.`
    : `Після підтвердження ваш профіль потрапить на <strong>верифікацію</strong>. Наша команда перевірить дані організації впродовж 1–3 робочих днів.`;

  const steps = isInformal
    ? [
        { icon: "✅", text: "Підтвердіть email — натисніть кнопку нижче" },
        { icon: "👀", text: "Ми переглянемо вашу заявку та соцмережі" },
        { icon: "📬", text: "Отримаєте рішення на цей email протягом 5 днів" },
        { icon: "🚀", text: "Після схвалення — розміщуйте активності" },
      ]
    : [
        { icon: "✅", text: "Підтвердіть email — натисніть кнопку нижче" },
        { icon: "🔍", text: "Наша команда перевірить дані організації" },
        { icon: "⏱️", text: "Верифікація займає 1–3 робочих дні" },
        { icon: "🎉", text: "Після верифікації публікуйте програми для молоді" },
      ];

  return wrapEmailTemplate(
    emailHeading("Підтвердіть пошту організації") +
    emailText(`Вітаємо! Ви зареєстрували <strong>${orgName}</strong> на платформі Моживо.`) +
    emailText(verificationNote) +
    emailButton("Підтвердити email →", confirmUrl) +
    emailInfoBox(`
      <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#0F0F0F;">Що відбудеться далі:</p>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${steps.map(({ icon, text }) => `
          <div style="display:flex;align-items:flex-start;gap:10px">
            <span style="font-size:15px;margin-top:1px">${icon}</span>
            <span style="font-size:13px;color:#4B5563;line-height:1.5">${text}</span>
          </div>`).join("")}
      </div>`) +
    `<p style="font-size:12px;color:#9CA3AF;margin-top:20px;">
      Кнопка не працює? Скопіюйте це посилання у браузер:<br/>
      <span style="color:#3B4FE8;word-break:break-all">${confirmUrl}</span>
    </p>`,
    `Підтвердіть пошту — ${orgName} на Моживо`,
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
