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

  // Try PKCE code exchange
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return redirect(supabase, origin, next);
  }

  // Try email OTP token_hash
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    if (!error) return redirect(supabase, origin, next);
  }

  // Both failed — but maybe the user is already logged in
  // (happens when Supabase creates session on signup before email is confirmed)
  const { data: { user } } = await supabase.auth.getUser();
  if (user) return redirect(supabase, origin, next, user);

  return NextResponse.redirect(`${origin}/login?error=auth`);
}

async function redirect(
  supabase: ReturnType<typeof createServerClient>,
  origin: string,
  next: string,
  existingUser?: Awaited<ReturnType<ReturnType<typeof createServerClient>["auth"]["getUser"]>>["data"]["user"]
) {
  const user = existingUser ?? (await supabase.auth.getUser()).data.user;
  const role = user?.user_metadata?.role;
  const destination = next !== "/"
    ? next
    : role === "org" ? "/dashboard" : "/cabinet";
  return NextResponse.redirect(`${origin}${destination}`);
}
