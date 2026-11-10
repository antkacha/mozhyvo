import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { PUBLIC_PROFILE_FIELDS, canViewPrivateProfile } from "@/lib/profile-visibility";

export const dynamic = "force-dynamic";

// Private fields this endpoint returns to an allowed viewer — only what the
// /u/[id] page shows. phone/email are never returned here.
const PRIVATE_RETURNED = ["country", "graduation_year", "linkedin_url", "cv_url", "telegram"] as const;

// GET /api/users/[id]/profile — the /u/[id] page. Public fields for everyone;
// contacts only for the person, admins, and orgs they applied to (see
// lib/profile-visibility). The answer depends on the viewer, so never cached.
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const noStore = { "Cache-Control": "private, no-store" };
  const { data: { user } } = await createClient().auth.getUser();
  const admin = createAdminClient();

  let full = false;
  try {
    full = await canViewPrivateProfile(user?.id, params.id, admin);
  } catch (e) {
    console.error("[users/profile] visibility check failed", e);
    full = false; // fail closed: public fields only
  }

  const cols = [...PUBLIC_PROFILE_FIELDS, ...(full ? PRIVATE_RETURNED : [])].join(", ");
  const { data: profile, error } = await admin
    .from("profiles")
    .select(cols)
    .eq("id", params.id)
    .maybeSingle();

  if (error || !profile) return NextResponse.json({ error: "Not found" }, { status: 404, headers: noStore });

  return NextResponse.json({ profile }, { headers: noStore });
}
