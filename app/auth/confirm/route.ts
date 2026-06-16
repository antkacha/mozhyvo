import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  let verified = false;

  // PKCE flow: Supabase redirects here with ?code=xxx after server-side token verify
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) verified = true;
  }

  // Email OTP flow: link contains token_hash + type directly
  if (!verified && token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) verified = true;
  }

  if (verified) {
    const { data: { user } } = await supabase.auth.getUser();
    const role = user?.user_metadata?.role;
    const destination = next !== "/"
      ? next
      : role === "org" ? "/dashboard" : "/cabinet";
    return NextResponse.redirect(`${origin}${destination}`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
