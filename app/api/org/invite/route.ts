import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  EMAIL_FROM, SITE_URL,
  wrapEmailTemplate, emailButton, emailHeading, emailText, emailInfoBox,
} from "@/lib/email-template";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { email, role } = await req.json() as { email: string; role: string };
  if (!email || !role) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const admin = createAdminClient();

  const { data: { users }, error: listError } = await admin.auth.admin.listUsers();
  if (listError) return NextResponse.json({ error: listError.message }, { status: 500 });

  const invitedUser = users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!invitedUser) {
    return NextResponse.json({
      error: "Цей користувач ще не зареєстрований на Моживо. Попросіть їх спочатку створити акаунт на сайті.",
    }, { status: 404 });
  }

  const { data: org } = await admin.from("orgs").select("id, name").eq("user_id", user.id).single();
  if (!org) return NextResponse.json({ error: "Org not found" }, { status: 404 });

  const roleLabel = role === "admin" ? "Адміністратора" : "Рецензента";

  await admin.auth.admin.updateUserById(invitedUser.id, {
    user_metadata: { ...invitedUser.user_metadata, has_org_access: true },
  });

  const { error: memberError } = await admin
    .from("org_members")
    .upsert({ org_id: org.id, user_id: invitedUser.id, role, invited_by: user.email }, { onConflict: "org_id,user_id" });

  if (memberError) {
    console.error("[invite] org_members insert failed:", memberError.message);
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  await admin.from("user_notifications").insert({
    user_id: invitedUser.id,
    type: "team_invite",
    title: "Вас додано до команди",
    message: `${org.name} додала вас як ${roleLabel}. Тепер у вас є доступ до дешборду організації.`,
    data: { org_id: org.id, org_name: org.name, role },
  });

  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: EMAIL_FROM,
        to: email,
        subject: `Вас додано до команди ${org.name} на Моживо`,
        html: wrapEmailTemplate(
          emailHeading("Вас додано до команди 🎉") +
          emailText(`<strong>${org.name}</strong> додала вас як <strong>${roleLabel}</strong> на Моживо.`) +
          emailText("Тепер у вас є доступ до дешборду організації — ви можете переглядати заявки та проєкти.") +
          emailInfoBox(`
            <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#1e3a8a;">Ваша роль: ${roleLabel}</p>
            <p style="margin:0;font-size:13px;color:#1e40af;">Організація: ${org.name}</p>`) +
          emailButton("Перейти до дешборду →", `${SITE_URL}/dashboard`),
          `Вас додано до команди ${org.name}`,
        ),
      });
    } catch (e) {
      console.error("[invite] email failed:", e);
    }
  }

  return NextResponse.json({ ok: true });
}
