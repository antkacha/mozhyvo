import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  try {
    const admin = createAdminClient();
    const { data: row } = await admin
      .from("org_projects")
      .select("views")
      .eq("id", id)
      .maybeSingle();

    if (!row) return NextResponse.json({ ok: false }, { status: 404 });

    await admin
      .from("org_projects")
      .update({ views: (row.views ?? 0) + 1 })
      .eq("id", id);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
