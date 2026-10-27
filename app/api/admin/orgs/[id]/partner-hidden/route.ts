import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePartners } from "@/lib/partners";

export const dynamic = "force-dynamic";

// Body: { hidden: boolean }. Writes only orgs.partner_hidden.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json().catch(() => null) as { hidden?: unknown } | null;
  if (typeof body?.hidden !== "boolean") {
    return NextResponse.json({ error: "hidden must be a boolean" }, { status: 400 });
  }

  const { data, error } = await createAdminClient()
    .from("orgs")
    .update({ partner_hidden: body.hidden })
    .eq("id", params.id)
    .select("id, partner_hidden")
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Org not found" }, { status: 404 });

  revalidatePartners();
  return NextResponse.json({ partner_hidden: data.partner_hidden });
}
