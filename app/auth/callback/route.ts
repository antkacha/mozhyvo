import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { safeNextPath, AFTER_LOGIN_COOKIE } from "@/lib/safe-next";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const cookieStore = cookies();
  // ?next= or, for Google sign-in from /login?next=…, the short-lived cookie
  // the login page set. Only same-site paths are honoured.
  const next =
    safeNextPath(searchParams.get("next")) ??
    safeNextPath((() => { try { return decodeURIComponent(cookieStore.get(AFTER_LOGIN_COOKIE)?.value ?? ""); } catch { return null; } })()) ??
    "/";

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
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

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      if (next !== "/") {
        const res = NextResponse.redirect(`${origin}${next}`);
        res.cookies.set(AFTER_LOGIN_COOKIE, "", { path: "/", maxAge: 0 });
        return res;
      }
      // No explicit next — use role-based default so Google OAuth lands in the right place
      const { data: { user } } = await supabase.auth.getUser();
      const role = user?.user_metadata?.role as string | undefined;
      const dest = (role === "org" || role === "coordinator") ? "/dashboard" : "/cabinet";
      return NextResponse.redirect(`${origin}${dest}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
