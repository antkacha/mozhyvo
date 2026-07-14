import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Columns guaranteed to exist (pre-migration)
const BASE_COLS = new Set([
  "first_name", "last_name", "phone", "country",
  "institution", "degree", "languages", "bio",
]);

export async function PATCH(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as Record<string, unknown>;
  const admin = createAdminClient();

  // Try full upsert first
  const { error } = await admin
    .from("profiles")
    .upsert({ id: user.id, ...body }, { onConflict: "id" });

  if (!error) return NextResponse.json({ ok: true });

  // If column doesn't exist yet (migration not run), fall back to base columns only
  if (error.message.includes("column") && error.message.includes("schema cache")) {
    const safeBody = Object.fromEntries(
      Object.entries(body).filter(([k]) => BASE_COLS.has(k))
    );
    const { error: error2 } = await admin
      .from("profiles")
      .upsert({ id: user.id, ...safeBody }, { onConflict: "id" });

    if (!error2) return NextResponse.json({ ok: true, note: "saved base fields only" });
    return NextResponse.json({ error: error2.message }, { status: 500 });
  }

  console.error("[PATCH /api/me/profile] error:", error.message);
  return NextResponse.json({ error: error.message }, { status: 500 });
}
