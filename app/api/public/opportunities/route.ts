import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("org_projects")
    .select("*, orgs!inner(id, name, status, slug)")
    .eq("status", "published")
    .in("orgs.status", ["pending", "verified"])
    .or(`deadline.is.null,deadline.eq.,deadline.gte.${new Date().toISOString().split("T")[0]}`)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(
    { projects: data ?? [] },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } },
  );
}
