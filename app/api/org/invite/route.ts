import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email, role } = await req.json() as { email: string; role: string };
  if (!email || !role) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const admin = createAdminClient();

  // Check if user with this email is registered
  const { data: { users }, error: listError } = await admin.auth.admin.listUsers();
  if (listError) return NextResponse.json({ error: listError.message }, { status: 500 });

  const found = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!found) {
    return NextResponse.json({
      error: "Цей користувач ще не зареєстрований на Моживо. Попросіть їх спочатку створити акаунт на сайті.",
    }, { status: 404 });
  }

  // User exists — notify them via Resend if API key is set
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mozhyvo.vercel.app";
      const roleLabel = role === "admin" ? "Адміністратора" : "Рецензента";

      await resend.emails.send({
        from: "Моживо <onboarding@resend.dev>",
        to: email,
        subject: "Вас додано до команди на Моживо",
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;padding:40px 28px;background:#fff">
            <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:28px">
              <div style="background:#3B4FE8;border-radius:10px;width:36px;height:36px;display:flex;align-items:center;justify-content:center">
                <span style="color:white;font-weight:900;font-size:16px">М</span>
              </div>
              <span style="font-weight:900;font-size:20px;color:#0F0F0F">Моживо</span>
            </div>
            <h1 style="font-size:22px;font-weight:800;margin:0 0 12px">Вас додано до команди</h1>
            <p style="font-size:15px;color:#4B5563;line-height:1.7;margin:0 0 8px">
              <strong>${user.email}</strong> додав вас як <strong>${roleLabel}</strong> організації на Моживо.
            </p>
            <p style="font-size:15px;color:#4B5563;line-height:1.7;margin:0">
              Увійдіть у свій акаунт щоб побачити дешборд організації.
            </p>
            <a href="${siteUrl}/dashboard" style="display:inline-block;margin-top:24px;background:#3B4FE8;color:white;padding:14px 32px;border-radius:50px;font-weight:700;font-size:15px;text-decoration:none">
              Перейти до дешборду →
            </a>
            <div style="margin-top:32px;padding-top:20px;border-top:1px solid #F0F0F0;color:#9CA3AF;font-size:12px">
              <p style="margin:0">Моживо — платформа можливостей для молоді України</p>
            </div>
          </div>`,
      });
    } catch (e) {
      console.error("[invite] resend failed:", e);
    }
  }

  return NextResponse.json({ ok: true });
}
