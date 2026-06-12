import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  // Auth check — must be admin
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

  // Get org details for email
  const { data: org } = await admin
    .from("orgs")
    .select("name, contact_email, status")
    .eq("id", orgId)
    .single();

  if (!org) return NextResponse.json({ error: "Org not found" }, { status: 404 });

  // Update status
  const updates: Record<string, unknown> = {};
  if (action === "verify")   { updates.status = "verified"; updates.verified_at = new Date().toISOString(); }
  if (action === "reject")   { updates.status = "rejected"; updates.rejection_reason = rejectionReason ?? ""; }
  if (action === "block")    { updates.status = "blocked"; }
  if (action === "unblock")  { updates.status = "verified"; }

  await admin.from("orgs").update(updates).eq("id", orgId);

  // Send email
  const resend = new Resend(process.env.RESEND_API_KEY);
  if (org.contact_email && process.env.RESEND_API_KEY) {
    if (action === "verify") {
      await resend.emails.send({
        from: "Моживо <noreply@mozhyvo.com>",
        to:   org.contact_email,
        subject: `✅ «${org.name}» верифіковано на Моживо`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#0F0F0F">
            <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:24px">
              <div style="background:#3B4FE8;border-radius:10px;width:32px;height:32px;display:flex;align-items:center;justify-content:center">
                <span style="color:white;font-weight:900;font-size:14px">М</span>
              </div>
              <span style="font-weight:900;font-size:18px">Моживо</span>
            </div>
            <h1 style="font-size:22px;font-weight:800;margin:0 0 12px">Вашу організацію верифіковано! 🎉</h1>
            <p style="font-size:15px;line-height:1.6;color:#6B7280;margin:0 0 24px">
              Вітаємо! Організація <strong style="color:#0F0F0F">${org.name}</strong> пройшла перевірку на платформі Моживо.
            </p>
            <div style="background:#EEF0FD;border-radius:12px;padding:20px;margin-bottom:24px">
              <p style="font-size:14px;font-weight:700;color:#3B4FE8;margin:0 0 8px">Що тепер доступно:</p>
              <ul style="font-size:14px;color:#374151;margin:0;padding-left:20px;line-height:1.8">
                <li>Публікуйте необмежену кількість програм та можливостей</li>
                <li>Ваші програми одразу з'являються в каталозі для молоді</li>
                <li>Отримуйте та обробляйте заявки від учасників</li>
              </ul>
            </div>
            <a href="https://mozhyvo.ua/dashboard" style="display:inline-block;background:#3B4FE8;color:white;padding:12px 28px;border-radius:50px;font-weight:700;font-size:14px;text-decoration:none">
              Відкрити кабінет →
            </a>
            <p style="font-size:12px;color:#9CA3AF;margin-top:32px">
              Маєте питання? Напишіть нам: <a href="mailto:mozhyvo@gmail.com" style="color:#3B4FE8">mozhyvo@gmail.com</a>
            </p>
          </div>
        `,
      });
    }

    if (action === "reject" && rejectionReason) {
      await resend.emails.send({
        from: "Моживо <noreply@mozhyvo.com>",
        to:   org.contact_email,
        subject: `Щодо верифікації «${org.name}» на Моживо`,
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;color:#0F0F0F">
            <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:24px">
              <div style="background:#3B4FE8;border-radius:10px;width:32px;height:32px;display:flex;align-items:center;justify-content:center">
                <span style="color:white;font-weight:900;font-size:14px">М</span>
              </div>
              <span style="font-weight:900;font-size:18px">Моживо</span>
            </div>
            <h1 style="font-size:22px;font-weight:800;margin:0 0 12px">Результат верифікації</h1>
            <p style="font-size:15px;line-height:1.6;color:#6B7280;margin:0 0 16px">
              На жаль, ми не змогли верифікувати організацію <strong style="color:#0F0F0F">${org.name}</strong>.
            </p>
            <div style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:12px;padding:16px;margin-bottom:24px">
              <p style="font-size:13px;font-weight:700;color:#92400E;margin:0 0 6px">Причина:</p>
              <p style="font-size:14px;color:#78350F;margin:0">${rejectionReason}</p>
            </div>
            <p style="font-size:14px;color:#6B7280;line-height:1.6">
              Якщо ви вважаєте, що сталася помилка, або хочете надати додаткові документи — напишіть нам.
            </p>
            <a href="mailto:mozhyvo@gmail.com" style="display:inline-block;margin-top:16px;background:#0F0F0F;color:white;padding:12px 28px;border-radius:50px;font-weight:700;font-size:14px;text-decoration:none">
              Написати адміністратору
            </a>
          </div>
        `,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
