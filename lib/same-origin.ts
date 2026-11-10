import { NextResponse } from "next/server";
import { SITE_URL } from "@/lib/email-template";

// Cheap, stateless CSRF guard for state-changing POSTs. Browsers always send
// an Origin header on cross-site POST/fetch, so a request whose Origin is
// present and isn't us is rejected. Requests with no Origin (curl, server
// to server) are let through — those aren't a CSRF vector, and the routes
// using this still apply their own auth/validation.
//
// "Us" = the host the request was addressed to (covers production, Vercel
// preview URLs and localhost), plus the canonical site domains.
const ALLOWED_ORIGINS = new Set(
  [SITE_URL, "https://mozhyvo.com.ua", "https://www.mozhyvo.com.ua"].map((u) => {
    try { return new URL(u).origin; } catch { return ""; }
  }).filter(Boolean),
);

export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  let o: URL;
  try { o = new URL(origin); } catch { return false; } // includes Origin: null
  if (ALLOWED_ORIGINS.has(o.origin)) return true;
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  return !!host && o.host === host;
}

export function foreignOriginResponse() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
