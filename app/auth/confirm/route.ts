import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Pass all params through to the client-side handler page
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const params = searchParams.toString();
  return NextResponse.redirect(`${origin}/auth/verified${params ? `?${params}` : ""}`);
}
