import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/";

  if (token_hash && type) {
    // Capture cookies before we know the redirect destination
    const pendingCookies: { name: string; value: string; options: Record<string, unknown> }[] = [];

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (list) =>
            list.forEach((c) => pendingCookies.push(c as typeof pendingCookies[number])),
        },
      }
    );

    const { data, error } = await supabase.auth.verifyOtp({ token_hash, type });

    if (!error) {
      // Determine destination based on user role
      const role = data.user?.user_metadata?.role as string | undefined;
      const isOrg = role === "org" || role === "coordinator";
      const destination =
        next !== "/"
          ? next
          : isOrg
          ? "/dashboard"
          : "/cabinet";

      const response = NextResponse.redirect(new URL(destination, origin).toString());
      pendingCookies.forEach(({ name, value, options }) =>
        response.cookies.set(name, value, options)
      );
      return response;
    }
  }

  // verifyOtp failed or no token — pass params to client page as fallback
  const params = searchParams.toString();
  return NextResponse.redirect(
    `${origin}/auth/verified${params ? `?${params}` : ""}`
  );
}
