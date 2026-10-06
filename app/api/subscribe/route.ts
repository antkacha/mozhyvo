import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import {
  EMAIL_FROM, SITE_URL,
  wrapEmailTemplate, emailButton, emailDivider, emailSectionLabel, emailFeatureRow, escapeHtml,
} from "@/lib/email-template";

const EMAIL_RE = /^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/;

export async function POST(req: NextRequest) {
  try {
    // Per-IP throttle (best-effort, per instance — see lib/rate-limit).
    if (!rateLimit(`subscribe:${clientIp(req)}`, 5, 10 * 60_000)) {
      return NextResponse.json({ error: "Забагато спроб. Спробуйте пізніше." }, { status: 429 });
    }

    const body = await req.json().catch(() => null) as { email?: unknown; firstName?: unknown } | null;
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
      return NextResponse.json({ error: "Невірний email" }, { status: 400 });
    }
    const firstName = typeof body?.firstName === "string" ? body.firstName.trim().slice(0, 60) || null : null;

    // An address that's already subscribed gets no second welcome email (and
    // its stored name isn't overwritten) — so this can't be used to mail the
    // same person repeatedly. If the table is missing, behave as before.
    let alreadySubscribed = false;
    try {
      const admin = createAdminClient();
      const { data: existing, error: lookupError } = await admin
        .from("newsletter_subscribers")
        .select("email")
        .eq("email", email)
        .limit(1);
      alreadySubscribed = !lookupError && !!existing?.length;
      if (!alreadySubscribed) {
        await admin
          .from("newsletter_subscribers")
          .upsert({ email, first_name: firstName, subscribed_at: new Date().toISOString() }, { onConflict: "email" });
      }
    } catch {
      // Not a hard failure if table doesn't exist yet
    }

    if (!alreadySubscribed && process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from:    EMAIL_FROM,
        to:      email,
        subject: "Ти підписався на МОЖUВО 🎉",
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
            heading: firstName ? `Дякуємо, ${escapeHtml(firstName)}!` : "Дякуємо за підписку!",
            subtitle: "Тепер ти будеш першим дізнаватись про нові гранти, стипендії та обміни для молоді України.",
            preview: "Ти підписався на розсилку МОЖUВО",
          },
        ),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json({ error: "Помилка сервера" }, { status: 500 });
  }
}
