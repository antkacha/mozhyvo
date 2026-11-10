import { NextRequest, NextResponse } from "next/server";
import { EMAIL_FROM, wrapEmailTemplate, emailInfoBox, emailText, escapeHtml } from "@/lib/email-template";
import { rateLimit, clientIp } from "@/lib/rate-limit";
import { isSameOrigin, foreignOriginResponse } from "@/lib/same-origin";

// Public contact form → one notification email to the team inbox. Nothing is
// ever sent to the submitter-supplied address (no auto-reply), so the form
// can't be used to mail third parties; their address only appears as text
// and as Reply-To on the team's copy.

const TEAM_INBOX = "mozhyvo@gmail.com";
const LIMITS = { name: 100, email: 254, subject: 150, message: 5000 } as const;
const EMAIL_RE = /^[^\s@<>"'(),;:\\[\]]+@[^\s@<>"'(),;:\\[\]]+\.[^\s@<>"'(),;:\\[\]]+$/;
// The form reports how long it was open; bots that post instantly (or don't
// send it) get a fake success. A client-measured duration, not a timestamp,
// so a wrong clock on the user's device can't silently drop real messages.
const MIN_FILL_MS = 3000;

/** One line, no control chars (CR/LF would allow header injection in Subject). */
const oneLine = (s: string) => s.replace(/[\r\n\t\u0000-\u001f\u007f]+/g, " ").replace(/\s{2,}/g, " ").trim();

const fakeOk = () => NextResponse.json({ ok: true });

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return foreignOriginResponse();

  // Per-IP throttle — best-effort, per serverless instance (see lib/rate-limit).
  if (!rateLimit(`contact:${clientIp(req)}`, 5, 10 * 60_000)) {
    return NextResponse.json({ error: "Забагато повідомлень. Спробуйте пізніше." }, { status: 429 });
  }

  const body = await req.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  const str = (v: unknown) => (typeof v === "string" ? v : "");

  // Honeypot (hidden "website" field) or a too-fast submit → pretend success, send nothing.
  const elapsed = typeof body.elapsedMs === "number" ? body.elapsedMs : 0;
  if (str(body.website).trim() !== "" || !(elapsed >= MIN_FILL_MS)) return fakeOk();

  const name = oneLine(str(body.name));
  const email = str(body.email).trim();
  const subject = oneLine(str(body.subject));
  const message = str(body.message).replace(/\r\n?/g, "\n").trim();

  if (
    !name || name.length > LIMITS.name ||
    !email || email.length > LIMITS.email || !EMAIL_RE.test(email) ||
    !subject || subject.length > LIMITS.subject ||
    message.length < 10 || message.length > LIMITS.message
  ) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "Email service not configured" }, { status: 503 });
  }

  const nameHtml = escapeHtml(name);
  const emailHtml = escapeHtml(email);

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: EMAIL_FROM,
      to: TEAM_INBOX,
      replyTo: email,
      subject: `[Контакти] ${subject} — від ${name}`,
      html: wrapEmailTemplate(
        emailInfoBox(`
          <p style="margin:0 0 6px;font-size:13px;"><strong>Тема:</strong> ${escapeHtml(subject)}</p>
          <p style="margin:0;font-size:13px;"><strong>Відповісти:</strong> ${emailHtml}</p>
        `) +
        emailText(escapeHtml(message).replace(/\n/g, "<br/>")),
        {
          heading: "Нове повідомлення",
          subtitle: `Від ${nameHtml}`,
          preview: `Повідомлення від ${nameHtml}`,
        },
      ),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] send error:", err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
