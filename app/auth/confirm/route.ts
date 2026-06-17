import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  const destination = next === "/" ? "/cabinet" : next;
  const successUrl = new URL(destination, origin).toString();
  const errorUrl = `${origin}/login?error=auth`;

  function makeSupabase(response: NextResponse) {
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (list) => list.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
        },
      }
    );
  }

  // Supabase email confirmation sends token_hash + type (no PKCE verifier needed)
  if (token_hash && type) {
    const response = NextResponse.redirect(successUrl);
    const supabase = makeSupabase(response);
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) return response;
  }

  // PKCE OAuth-style code (browser client stored verifier in localStorage → fall back to client page)
  if (code) {
    const params = searchParams.toString();
    return NextResponse.redirect(`${origin}/auth/verified${params ? `?${params}` : ""}`);
  }

  return NextResponse.redirect(errorUrl);
}
