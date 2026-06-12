import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { action, role } = await req.json() as { action?: string; role?: string };
  const admin = createAdminClient();
  const targetId = params.id;

  if (action === "ban") {
    const { error } = await admin.auth.admin.updateUserById(targetId, {
      ban_duration: "876000h", // ~100 years
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (action === "unban") {
    const { error } = await admin.auth.admin.updateUserById(targetId, {
      ban_duration: "none",
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (action === "set_role" && role) {
    const { error } = await admin.from("profiles").upsert({ id: targetId, role }, { onConflict: "id" });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
