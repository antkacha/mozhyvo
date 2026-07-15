import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  EMAIL_FROM, SITE_URL,
  wrapEmailTemplate, emailButton,
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

const EMAIL_HEADING: Record<string, string> = {
  accepted:  "Вашу заявку прийнято! 🎉",
  rejected:  "Результат розгляду заявки",
  reviewing: "Заявку взято на розгляд",
};

const EMAIL_SUBTITLE: Record<string, string> = {
  accepted:  "Вітаємо! Твою заявку відібрано. Очікуй подальшу інформацію від організації.",
  rejected:  "На жаль, цього разу не вийшло. Не зупиняйся — переглянь інші можливості на Моживо.",
  reviewing: "Твоя заявка перебуває на розгляді. Ми повідомимо тебе про наступні зміни.",
};

async function getCallerOrgId(userId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data: org } = await admin.from("orgs").select("id").eq("user_id", userId).maybeSingle();
  if (org) return org.id;
  const { data: member } = await admin.from("org_members").select("org_id").eq("user_id", userId).maybeSingle();
  return member?.org_id ?? null;
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const callerOrgId = await getCallerOrgId(user.id);
  if (!callerOrgId) return NextResponse.json({ error: "No org" }, { status: 403 });

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

  const admin = createAdminClient();

  const { data: orgApp } = await admin
    .from("org_applications")
    .select("id, org_id, applicant_user_id")
    .eq("id", orgAppId)
    .single();

  if (!orgApp) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Verify caller owns the org that received this application
  if (orgApp.org_id !== callerOrgId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const userStatus = USER_STATUS[orgStatus] ?? "pending";

  // Prefer matching by user_id; fall back to email for legacy records without applicant_user_id
  let updateQuery = admin
    .from("applications")
    .update({ status: userStatus })
    .eq("opportunity_slug", projectId);
  updateQuery = orgApp.applicant_user_id
    ? updateQuery.eq("user_id", orgApp.applicant_user_id)
    : updateQuery.eq("email", email);

  const { data: updated, error } = await updateQuery.select("id");

  if (error) {
    console.error("[sync-status] failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!updated?.length) {
    // Expected for external applicants who have no applications row (legacy/static opportunities)
    console.warn(`[sync-status] 0 rows updated for project=${projectId} orgApp=${orgAppId}`);
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

        await resend.emails.send({
          from: EMAIL_FROM,
          to: email,
          subject: `${emoji} Статус заявки на «${title}» змінено`,
          html: wrapEmailTemplate(
            `<div style="background:#F9FAFB;border-radius:16px;padding:20px 24px;margin-bottom:24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td style="padding-bottom:12px;">
                  <p style="margin:0;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;">Програма</p>
                  <p style="margin:4px 0 0;font-size:16px;font-weight:700;color:#0F0F0F;">${title}</p>
                </td></tr>
                <tr><td style="padding:12px 0;border-top:1px solid #E5E7EB;">
                  <p style="margin:0;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;">Організатор</p>
                  <p style="margin:4px 0 0;font-size:15px;font-weight:600;color:#0F0F0F;">${orgName}</p>
                </td></tr>
                <tr><td style="padding-top:12px;border-top:1px solid #E5E7EB;">
                  <p style="margin:0;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;">Новий статус</p>
                  <div style="margin-top:8px;background:${statusBg};border:1px solid ${statusBorder};border-radius:50px;display:inline-block;padding:6px 16px;">
                    <span style="color:${statusColor};font-weight:700;font-size:14px;">${statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1)}</span>
                  </div>
                </td></tr>
              </table>
            </div>` +
            emailButton("Переглянути мої заявки →", `${SITE_URL}/cabinet/applications`),
            {
              heading: EMAIL_HEADING[userStatus] ?? "Статус заявки змінено",
              subtitle: EMAIL_SUBTITLE[userStatus],
              preview: `${emoji} Статус заявки на «${title}»`,
            },
          ),
        });
      } catch (e) {
        console.error("[sync-status] email send failed:", e);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
