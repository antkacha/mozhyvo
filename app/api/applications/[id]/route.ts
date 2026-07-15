import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// DELETE — withdraw (cancel) an application
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;

  // Pre-fetch to check cancellable status (user-client enforces ownership via RLS)
  const { data: app } = await supabase
    .from("applications")
    .select("id, status")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 });
  if (app.status === "accepted") {
    return NextResponse.json({ error: "Не можна скасувати прийняту заявку" }, { status: 400 });
  }

  // Atomic: DELETE applications + UPDATE org_applications → 'withdrawn'
  // RPC uses auth.uid() internally — no user_id parameter needed
  const { error } = await supabase.rpc("cancel_application", {
    p_application_id: id,
  });

  if (error) {
    if (error.code === "P0002") return NextResponse.json({ error: "Application not found" }, { status: 404 });
    console.error("[cancel_application]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
