import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// Admin-only: whether an org appears in the homepage "Партнери" strip.
// Writes show_as_partner and nothing else. The homepage additionally requires
// status = 'verified', so a flagged org that isn't verified stays hidden
// until it is.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null) as { show_as_partner?: unknown } | null;
  if (typeof body?.show_as_partner !== "boolean") {
    return NextResponse.json({ error: "show_as_partner must be boolean" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orgs")
    .update({ show_as_partner: body.show_as_partner })
    .eq("id", params.id)
    .select("id, show_as_partner, status")
    .maybeSingle();

  if (error) {
    console.error("[admin org partner] update failed:", error.message, "org:", params.id);
    return NextResponse.json({ error: "Не вдалося оновити" }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: "Org not found" }, { status: 404 });

  revalidatePath("/");
  return NextResponse.json({ ok: true, org: data });
}
