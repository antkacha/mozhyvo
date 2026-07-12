import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  EMAIL_FROM, SITE_URL,
  wrapEmailTemplate, emailButton, emailDivider, emailSectionLabel, emailFeatureRow,
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
          emailButton("Переглянути можливості →", `${SITE_URL}/opportunities`) +
          emailDivider() +
          emailSectionLabel("Що тебе чекає") +
          `<table width="100%" cellpadding="0" cellspacing="0">
            ${emailFeatureRow("🔍", "#EEF0FD", "Гранти та стипендії", "З усього світу — в одному місці")}
            ${emailFeatureRow("🏛", "#ECFDF5", "Обміни та волонтерство", "Програми для молоді України")}
            ${emailFeatureRow("🔔", "#FFF7ED", "Нагадування про дедлайни", "Не пропустіть важливі дати")}
          </table>`,
          {
            heading: firstName ? `Дякуємо, ${firstName}!` : "Дякуємо за підписку!",
            subtitle: "Тепер ти будеш першим дізнаватись про нові гранти, стипендії та обміни для молоді України.",
            preview: "Ти підписався на розсилку Моживо",
          },
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
