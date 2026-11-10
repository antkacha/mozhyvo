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

  // Only the author can delete. "Doesn't exist" and "someone else's" get the
  // same 404, so ids can't be probed.
  const { data, error } = await admin
    .from("org_app_notes")
    .delete()
    .eq("id", params.id)
    .eq("author_id", user.id)
    .select("id");
  if (error && error.code !== "22P02") return NextResponse.json({ error: "Server error" }, { status: 500 });
  if (!data?.length) return NextResponse.json({ error: "Note not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
