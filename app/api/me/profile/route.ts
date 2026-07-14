import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as Record<string, unknown>;

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .upsert({ id: user.id, ...body, updated_at: new Date().toISOString() }, { onConflict: "id" });

  if (error) {
    console.error("[PATCH /api/me/profile] error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
