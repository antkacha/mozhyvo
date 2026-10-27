import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Admin check for /api/admin routes: 401 when signed out, 403 when not an admin. */
export async function requireAdmin(): Promise<NextResponse | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return null;
}
