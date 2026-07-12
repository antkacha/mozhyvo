import { NextRequest, NextResponse } from "next/server";
import { EMAIL_FROM, wrapEmailTemplate, emailInfoBox, emailText } from "@/lib/email-template";

export async function POST(req: NextRequest) {
  const { name, email, subject, message } = await req.json() as {
    name: string; email: string; subject: string; message: string;
  };

  if (!name?.trim() || !email?.includes("@") || !subject || message?.trim().length < 10) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Email service not configured" }, { status: 503 });
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: EMAIL_FROM,
      to: "mozhyvo@gmail.com",
      replyTo: email,
      subject: `[Контакти] ${subject} — від ${name}`,
      html: wrapEmailTemplate(
        emailInfoBox(`
          <p style="margin:0 0 6px;font-size:13px;"><strong>Тема:</strong> ${subject}</p>
          <p style="margin:0;font-size:13px;"><strong>Відповісти:</strong> <a href="mailto:${email}" style="color:#3B4FE8;">${email}</a></p>
        `) +
        emailText(message.replace(/\n/g, "<br/>")),
        {
          heading: "Нове повідомлення",
          subtitle: `Від ${name}`,
          preview: `Повідомлення від ${name}`,
        },
      ),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] send error:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
