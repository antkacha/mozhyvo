import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Profile columns a user may edit on their own profile — exactly what the
// profile form sends (useProfile's toRow). Same allowlist pattern as
// ALLOWED_ORG_FIELDS / ALLOWED_PROJECT_FIELDS. role, id, created_at and
// anything else are never writable here: this route uses the service-role
// client, so RLS doesn't stand behind it.
const ALLOWED_PROFILE_FIELDS = new Set([
  "first_name", "last_name", "phone", "country", "institution", "degree",
  "languages", "bio", "city", "graduation_year", "avatar_url", "cv_url",
  "linkedin_url", "telegram", "interests", "onboarding_done",
]);

// Columns guaranteed to exist (pre-migration)
const BASE_COLS = new Set([
  "first_name", "last_name", "phone", "country",
  "institution", "degree", "languages", "bio",
]);

export async function PATCH(req: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null) as unknown;
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const safeBody = Object.fromEntries(
    Object.entries(body).filter(([k]) => ALLOWED_PROFILE_FIELDS.has(k))
  );
  if (Object.keys(safeBody).length === 0) {
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });
  }

  const admin = createAdminClient();

  // id last, from the session — the filtered fields can never retarget the row.
  const { error } = await admin
    .from("profiles")
    .upsert({ ...safeBody, id: user.id }, { onConflict: "id" });

  if (!error) return NextResponse.json({ ok: true });

  // If column doesn't exist yet (migration not run), fall back to base columns only
  if (error.message.includes("column") && error.message.includes("schema cache")) {
    const baseBody = Object.fromEntries(
      Object.entries(safeBody).filter(([k]) => BASE_COLS.has(k))
    );
    const { error: error2 } = await admin
      .from("profiles")
      .upsert({ ...baseBody, id: user.id }, { onConflict: "id" });

    if (!error2) return NextResponse.json({ ok: true, note: "saved base fields only" });
    return NextResponse.json({ error: error2.message }, { status: 500 });
  }

  console.error("[PATCH /api/me/profile] error:", error.message);
  return NextResponse.json({ error: error.message }, { status: 500 });
}
