import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { EMAIL_FROM, wrapEmailTemplate, emailText } from "@/lib/email-template";

export async function POST(req: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { subject, body, segment } = await req.json() as {
    subject: string;
    body: string;
    segment: "all" | "users" | "orgs";
  };

  if (!subject?.trim() || !body?.trim() || !segment) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "RESEND_API_KEY not set" }, { status: 500 });

  const admin = createAdminClient();

  const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const authUsers = authData?.users ?? [];

  const { data: profiles } = await admin.from("profiles").select("id, role");
  const roleMap: Record<string, string> = {};
  for (const p of profiles ?? []) {
    roleMap[(p as { id: string; role: string }).id] = (p as { id: string; role: string }).role;
  }

  const emails = authUsers
    .filter((u) => {
      if (!u.email) return false;
      const role = roleMap[u.id] ?? "user";
      if (segment === "all") return true;
      if (segment === "users") return role === "user";
      if (segment === "orgs") return role === "org" || role === "coordinator";
      return false;
    })
    .map((u) => u.email as string);

  if (emails.length === 0) {
    return NextResponse.json({ success: true, count: 0 });
  }

  const html = wrapEmailTemplate(
    body.split("\n\n").map((para) => emailText(para.replace(/\n/g, "<br>"))).join(""),
    { heading: subject, preview: subject },
  );

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  const BATCH = 50;
  let sent = 0;
  for (let i = 0; i < emails.length; i += BATCH) {
    const batch = emails.slice(i, i + BATCH).map((to) => ({
      from: EMAIL_FROM,
      to,
      subject,
      html,
    }));
    const { error } = await resend.batch.send(batch);
    if (!error) sent += batch.length;
  }

  return NextResponse.json({ success: true, count: sent });
}
