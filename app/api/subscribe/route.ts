import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { email, firstName } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Невірний email" }, { status: 400 });
    }

    // Save to Supabase newsletter_subscribers table (create if needed)
    // For now we log and send a welcome email via Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);

      await resend.emails.send({
        from:    "Моживо <noreply@mozhyvo.com>",
        to:      email,
        subject: "Ти підписався на Моживо 🎉",
        html: `
          <div style="font-family: system-ui, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; background: #ffffff;">
            <div style="width: 44px; height: 44px; background: #3B4FE8; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 24px;">
              <span style="color: white; font-weight: 900; font-size: 20px;">М</span>
            </div>
            <h1 style="font-size: 24px; font-weight: 900; color: #0F0F0F; margin: 0 0 8px;">
              Дякуємо за підписку${firstName ? `, ${firstName}` : ""}!
            </h1>
            <p style="color: #6B7280; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
              Тепер ти будеш першим дізнаватись про нові гранти, стипендії та обміни для молоді України.
            </p>
            <a href="https://mozhyvo.ua/opportunities" style="display: inline-block; padding: 12px 28px; background: #3B4FE8; color: white; border-radius: 100px; font-weight: 700; font-size: 14px; text-decoration: none;">
              Переглянути можливості →
            </a>
            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0;" />
            <p style="color: #9CA3AF; font-size: 12px;">
              Ти отримуєш цей лист тому що підписався на розсилку Моживо.<br>
              <a href="https://mozhyvo.ua" style="color: #6B7280;">mozhyvo.ua</a>
            </p>
          </div>
        `,
      });
    }

    // Also save to Supabase if we have a newsletter_subscribers table
    try {
      const supabase = await createClient();
      await supabase
        .from("newsletter_subscribers")
        .upsert({ email, first_name: firstName ?? null, subscribed_at: new Date().toISOString() }, { onConflict: "email" });
    } catch {
      // Table may not exist yet — not a hard failure
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json({ error: "Помилка сервера" }, { status: 500 });
  }
}
