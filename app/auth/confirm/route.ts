import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";
  const destination = next === "/" ? "/cabinet" : next;

  // Try server-side OTP verification — works without PKCE verifier
  if (token_hash && type) {
    const successUrl = new URL(destination, origin).toString();
    const response = NextResponse.redirect(successUrl);
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (list) =>
            list.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            ),
        },
      }
    );
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) return response;
    // verifyOtp failed — fall through to client page so it can retry or pick up session
  }

  // For PKCE code, hash-fragment sessions, or failed OTP:
  // Pass everything to the client page which handles all remaining cases
  const params = searchParams.toString();
  return NextResponse.redirect(
    `${origin}/auth/verified${params ? `?${params}` : ""}`
  );
}
