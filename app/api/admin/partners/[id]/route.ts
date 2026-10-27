import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  requireAdmin, parseName, parseLink, parseBool, processLogo, uploadLogo,
  deleteLogoByUrl, inputErrorResponse, PartnerInputError,
} from "@/lib/partners-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COLUMNS = "id, name, logo_url, link_url, sort_order, is_active, created_at, updated_at";

// Multipart; every field optional: name, link_url ("" clears it), is_active,
// logo (file → replaces the old one), remove_logo ("true" → clears it).
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("partners").select("id, logo_url").eq("id", params.id).maybeSingle();
  if (!existing) return NextResponse.json({ error: "Partner not found" }, { status: 404 });

  let uploadedUrl: string | null = null;
  try {
    const form = await req.formData().catch(() => {
      throw new PartnerInputError("Очікується multipart/form-data");
    });

    // Allowlist: only these columns are ever written.
    const updates: {
      name?: string; link_url?: string | null; is_active?: boolean;
      logo_url?: string | null; updated_at: string;
    } = { updated_at: new Date().toISOString() };

    if (form.has("name")) updates.name = parseName(form.get("name"));
    if (form.has("link_url")) updates.link_url = parseLink(form.get("link_url"));
    const active = parseBool(form.get("is_active"));
    if (active !== undefined) updates.is_active = active;

    const logo = form.get("logo");
    if (logo instanceof File && logo.size > 0) {
      uploadedUrl = await uploadLogo(params.id, await processLogo(logo));
      updates.logo_url = uploadedUrl;
    } else if (form.get("remove_logo") === "true") {
      updates.logo_url = null;
    }

    const { data, error } = await admin
      .from("partners").update(updates).eq("id", params.id).select(COLUMNS).single();
    if (error) throw new Error(error.message);

    // Old file goes only after the row points at the new one.
    if ("logo_url" in updates && existing.logo_url !== updates.logo_url) {
      await deleteLogoByUrl(existing.logo_url as string | null);
    }

    revalidatePath("/");
    return NextResponse.json({ partner: data });
  } catch (e) {
    await deleteLogoByUrl(uploadedUrl);
    return inputErrorResponse(e);
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("partners").select("id, logo_url").eq("id", params.id).maybeSingle();
  if (!existing) return NextResponse.json({ error: "Partner not found" }, { status: 404 });

  const { error } = await admin.from("partners").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  await deleteLogoByUrl(existing.logo_url as string | null);

  revalidatePath("/");
  return NextResponse.json({ ok: true });
}
