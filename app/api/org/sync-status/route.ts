import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  EMAIL_FROM, SITE_URL,
  wrapEmailTemplate, emailButton, emailHeading, emailText,
} from "@/lib/email-template";

const USER_STATUS: Record<string, string> = {
  new:       "pending",
  reviewing: "reviewing",
  selected:  "accepted",
  rejected:  "rejected",
};

const STATUS_UA: Record<string, { label: string; color: string; emoji: string }> = {
  reviewing: { label: "на розгляді",  color: "#D97706", emoji: "🔍" },
  accepted:  { label: "прийнято",     color: "#059669", emoji: "🎉" },
  rejected:  { label: "не прийнято",  color: "#DC2626", emoji: "📋" },
};

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { orgAppId, orgStatus, projectId, email, projectTitle } = await req.json() as {
    orgAppId: string;
    orgStatus: string;
    projectId: string;
    email: string;
    projectTitle?: string;
  };

  if (!orgAppId || !orgStatus || !projectId || !email) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { data: orgApp } = await supabase
    .from("org_applications")
    .select("id, org_id")
    .eq("id", orgAppId)
    .single();

  if (!orgApp) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const admin = createAdminClient();
  const userStatus = USER_STATUS[orgStatus] ?? "pending";

  const { error } = await admin
    .from("applications")
    .update({ status: userStatus })
    .eq("opportunity_slug", projectId)
    .eq("email", email);

  if (error) {
    console.error("[sync-status] failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const notifyStatuses = ["reviewing", "accepted", "rejected"];
  if (notifyStatuses.includes(userStatus)) {
    const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const targetUser = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    const { data: orgData } = await admin.from("orgs").select("name").eq("id", orgApp.org_id).single();
    const orgName = orgData?.name ?? "Організація";

    let title = projectTitle;
    if (!title) {
      const { data: proj } = await admin.from("org_projects").select("title").eq("id", projectId).single();
      title = proj?.title ?? "Програма";
    }

    const statusInfo = STATUS_UA[userStatus];

    if (targetUser) {
      await admin.from("user_notifications").insert({
        user_id: targetUser.id,
        type: "status_update",
        title: "Статус заявки змінено",
        message: `Твоя заявка на «${title}» від ${orgName} — ${statusInfo?.label ?? userStatus}.`,
        data: { org_id: orgApp.org_id, project_id: projectId, status: userStatus },
      });
    }

    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);

        const statusLabel = statusInfo?.label ?? userStatus;
        const statusColor = statusInfo?.color ?? "#3B4FE8";
        const emoji = statusInfo?.emoji ?? "📩";

        const statusBg =
          userStatus === "accepted" ? "#ECFDF5" :
          userStatus === "rejected" ? "#FEF2F2" : "#FFFBEB";
        const statusBorder =
          userStatus === "accepted" ? "#A7F3D0" :
          userStatus === "rejected" ? "#FECACA" : "#FDE68A";

        const bodyText =
          userStatus === "accepted"
            ? "Вітаємо! Твою заявку відібрано. Очікуй подальшу інформацію від організації."
            : userStatus === "rejected"
            ? "На жаль, цього разу не вийшло. Не зупиняйся — переглянь інші можливості на Моживо."
            : "Твоя заявка перебуває на розгляді. Ми повідомимо тебе про наступні зміни.";

        await resend.emails.send({
          from: EMAIL_FROM,
          to: email,
          subject: `${emoji} Статус заявки на «${title}» змінено`,
          html: wrapEmailTemplate(
            emailHeading("Оновлення статусу заявки") +
            `<div style="background:#F9FAFB;border-radius:16px;padding:20px 24px;margin-bottom:20px;">
              <p style="font-size:13px;color:#6B7280;margin:0 0 4px;">Програма</p>
              <p style="font-size:16px;font-weight:700;color:#0F0F0F;margin:0 0 14px;">${title}</p>
              <p style="font-size:13px;color:#6B7280;margin:0 0 4px;">Організатор</p>
              <p style="font-size:15px;font-weight:600;color:#0F0F0F;margin:0 0 14px;">${orgName}</p>
              <p style="font-size:13px;color:#6B7280;margin:0 0 8px;">Новий статус</p>
              <div style="background:${statusBg};border:1px solid ${statusBorder};border-radius:50px;display:inline-block;padding:6px 16px;">
                <span style="color:${statusColor};font-weight:700;font-size:14px;">${statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1)}</span>
              </div>
            </div>` +
            emailText(bodyText) +
            emailButton("Переглянути мої заявки →", `${SITE_URL}/cabinet/applications`),
            `${emoji} Статус заявки на «${title}»`,
          ),
        });
      } catch (e) {
        console.error("[sync-status] email send failed:", e);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
