import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  EMAIL_FROM, SITE_URL,
  wrapEmailTemplate, emailButton, emailHeading, emailText, emailInfoBox,
} from "@/lib/email-template";

export async function POST(req: NextRequest) {
  try {
    const { email, firstName } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Невірний email" }, { status: 400 });
    }

    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from:    EMAIL_FROM,
        to:      email,
        subject: "Ти підписався на Моживо 🎉",
        html: wrapEmailTemplate(
          emailHeading(`Дякуємо за підписку${firstName ? `, ${firstName}` : ""}! 🎉`) +
          emailText("Тепер ти будеш першим дізнаватись про нові гранти, стипендії та обміни для молоді України.") +
          emailInfoBox(`
            <div style="display:flex;flex-direction:column;gap:8px;">
              <div style="display:flex;align-items:center;gap:10px;"><span style="font-size:16px;">🔍</span><span style="font-size:14px;color:#1e40af;">Гранти та стипендії з усього світу</span></div>
              <div style="display:flex;align-items:center;gap:10px;"><span style="font-size:16px;">🏛</span><span style="font-size:14px;color:#1e40af;">Обміни та волонтерські програми</span></div>
              <div style="display:flex;align-items:center;gap:10px;"><span style="font-size:16px;">🔔</span><span style="font-size:14px;color:#1e40af;">Нагадування про дедлайни</span></div>
            </div>`) +
          emailButton("Переглянути можливості →", `${SITE_URL}/opportunities`),
          "Ти підписався на розсилку Моживо",
        ),
      });
    }

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
