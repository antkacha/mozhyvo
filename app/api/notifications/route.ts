import { NextRequest, NextResponse } from "next/server";

interface NewApplicationPayload {
  type: "new_application";
  orgEmail: string;
  orgName: string;
  applicantName: string;
  applicantEmail: string;
  projectTitle: string;
  country: string;
  submittedAt: string;
}

interface DailyDigestPayload {
  type: "daily_digest";
  orgEmail: string;
  orgName: string;
  digestEmail: string;
  totalNew: number;
  projects: { title: string; newCount: number }[];
}

type Payload = NewApplicationPayload | DailyDigestPayload;

function newApplicationHtml(p: NewApplicationPayload): string {
  return `
<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAFAFA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFA;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">
        <!-- Header -->
        <tr><td style="background:#3B4FE8;border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:20px;font-weight:900;letter-spacing:-0.5px">Нова заявка на Моживо</h1>
        </td></tr>
        <!-- Body -->
        <tr><td style="background:#fff;padding:32px;border-radius:0 0 16px 16px;border:1px solid #E5E7EB;border-top:none;">
          <p style="margin:0 0 4px;font-size:15px;color:#6B7280;">Вітаємо, ${p.orgName}!</p>
          <p style="margin:0 0 24px;font-size:15px;color:#0F0F0F;">Ви отримали нову заявку на проєкт <strong>${p.projectTitle}</strong>.</p>

          <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F4F5;border-radius:12px;padding:20px;">
            <tr><td style="padding-bottom:12px;">
              <p style="margin:0;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;">Кандидат</p>
              <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#0F0F0F;">${p.applicantName}</p>
            </td></tr>
            <tr><td style="padding-bottom:12px;border-top:1px solid #E5E7EB;padding-top:12px;">
              <p style="margin:0;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;">Email</p>
              <p style="margin:4px 0 0;font-size:14px;color:#3B4FE8;">${p.applicantEmail}</p>
            </td></tr>
            <tr><td style="border-top:1px solid #E5E7EB;padding-top:12px;">
              <p style="margin:0;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;">Країна</p>
              <p style="margin:4px 0 0;font-size:14px;color:#0F0F0F;">${p.country}</p>
            </td></tr>
          </table>

          <p style="margin:24px 0 0;text-align:center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://mozhyvo.org"}/dashboard/applications"
               style="display:inline-block;background:#3B4FE8;color:#fff;font-size:14px;font-weight:700;padding:14px 28px;border-radius:100px;text-decoration:none;">
              Переглянути заявку →
            </a>
          </p>

          <p style="margin:24px 0 0;font-size:12px;color:#6B7280;text-align:center;">
            Ви отримали цей лист тому, що увімкнені сповіщення про нові заявки.<br>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://mozhyvo.org"}/dashboard/settings" style="color:#3B4FE8;">Налаштування сповіщень</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function dailyDigestHtml(p: DailyDigestPayload): string {
  const rows = p.projects
    .map((proj) => `<tr><td style="padding:10px 16px;border-top:1px solid #E5E7EB;font-size:14px;color:#0F0F0F;">${proj.title}</td><td style="padding:10px 16px;border-top:1px solid #E5E7EB;text-align:center;"><span style="background:#EEF0FD;color:#3B4FE8;font-size:12px;font-weight:700;padding:4px 10px;border-radius:100px;">${proj.newCount}</span></td></tr>`)
    .join("");

  return `
<!DOCTYPE html>
<html lang="uk">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAFAFA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFA;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%">
        <tr><td style="background:#3B4FE8;border-radius:16px 16px 0 0;padding:28px 32px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:20px;font-weight:900;">Щоденний дайджест Моживо</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.7);font-size:14px;">${new Date().toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" })}</p>
        </td></tr>
        <tr><td style="background:#fff;padding:32px;border-radius:0 0 16px 16px;border:1px solid #E5E7EB;border-top:none;">
          <p style="margin:0 0 8px;font-size:15px;color:#6B7280;">Вітаємо, ${p.orgName}!</p>
          <div style="background:#EEF0FD;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
            <p style="margin:0;font-size:36px;font-weight:900;color:#3B4FE8;">${p.totalNew}</p>
            <p style="margin:4px 0 0;font-size:13px;color:#6B7280;">нових заявок за сьогодні</p>
          </div>
          ${p.projects.length > 0 ? `
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E5E7EB;border-radius:12px;overflow:hidden;">
            <thead><tr style="background:#F4F4F5;">
              <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;">Проєкт</th>
              <th style="padding:10px 16px;text-align:center;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;">Нових</th>
            </tr></thead>
            <tbody>${rows}</tbody>
          </table>` : ""}
          <p style="margin:24px 0 0;text-align:center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? "https://mozhyvo.org"}/dashboard/applications"
               style="display:inline-block;background:#3B4FE8;color:#fff;font-size:14px;font-weight:700;padding:14px 28px;border-radius:100px;text-decoration:none;">
              Відкрити заявки →
            </a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as Payload;
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
    }

    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);

    let to: string;
    let subject: string;
    let html: string;

    if (payload.type === "new_application") {
      to = payload.orgEmail;
      subject = `Нова заявка на «${payload.projectTitle}» від ${payload.applicantName}`;
      html = newApplicationHtml(payload);
    } else {
      to = payload.digestEmail;
      subject = `Щоденний дайджест Моживо — ${payload.totalNew} нових заявок`;
      html = dailyDigestHtml(payload);
    }

    const { data, error } = await resend.emails.send({
      from: "Моживо <onboarding@resend.dev>",
      to,
      subject,
      html,
    });

    if (error) return NextResponse.json({ error }, { status: 400 });
    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error("[notifications]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
