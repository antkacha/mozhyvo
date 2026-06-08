import { type NextRequest, NextResponse } from "next/server";

// Session cookie refresh is handled client-side via onAuthStateChange.
// This middleware is a pass-through; Supabase is intentionally not imported
// here because @supabase/supabase-js uses process.version which is not
// available in the Edge Runtime.
export function middleware(request: NextRequest) {
  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
