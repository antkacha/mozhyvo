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

  const [authUsersRes, profilesRes, appsCountRes] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from("profiles").select("id, role"),
    admin.from("applications").select("user_id"),
  ]);

  const profileMap: Record<string, string> = {};
  for (const p of profilesRes.data ?? []) {
    profileMap[(p as { id: string; role: string }).id] = (p as { id: string; role: string }).role;
  }

  const appsMap: Record<string, number> = {};
  for (const a of appsCountRes.data ?? []) {
    const uid = (a as { user_id: string }).user_id;
    if (uid) appsMap[uid] = (appsMap[uid] ?? 0) + 1;
  }

  const users = (authUsersRes.data?.users ?? []).map((u) => {
    const meta = u.user_metadata ?? {};
    const firstName = (meta.first_name as string) ?? "";
    const lastName = (meta.last_name as string) ?? "";
    const name = [firstName, lastName].filter(Boolean).join(" ") || u.email?.split("@")[0] || "—";
    return {
      id: u.id,
      name,
      email: u.email ?? "",
      role: profileMap[u.id] ?? "user",
      banned: !!(u.banned_until && new Date(u.banned_until) > new Date()),
      applications: appsMap[u.id] ?? 0,
      joined: u.created_at,
    };
  });

  // Sort: admins first, then by join date desc
  users.sort((a, b) => {
    if (a.role === "admin" && b.role !== "admin") return -1;
    if (b.role === "admin" && a.role !== "admin") return 1;
    return new Date(b.joined).getTime() - new Date(a.joined).getTime();
  });

  return NextResponse.json({ users });
}
