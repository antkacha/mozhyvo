import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mozhyvo.org";

function logoBlock() {
  return `
    <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:28px">
      <div style="background:#3B4FE8;border-radius:10px;width:36px;height:36px;display:flex;align-items:center;justify-content:center">
        <span style="color:white;font-weight:900;font-size:16px">М</span>
      </div>
      <span style="font-weight:900;font-size:20px;color:#0F0F0F">Моживо</span>
    </div>`;
}

function footerBlock() {
  return `
    <div style="margin-top:40px;padding-top:24px;border-top:1px solid #F0F0F0;color:#9CA3AF;font-size:12px;line-height:1.6">
      <p style="margin:0">Моживо — платформа можливостей для молоді України</p>
      <p style="margin:4px 0 0">Якщо ви не реєструвалися на Моживо — просто проігноруйте цей лист.</p>
      <p style="margin:4px 0 0"><a href="mailto:mozhyvo@gmail.com" style="color:#3B4FE8;text-decoration:none">mozhyvo@gmail.com</a></p>
    </div>`;
}

function buttonLink(href: string, text: string) {
  return `<a href="${href}" style="display:inline-block;margin-top:24px;background:#3B4FE8;color:white;padding:14px 32px;border-radius:50px;font-weight:700;font-size:15px;text-decoration:none;letter-spacing:0.01em">${text} →</a>`;
}

function userEmailHtml(confirmUrl: string, firstName: string) {
  return `
  <div style="font-family:system-ui,-apple-system,sans-serif;max-width:540px;margin:0 auto;padding:40px 28px;background:#ffffff;color:#0F0F0F">
    ${logoBlock()}
    <h1 style="font-size:24px;font-weight:800;margin:0 0 12px;line-height:1.3">
      Підтвердіть вашу пошту
    </h1>
    <p style="font-size:15px;color:#4B5563;line-height:1.7;margin:0 0 8px">
      Привіт${firstName ? `, ${firstName}` : ""}! Ви зареєструвались на <strong>Моживо</strong> — платформі можливостей для молоді України.
    </p>
    <p style="font-size:15px;color:#4B5563;line-height:1.7;margin:0">
      Натисніть кнопку нижче, щоб підтвердити email і отримати доступ до тисяч можливостей.
    </p>
    ${buttonLink(confirmUrl, "Підтвердити email")}
    <div style="margin-top:28px;background:#F7F8FC;border-radius:14px;padding:18px 20px">
      <p style="margin:0;font-size:13px;font-weight:700;color:#0F0F0F;margin-bottom:10px">Що вас чекає на Моживо:</p>
      <div style="display:flex;flex-direction:column;gap:8px">
        <div style="display:flex;align-items:center;gap:10px"><span style="font-size:16px">🔍</span><span style="font-size:13px;color:#4B5563">Гранти, стипендії та обміни в одному місці</span></div>
        <div style="display:flex;align-items:center;gap:10px"><span style="font-size:16px">📋</span><span style="font-size:13px;color:#4B5563">Подавайте заявки прямо на платформі</span></div>
        <div style="display:flex;align-items:center;gap:10px"><span style="font-size:16px">🔔</span><span style="font-size:13px;color:#4B5563">Нагадування про дедлайни</span></div>
      </div>
    </div>
    <p style="font-size:12px;color:#9CA3AF;margin-top:20px">
      Кнопка не працює? Скопіюйте це посилання у браузер:<br/>
      <span style="color:#3B4FE8;word-break:break-all">${confirmUrl}</span>
    </p>
    ${footerBlock()}
  </div>`;
}

function orgEmailHtml(confirmUrl: string, orgName: string, isInformal: boolean) {
  const verificationNote = isInformal
    ? `Після підтвердження ваш профіль потрапить на <strong>ручну перевірку</strong>. Ми зв'яжемось з вами на цей email протягом 5 робочих днів.`
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

  return `
  <div style="font-family:system-ui,-apple-system,sans-serif;max-width:540px;margin:0 auto;padding:40px 28px;background:#ffffff;color:#0F0F0F">
    ${logoBlock()}
    <h1 style="font-size:24px;font-weight:800;margin:0 0 12px;line-height:1.3">
      Підтвердіть пошту організації
    </h1>
    <p style="font-size:15px;color:#4B5563;line-height:1.7;margin:0 0 8px">
      Вітаємо! Ви зареєстрували <strong>${orgName}</strong> на платформі Моживо.
    </p>
    <p style="font-size:15px;color:#4B5563;line-height:1.7;margin:0">
      ${verificationNote}
    </p>
    ${buttonLink(confirmUrl, "Підтвердити email")}
    <div style="margin-top:28px;background:#F7F8FC;border-radius:14px;padding:18px 20px">
      <p style="margin:0;font-size:13px;font-weight:700;color:#0F0F0F;margin-bottom:10px">Що відбудеться далі:</p>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${steps.map(({ icon, text }) => `
          <div style="display:flex;align-items:flex-start;gap:10px">
            <span style="font-size:15px;margin-top:1px">${icon}</span>
            <span style="font-size:13px;color:#4B5563;line-height:1.5">${text}</span>
          </div>`).join("")}
      </div>
    </div>
    <p style="font-size:12px;color:#9CA3AF;margin-top:20px">
      Кнопка не працює? Скопіюйте це посилання у браузер:<br/>
      <span style="color:#3B4FE8;word-break:break-all">${confirmUrl}</span>
    </p>
    ${footerBlock()}
  </div>`;
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
      return NextResponse.json({ ok: true }); // silently skip if not configured
    }

    const admin = createAdminClient();
    const redirectTo =
      role === "org"
        ? `${SITE_URL}/auth/callback?next=/dashboard`
        : `${SITE_URL}/auth/callback?next=/cabinet`;

    // Generate a fresh confirmation link via the admin API
    const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: { redirectTo },
    });

    if (linkError || !linkData?.properties?.action_link) {
      // Fallback: just log, don't break registration
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

    await resend.emails.send({
      from: "Моживо <noreply@mozhyvo.com>",
      to: email,
      subject,
      html,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[verify-email] error:", err);
    return NextResponse.json({ ok: true }); // never break registration
  }
}
