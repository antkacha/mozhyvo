import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const USER_STATUS: Record<string, string> = {
  new:       "pending",
  reviewing: "reviewing",
  selected:  "accepted",
  rejected:  "rejected",
};

const STATUS_UA: Record<string, { label: string; color: string; emoji: string }> = {
  reviewing: { label: "на розгляді",     color: "#D97706", emoji: "🔍" },
  accepted:  { label: "прийнято",        color: "#059669", emoji: "🎉" },
  rejected:  { label: "не прийнято",     color: "#DC2626", emoji: "📋" },
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

  // Verify this org_application belongs to the caller's org
  const { data: orgApp } = await supabase
    .from("org_applications")
    .select("id, org_id")
    .eq("id", orgAppId)
    .single();

  if (!orgApp) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const admin = createAdminClient();
  const userStatus = USER_STATUS[orgStatus] ?? "pending";

  // Update user-facing applications table
  const { error } = await admin
    .from("applications")
    .update({ status: userStatus })
    .eq("opportunity_slug", projectId)
    .eq("email", email);

  if (error) {
    console.error("[sync-status] failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Only notify for meaningful status changes (not 'new' or 'pending')
  const notifyStatuses = ["reviewing", "accepted", "rejected"];
  if (notifyStatuses.includes(userStatus)) {
    // Find the user by email
    const { data: { users } } = await admin.auth.admin.listUsers({ perPage: 1000 });
    const targetUser = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    // Get org name
    const { data: orgData } = await admin.from("orgs").select("name").eq("id", orgApp.org_id).single();
    const orgName = orgData?.name ?? "Організація";

    // Get project title if not provided
    let title = projectTitle;
    if (!title) {
      const { data: proj } = await admin.from("org_projects").select("title").eq("id", projectId).single();
      title = proj?.title ?? "Програма";
    }

    const statusInfo = STATUS_UA[userStatus];

    // Create in-app notification
    if (targetUser) {
      await admin.from("user_notifications").insert({
        user_id: targetUser.id,
        type: "status_update",
        title: `Статус заявки змінено`,
        message: `Твоя заявка на «${title}» від ${orgName} — ${statusInfo?.label ?? userStatus}.`,
        data: { org_id: orgApp.org_id, project_id: projectId, status: userStatus },
      });
    }

    // Send email via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mozhyvo.vercel.app";

        const statusLabel = statusInfo?.label ?? userStatus;
        const statusColor = statusInfo?.color ?? "#3B4FE8";
        const emoji = statusInfo?.emoji ?? "📩";

        await resend.emails.send({
          from: "Моживо <onboarding@resend.dev>",
          to: email,
          subject: `${emoji} Статус заявки на «${title}» змінено`,
          html: `
<div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:40px 28px;background:#fff">
  <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:28px">
    <div style="background:#3B4FE8;border-radius:10px;width:36px;height:36px;display:flex;align-items:center;justify-content:center">
      <span style="color:white;font-weight:900;font-size:16px">М</span>
    </div>
    <span style="font-weight:900;font-size:20px;color:#0F0F0F">Моживо</span>
  </div>

  <h1 style="font-size:22px;font-weight:800;margin:0 0 16px">Оновлення статусу заявки</h1>

  <div style="background:#F9FAFB;border-radius:16px;padding:20px 24px;margin-bottom:20px">
    <p style="font-size:13px;color:#6B7280;margin:0 0 6px">Програма</p>
    <p style="font-size:16px;font-weight:700;color:#0F0F0F;margin:0 0 12px">${title}</p>
    <p style="font-size:13px;color:#6B7280;margin:0 0 6px">Організатор</p>
    <p style="font-size:15px;font-weight:600;color:#0F0F0F;margin:0 0 12px">${orgName}</p>
    <p style="font-size:13px;color:#6B7280;margin:0 0 6px">Новий статус</p>
    <span style="display:inline-block;background:${statusColor}1A;color:${statusColor};font-weight:700;font-size:14px;padding:6px 14px;border-radius:50px">
      ${statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1)}
    </span>
  </div>

  ${userStatus === "accepted" ? `
  <p style="font-size:15px;color:#4B5563;line-height:1.7;margin:0 0 20px">
    Вітаємо! Твою заявку відібрано. Очікуй подальшу інформацію від організації.
  </p>` : userStatus === "rejected" ? `
  <p style="font-size:15px;color:#4B5563;line-height:1.7;margin:0 0 20px">
    На жаль, цього разу не вийшло. Не зупиняйся — переглянь інші можливості на Моживо.
  </p>` : `
  <p style="font-size:15px;color:#4B5563;line-height:1.7;margin:0 0 20px">
    Твоя заявка перебуває на розгляді. Ми повідомимо тебе про наступні зміни.
  </p>`}

  <a href="${siteUrl}/cabinet/applications" style="display:inline-block;background:#3B4FE8;color:white;padding:14px 28px;border-radius:50px;font-weight:700;font-size:15px;text-decoration:none">
    Переглянути мої заявки →
  </a>

  <div style="margin-top:32px;padding-top:20px;border-top:1px solid #F0F0F0;color:#9CA3AF;font-size:12px">
    <p style="margin:0">Моживо — платформа можливостей для молоді України</p>
    <p style="margin:4px 0 0">Щоб відмовитися від сповіщень, зайди в <a href="${siteUrl}/cabinet/settings" style="color:#6B7280">Налаштування</a></p>
  </div>
</div>`,
        });
      } catch (e) {
        console.error("[sync-status] email send failed:", e);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
