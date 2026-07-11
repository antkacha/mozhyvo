export const EMAIL_FROM = "Моживо <hello@mozhyvo.com.ua>";
export const SITE_URL   = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mozhyvo.com.ua";

export function wrapEmailTemplate(content: string, preview?: string): string {
  return `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  ${preview ? `<meta name="x-apple-disable-message-reformatting" /><div style="display:none;max-height:0;overflow:hidden;">${preview}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>` : ""}
</head>
<body style="margin:0;padding:0;background:#F4F4F5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4F4F5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">

          <!-- Logo header -->
          <tr>
            <td style="padding:0 0 20px 0;">
              <a href="${SITE_URL}" style="display:inline-flex;align-items:center;gap:10px;text-decoration:none;">
                <div style="background:#3B4FE8;border-radius:12px;width:40px;height:40px;display:inline-flex;align-items:center;justify-content:center;">
                  <span style="color:#FFD600;font-weight:900;font-size:20px;line-height:1;">⚡</span>
                </div>
                <span style="font-size:22px;font-weight:900;color:#0F0F0F;letter-spacing:-0.5px;">Моживо</span>
              </a>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:20px;padding:40px 40px 36px;box-shadow:0 2px 16px rgba(0,0,0,0.06);">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 0 8px;text-align:center;">
              <p style="font-size:12px;color:#9CA3AF;margin:0 0 6px;">
                Моживо — платформа можливостей для молоді України
              </p>
              <p style="font-size:12px;color:#9CA3AF;margin:0;">
                <a href="${SITE_URL}" style="color:#9CA3AF;text-decoration:underline;">mozhyvo.com.ua</a>
                &nbsp;·&nbsp;
                <a href="mailto:hello@mozhyvo.com.ua" style="color:#9CA3AF;text-decoration:underline;">hello@mozhyvo.com.ua</a>
                &nbsp;·&nbsp;
                <a href="${SITE_URL}/cabinet/settings" style="color:#9CA3AF;text-decoration:underline;">Відписатися</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function emailButton(text: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;background:#3B4FE8;color:#ffffff;padding:14px 32px;border-radius:50px;font-weight:700;font-size:15px;text-decoration:none;margin-top:8px;">${text}</a>`;
}

export function emailHeading(text: string): string {
  return `<h1 style="font-size:24px;font-weight:800;color:#0F0F0F;margin:0 0 12px;line-height:1.3;">${text}</h1>`;
}

export function emailText(text: string): string {
  return `<p style="font-size:15px;line-height:1.7;color:#4B5563;margin:0 0 16px;">${text}</p>`;
}

export function emailInfoBox(content: string, color = "#3B4FE8"): string {
  const bg = color === "#3B4FE8" ? "#EEF0FD" : color === "#059669" ? "#ECFDF5" : "#FFF7ED";
  const border = color === "#3B4FE8" ? "#C7D0FB" : color === "#059669" ? "#A7F3D0" : "#FDE68A";
  return `<div style="background:${bg};border:1px solid ${border};border-radius:14px;padding:20px 24px;margin:20px 0;">${content}</div>`;
}

export function emailDivider(): string {
  return `<div style="height:1px;background:#F0F0F0;margin:24px 0;"></div>`;
}
