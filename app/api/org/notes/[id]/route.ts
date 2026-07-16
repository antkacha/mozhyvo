import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();

  const { data: note } = await admin
    .from("org_app_notes")
    .select("id, author_id")
    .eq("id", params.id)
    .single();

  if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 });
  if (note.author_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { error } = await admin.from("org_app_notes").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
