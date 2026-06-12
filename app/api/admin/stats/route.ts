import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const admin = createAdminClient();

  // Last 9 days range for charts
  const now = new Date();
  const days: string[] = [];
  for (let i = 8; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  const since = days[0] + "T00:00:00.000Z";

  const [
    usersRes,
    appsRes,
    orgsRes,
    pendingOrgsRes,
    pendingOppsRes,
    recentProfilesRes,
    orgAppsRes,
  ] = await Promise.all([
    admin.from("profiles").select("*", { count: "exact", head: true }),
    admin.from("applications").select("*", { count: "exact", head: true }),
    admin.from("orgs").select("*", { count: "exact", head: true }),
    admin.from("orgs").select("*", { count: "exact", head: true }).eq("status", "pending"),
    admin.from("org_projects").select("*", { count: "exact", head: true }).eq("status", "pending"),
    admin.from("profiles").select("created_at").gte("created_at", since),
    admin.from("org_applications").select("project_id, org_projects!inner(type, type_name)"),
  ]);

  // Registrations per day
  const registrationMap: Record<string, number> = {};
  days.forEach((d) => { registrationMap[d] = 0; });
  for (const row of recentProfilesRes.data ?? []) {
    const day = (row.created_at as string).slice(0, 10);
    if (day in registrationMap) registrationMap[day]++;
  }
  const registrations = days.map((d) => ({
    date: d.slice(5).replace("-", "."),
    users: registrationMap[d],
  }));

  // Applications by type
  const typeMap: Record<string, { type: string; typeName: string; count: number }> = {};
  for (const row of orgAppsRes.data ?? []) {
    const proj = (row as unknown as { org_projects: { type: string; type_name: string } }).org_projects;
    if (!proj) continue;
    const key = proj.type || "other";
    if (!typeMap[key]) typeMap[key] = { type: key, typeName: proj.type_name || key, count: 0 };
    typeMap[key].count++;
  }
  const appsByType = Object.values(typeMap).sort((a, b) => b.count - a.count);

  return NextResponse.json({
    totalUsers:   usersRes.count ?? 0,
    totalApps:    appsRes.count ?? 0,
    totalOrgs:    orgsRes.count ?? 0,
    pendingOrgs:  pendingOrgsRes.count ?? 0,
    pendingOpps:  pendingOppsRes.count ?? 0,
    registrations,
    appsByType,
  });
}
