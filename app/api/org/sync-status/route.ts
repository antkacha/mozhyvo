import { NextRequest, NextResponse } from "next/server";
import { requireActiveOrg } from "@/lib/active-org";
import { rateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  EMAIL_FROM, SITE_URL,
  wrapEmailTemplate, emailButton, escapeHtml,
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
  rejected:  "На жаль, цього разу не вийшло. Не зупиняйся — переглянь інші можливості на МОЖUВО.",
  reviewing: "Твоя заявка перебуває на розгляді. Ми повідомимо тебе про наступні зміни.",
};

export async function POST(req: NextRequest) {
  const ctx = await requireActiveOrg();
  if (ctx.response) return ctx.response;
  const callerOrgId = ctx.org.id;

  // Per-user throttle (best-effort, per instance — see lib/rate-limit).
  if (!rateLimit(`sync-status:${ctx.user.id}`, 30, 60_000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // Only the application id comes from the client (orgStatus is accepted for
  // compatibility and must match). Project, applicant, email, title and the
  // status itself are read from the application row, which must belong to
  // the caller's active org — nothing here can target another org's program
  // or an arbitrary address.
  const body = await req.json().catch(() => null) as { orgAppId?: unknown; orgStatus?: unknown } | null;
  const orgAppId = body?.orgAppId;
  if (typeof orgAppId !== "string" || !orgAppId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data: orgAppRows } = await admin
    .from("org_applications")
    .select("id, org_id, project_id, project_title, email, applicant_user_id, status")
    .eq("id", orgAppId)
    .limit(1);
  const orgApp = orgAppRows?.[0];

  if (!orgApp) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Verify caller's active org is the org that received this application
  if (orgApp.org_id !== callerOrgId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const orgStatus = orgApp.status as string;
  if (body?.orgStatus !== undefined && body.orgStatus !== orgStatus) {
    return NextResponse.json({ error: "Status mismatch" }, { status: 409 });
  }
  const userStatus = USER_STATUS[orgStatus];
  if (!userStatus) return NextResponse.json({ error: "Unknown status" }, { status: 400 });

  const projectId = orgApp.project_id as string;
  const email = (orgApp.email as string | null) ?? "";

  // The applicant's own applications row for THIS application's project:
  // by user_id, or for legacy records without one, by the email they applied with.
  const applicantKey = orgApp.applicant_user_id
    ? { col: "user_id", val: orgApp.applicant_user_id as string }
    : { col: "email", val: email };

  const { data: existingRows } = await admin
    .from("applications")
    .select("id, status")
    .eq("opportunity_slug", projectId)
    .eq(applicantKey.col, applicantKey.val);
  const existing = existingRows ?? [];

  const { data: updated, error } = await admin
    .from("applications")
    .update({ status: userStatus })
    .eq("opportunity_slug", projectId)
    .eq(applicantKey.col, applicantKey.val)
    .select("id");

  if (error) {
    console.error("[sync-status] failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!updated?.length) {
    // Expected for external applicants who have no applications row (legacy/static opportunities)
    console.warn(`[sync-status] 0 rows updated for project=${projectId} orgApp=${orgAppId}`);
  }

  // Notify only on a real change: if the applicant's row already had this
  // status, re-sending is just noise (or abuse). Without an applications row
  // (external applicant) fall back to one notice per application+status per
  // hour on this instance.
  const changed = existing.length > 0
    ? existing.some((r) => r.status !== userStatus)
    : rateLimit(`sync-status-notify:${orgAppId}:${userStatus}`, 1, 60 * 60_000);

  const notifyStatuses = ["reviewing", "accepted", "rejected"];
  if (changed && notifyStatuses.includes(userStatus)) {
    let targetUserId = orgApp.applicant_user_id as string | null;
    if (!targetUserId && email) {
      const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 });
      targetUserId = users.find((u) => u.email?.toLowerCase() === email.toLowerCase())?.id ?? null;
    }

    const { data: orgRows } = await admin.from("orgs").select("name").eq("id", orgApp.org_id).limit(1);
    const orgName = (orgRows?.[0]?.name as string | undefined) ?? "Організація";

    let title = orgApp.project_title as string | null;
    if (!title) {
      const { data: projRows } = await admin.from("org_projects").select("title").eq("id", projectId).eq("org_id", callerOrgId).limit(1);
      title = (projRows?.[0]?.title as string | undefined) ?? "Програма";
    }

    const statusInfo = STATUS_UA[userStatus];

    // Plain text: the bell renders it as React text (escaped there).
    if (targetUserId) {
      await admin.from("user_notifications").insert({
        user_id: targetUserId,
        type: "status_update",
        title: "Статус заявки змінено",
        message: `Твоя заявка на «${title}» від ${orgName} — ${statusInfo?.label ?? userStatus}.`,
        data: { org_id: orgApp.org_id, project_id: projectId, status: userStatus },
      });
    }

    const titleHtml = escapeHtml(title);
    const orgNameHtml = escapeHtml(orgName);

    if (email && process.env.RESEND_API_KEY) {
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
                  <p style="margin:4px 0 0;font-size:16px;font-weight:700;color:#0F0F0F;">${titleHtml}</p>
                </td></tr>
                <tr><td style="padding:12px 0;border-top:1px solid #E5E7EB;">
                  <p style="margin:0;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;">Організатор</p>
                  <p style="margin:4px 0 0;font-size:15px;font-weight:600;color:#0F0F0F;">${orgNameHtml}</p>
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
              preview: `${emoji} Статус заявки на «${titleHtml}»`,
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
