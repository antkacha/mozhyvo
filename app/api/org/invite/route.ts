import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mozhyvo.vercel.app";

async function sendInviteViaResend(email: string, invitedBy: string, role: string, inviteLink: string) {
  if (!process.env.RESEND_API_KEY) return;
  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "Моживо <onboarding@resend.dev>",
    to: email,
    subject: "Запрошення до команди на Моживо",
    html: `
      <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:40px 28px;background:#fff;color:#0F0F0F">
        <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:28px">
          <div style="background:#3B4FE8;border-radius:10px;width:36px;height:36px;display:flex;align-items:center;justify-content:center">
            <span style="color:white;font-weight:900;font-size:16px">М</span>
          </div>
          <span style="font-weight:900;font-size:20px;color:#0F0F0F">Моживо</span>
        </div>
        <h1 style="font-size:22px;font-weight:800;margin:0 0 12px">Вас запрошено до команди</h1>
        <p style="font-size:15px;color:#4B5563;line-height:1.7;margin:0 0 8px">
          <strong>${invitedBy}</strong> запросив вас як <strong>${role}</strong> на платформі Моживо.
        </p>
        <p style="font-size:15px;color:#4B5563;line-height:1.7;margin:0">
          Натисніть кнопку нижче, щоб прийняти запрошення і налаштувати акаунт.
        </p>
        <a href="${inviteLink}" style="display:inline-block;margin-top:24px;background:#3B4FE8;color:white;padding:14px 32px;border-radius:50px;font-weight:700;font-size:15px;text-decoration:none">
          Прийняти запрошення →
        </a>
        <p style="font-size:12px;color:#9CA3AF;margin-top:20px">
          Якщо посилання не працює: <span style="color:#3B4FE8;word-break:break-all">${inviteLink}</span>
        </p>
        <div style="margin-top:32px;padding-top:20px;border-top:1px solid #F0F0F0;color:#9CA3AF;font-size:12px">
          <p style="margin:0">Моживо — платформа можливостей для молоді України</p>
        </div>
      </div>`,
  });
}

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email, role } = await req.json() as { email: string; role: string };
  if (!email || !role) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const admin = createAdminClient();
  const redirectTo = `${SITE_URL}/auth/confirm?next=/dashboard`;
  const roleLabel = role === "admin" ? "Адміністратора" : "Рецензента";

  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo,
    data: { role: "org", invited_role: role, invited_by: user.email },
  });

  console.log("[invite] email:", email, "error:", error?.message ?? "none", "data:", !!data);

  if (error) {
    if (error.message.toLowerCase().includes("already")) {
      return NextResponse.json({
        ok: false,
        error: "Цей email вже зареєстрований на Моживо. Попросіть їх увійти самостійно.",
      }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Supabase sends invite via configured SMTP.
  // Also send via Resend as backup in case SMTP invite doesn't arrive.
  const inviteLink = data?.user?.confirmation_sent_at ? redirectTo : redirectTo;
  try {
    await sendInviteViaResend(email, user.email ?? "Команда Моживо", roleLabel, redirectTo);
    console.log("[invite] resend backup sent to:", email);
  } catch (e) {
    console.error("[invite] resend backup failed:", e);
  }

  return NextResponse.json({ ok: true });
}
