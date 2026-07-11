import { NextRequest, NextResponse } from "next/server";
import {
  EMAIL_FROM, SITE_URL,
  wrapEmailTemplate, emailButton, emailHeading, emailText,
} from "@/lib/email-template";

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
  return wrapEmailTemplate(
    emailHeading("Нова заявка на програму") +
    emailText(`Вітаємо, <strong>${p.orgName}</strong>! Ви отримали нову заявку на проєкт <strong>${p.projectTitle}</strong>.`) +
    `<div style="background:#F9FAFB;border-radius:16px;padding:20px 24px;margin:20px 0;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td style="padding-bottom:12px;">
          <p style="margin:0;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;">Кандидат</p>
          <p style="margin:4px 0 0;font-size:15px;font-weight:700;color:#0F0F0F;">${p.applicantName}</p>
        </td></tr>
        <tr><td style="padding:12px 0;border-top:1px solid #E5E7EB;">
          <p style="margin:0;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;">Email</p>
          <p style="margin:4px 0 0;font-size:14px;color:#3B4FE8;">${p.applicantEmail}</p>
        </td></tr>
        <tr><td style="padding-top:12px;border-top:1px solid #E5E7EB;">
          <p style="margin:0;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;">Країна</p>
          <p style="margin:4px 0 0;font-size:14px;color:#0F0F0F;">${p.country}</p>
        </td></tr>
      </table>
    </div>` +
    emailButton("Переглянути заявку →", `${SITE_URL}/dashboard/applications`),
    `Нова заявка від ${p.applicantName}`,
  );
}

function dailyDigestHtml(p: DailyDigestPayload): string {
  const rows = p.projects
    .map((proj) => `
      <tr>
        <td style="padding:10px 16px;border-top:1px solid #E5E7EB;font-size:14px;color:#0F0F0F;">${proj.title}</td>
        <td style="padding:10px 16px;border-top:1px solid #E5E7EB;text-align:center;">
          <span style="background:#EEF0FD;color:#3B4FE8;font-size:12px;font-weight:700;padding:4px 10px;border-radius:100px;">${proj.newCount}</span>
        </td>
      </tr>`)
    .join("");

  const date = new Date().toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" });

  return wrapEmailTemplate(
    emailHeading(`Щоденний дайджест — ${date}`) +
    emailText(`Вітаємо, <strong>${p.orgName}</strong>! Ось ваша зведена статистика за сьогодні.`) +
    `<div style="background:#EEF0FD;border-radius:16px;padding:24px;text-align:center;margin:20px 0;">
      <p style="margin:0;font-size:42px;font-weight:900;color:#3B4FE8;">${p.totalNew}</p>
      <p style="margin:6px 0 0;font-size:13px;color:#6B7280;">нових заявок за сьогодні</p>
    </div>` +
    (p.projects.length > 0 ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #E5E7EB;border-radius:14px;overflow:hidden;margin-bottom:24px;">
      <thead>
        <tr style="background:#F4F4F5;">
          <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;">Проєкт</th>
          <th style="padding:10px 16px;text-align:center;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;">Нових</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>` : "") +
    emailButton("Відкрити заявки →", `${SITE_URL}/dashboard/applications`),
    `Дайджест Моживо — ${p.totalNew} нових заявок`,
  );
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

    const { data, error } = await resend.emails.send({ from: EMAIL_FROM, to, subject, html });

    if (error) return NextResponse.json({ error }, { status: 400 });
    return NextResponse.json({ success: true, id: data?.id });
  } catch (err) {
    console.error("[notifications]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
