import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/partners-admin";

export const dynamic = "force-dynamic";

// Body: { ids: string[] } — every partner id, in the new display order.
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const body = await req.json().catch(() => null) as { ids?: unknown } | null;
  const ids = body?.ids;
  if (!Array.isArray(ids) || !ids.every((x) => typeof x === "string") || new Set(ids).size !== ids.length) {
    return NextResponse.json({ error: "ids must be an array of unique strings" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: all, error: listError } = await admin.from("partners").select("id");
  if (listError) return NextResponse.json({ error: listError.message }, { status: 500 });
  const known = new Set((all ?? []).map((p) => p.id as string));
  // Must be the complete list, so no partner is left with a stale position.
  if (ids.length !== known.size || !ids.every((id) => known.has(id))) {
    return NextResponse.json({ error: "Список змінився — оновіть сторінку" }, { status: 409 });
  }

  const now = new Date().toISOString();
  const results = await Promise.all(
    (ids as string[]).map((id, i) =>
      admin.from("partners").update({ sort_order: i, updated_at: now }).eq("id", id)),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return NextResponse.json({ error: failed.error.message }, { status: 500 });

  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
