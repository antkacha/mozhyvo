import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// DELETE — withdraw (cancel) an application
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = params;

  // Verify the application belongs to this user and is in a cancellable state
  const { data: app } = await supabase
    .from("applications")
    .select("id, status, opportunity_slug, email")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!app) return NextResponse.json({ error: "Application not found" }, { status: 404 });

  // Only allow withdrawal for pending/reviewing applications
  if (app.status === "accepted") {
    return NextResponse.json({ error: "Не можна скасувати прийняту заявку" }, { status: 400 });
  }

  // Delete the user's application
  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Also remove from org_applications (admin client bypasses RLS)
  const admin = createAdminClient();
  await admin
    .from("org_applications")
    .delete()
    .eq("opportunity_slug", app.opportunity_slug)
    .eq("email", app.email);

  return NextResponse.json({ ok: true });
}
