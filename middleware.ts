import { type NextRequest, NextResponse } from "next/server";

// Route protection: /cabinet and /admin require auth.
// Supabase cannot run in Edge Runtime, so full role checks
// happen in Server Component layouts. Here we only do a quick
// cookie-presence check to avoid unnecessary round-trips.

const PROTECTED = ["/cabinet", "/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PROTECTED.some((p) => pathname.startsWith(p))) {
    const hasCookie = Array.from(request.cookies.getAll()).some(
      (c) => c.name.includes("auth-token") || c.name.startsWith("sb-")
    );
    if (!hasCookie) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
