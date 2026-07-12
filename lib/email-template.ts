const LOGO_URL = "https://lqtikyzevpjbtueajpsh.supabase.co/storage/v1/object/public/assets/mozhyvo-logo-white.png";

export const EMAIL_FROM = "Моживо <hello@mozhyvo.com.ua>";
export const SITE_URL   = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mozhyvo.com.ua";

export function wrapEmailTemplate(
  content: string,
  options: { heading: string; subtitle?: string; preview?: string },
): string {
  const { heading, subtitle, preview } = options;
  return `<!DOCTYPE html>
<html lang="uk">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
${preview ? `<div style="display:none;max-height:0;overflow:hidden;">${preview}&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ""}
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:40px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">
<tr><td style="border-radius:24px;overflow:hidden;box-shadow:0 4px 40px rgba(59,79,232,0.13);">
<table width="100%" cellpadding="0" cellspacing="0">

<tr><td style="background:#3B4FE8;padding:36px 44px 40px;">
  <img src="${LOGO_URL}" alt="Моживо" width="180" style="display:block;width:180px;height:auto;margin-bottom:32px;"/>
  <h1 style="margin:0 0 12px;font-size:28px;font-weight:900;color:#ffffff;line-height:1.25;">${heading}</h1>
  ${subtitle ? `<p style="margin:0;font-size:15px;color:rgba(255,255,255,0.85);line-height:1.7;">${subtitle}</p>` : ""}
</td></tr>

<tr><td style="background:#ffffff;padding:36px 44px 44px;">
  ${content}
</td></tr>

</table>
</td></tr>

<tr><td style="padding:24px 0 8px;text-align:center;">
  <p style="font-size:12px;color:#9CA3AF;margin:0 0 4px;">Моживо — платформа можливостей для молоді України</p>
  <p style="font-size:12px;color:#9CA3AF;margin:0;">
    <a href="${SITE_URL}" style="color:#9CA3AF;text-decoration:underline;">mozhyvo.com.ua</a>
    &nbsp;·&nbsp;
    <a href="mailto:hello@mozhyvo.com.ua" style="color:#9CA3AF;text-decoration:underline;">hello@mozhyvo.com.ua</a>
    &nbsp;·&nbsp;
    <a href="${SITE_URL}/cabinet/settings" style="color:#9CA3AF;text-decoration:underline;">Відписатися</a>
  </p>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

export function emailButton(text: string, href: string, note?: string): string {
  return `<table width="100%" cellpadding="0" cellspacing="0">
<tr><td style="text-align:center;padding:4px 0 28px;">
  <a href="${href}" style="display:inline-block;background:#3B4FE8;color:#ffffff;padding:17px 52px;border-radius:100px;font-weight:700;font-size:16px;text-decoration:none;">${text}</a>
  ${note ? `<p style="font-size:12px;color:#9CA3AF;margin:12px 0 0;">${note}</p>` : ""}
</td></tr>
</table>`;
}

export function emailText(text: string): string {
  return `<p style="font-size:15px;line-height:1.7;color:#4B5563;margin:0 0 16px;">${text}</p>`;
}

export function emailInfoBox(content: string, color = "#3B4FE8"): string {
  const bg     = color === "#3B4FE8" ? "#EEF0FD" : color === "#059669" ? "#ECFDF5" : "#FFF7ED";
  const border = color === "#3B4FE8" ? "#C7D0FB" : color === "#059669" ? "#A7F3D0" : "#FDE68A";
  return `<div style="background:${bg};border:1px solid ${border};border-radius:14px;padding:20px 24px;margin:0 0 24px;">${content}</div>`;
}

export function emailDivider(): string {
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;"><tr><td style="height:1px;background:#F3F4F6;"></td></tr></table>`;
}

export function emailSectionLabel(text: string): string {
  return `<p style="font-size:11px;font-weight:700;color:#9CA3AF;margin:0 0 16px;text-transform:uppercase;letter-spacing:0.08em;">${text}</p>`;
}

export function emailFeatureRow(icon: string, bg: string, title: string, sub: string): string {
  return `<tr><td style="padding-bottom:14px;">
<table cellpadding="0" cellspacing="0"><tr>
  <td style="width:44px;height:44px;background:${bg};border-radius:12px;text-align:center;vertical-align:middle;font-size:20px;">${icon}</td>
  <td style="padding-left:14px;vertical-align:middle;">
    <p style="margin:0;font-size:14px;font-weight:700;color:#0F0F0F;">${title}</p>
    <p style="margin:3px 0 0;font-size:13px;color:#6B7280;">${sub}</p>
  </td>
</tr></table>
</td></tr>`;
}
