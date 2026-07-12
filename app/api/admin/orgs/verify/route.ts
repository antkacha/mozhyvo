import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  EMAIL_FROM, SITE_URL,
  wrapEmailTemplate, emailButton, emailInfoBox, emailDivider,
} from "@/lib/email-template";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { orgId, action, rejectionReason } = await req.json() as {
    orgId: string;
    action: "verify" | "reject" | "block" | "unblock";
    rejectionReason?: string;
  };

  const admin = createAdminClient();

  const { data: org } = await admin
    .from("orgs")
    .select("name, contact_email, status")
    .eq("id", orgId)
    .single();

  if (!org) return NextResponse.json({ error: "Org not found" }, { status: 404 });

  const updates: Record<string, unknown> = {};
  if (action === "verify")   { updates.status = "verified"; updates.verified_at = new Date().toISOString(); }
  if (action === "reject")   { updates.status = "rejected"; updates.rejection_reason = rejectionReason ?? ""; }
  if (action === "block")    { updates.status = "blocked"; }
  if (action === "unblock")  { updates.status = "verified"; }

  await admin.from("orgs").update(updates).eq("id", orgId);

  if (org.contact_email && process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);

    if (action === "verify") {
      await resend.emails.send({
        from: EMAIL_FROM,
        to:   org.contact_email,
        subject: `✅ «${org.name}» верифіковано на Моживо`,
        html: wrapEmailTemplate(
          emailInfoBox(`
            <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#1e3a8a;">Що тепер доступно:</p>
            <ul style="font-size:14px;color:#1e40af;margin:0;padding-left:20px;line-height:1.9;">
              <li>Публікуйте необмежену кількість програм та можливостей</li>
              <li>Ваші програми одразу з&apos;являються в каталозі для молоді</li>
              <li>Отримуйте та обробляйте заявки від учасників</li>
            </ul>`) +
          emailButton("Відкрити кабінет →", `${SITE_URL}/dashboard`) +
          emailDivider() +
          `<p style="font-size:13px;color:#9CA3AF;margin:0;">Маєте питання? <a href="mailto:hello@mozhyvo.com.ua" style="color:#3B4FE8;">hello@mozhyvo.com.ua</a></p>`,
          {
            heading: "Організацію верифіковано!",
            subtitle: `Вітаємо! ${org.name} пройшла перевірку на Моживо. Тепер ви можете публікувати програми для молоді.`,
            preview: `«${org.name}» верифіковано на Моживо`,
          },
        ),
      });
    }

    if (action === "reject" && rejectionReason) {
      await resend.emails.send({
        from: EMAIL_FROM,
        to:   org.contact_email,
        subject: `Щодо верифікації «${org.name}» на Моживо`,
        html: wrapEmailTemplate(
          emailInfoBox(`
            <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#92400E;">Причина відмови:</p>
            <p style="margin:0;font-size:14px;color:#78350F;">${rejectionReason}</p>`, "#FFF7ED") +
          emailButton("Написати адміністратору", `mailto:hello@mozhyvo.com.ua`),
          {
            heading: "Результат верифікації",
            subtitle: `На жаль, ми не змогли верифікувати організацію ${org.name}. Якщо вважаєте, що сталася помилка — напишіть нам.`,
            preview: `Результат верифікації ${org.name}`,
          },
        ),
      });
    }
  }

  return NextResponse.json({ ok: true });
}
