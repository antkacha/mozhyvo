/**
 * Post-login redirect target: only a same-site path ("/cabinet/..."), never
 * an absolute or protocol-relative URL ("https://x", "//x", "/\\x") or one
 * that could be glued onto our origin as userinfo ("@x").
 */
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return null;
  if (/[\u0000-\u001f\u007f]/.test(next)) return null;
  return next;
}

/** Cookie that carries `next` through the Google OAuth round trip to /auth/callback. */
export const AFTER_LOGIN_COOKIE = "mzv_after_login";
