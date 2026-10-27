import { randomUUID } from "crypto";
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

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  const { data, error } = await createAdminClient()
    .from("partners")
    .select(COLUMNS)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ partners: data ?? [] });
}

// Multipart: name (required), link_url, is_active, logo (optional file).
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;

  let uploadedUrl: string | null = null;
  try {
    const form = await req.formData().catch(() => {
      throw new PartnerInputError("Очікується multipart/form-data");
    });
    const name = parseName(form.get("name"));
    const link_url = parseLink(form.get("link_url"));
    const is_active = parseBool(form.get("is_active")) ?? true;
    const logo = form.get("logo");

    const id = randomUUID();
    if (logo instanceof File && logo.size > 0) {
      uploadedUrl = await uploadLogo(id, await processLogo(logo));
    }

    const admin = createAdminClient();
    // New partners go to the end of the list.
    const { data: last } = await admin
      .from("partners").select("sort_order").order("sort_order", { ascending: false }).limit(1);
    const sort_order = ((last?.[0]?.sort_order as number | undefined) ?? -1) + 1;

    const { data, error } = await admin
      .from("partners")
      .insert({ id, name, logo_url: uploadedUrl, link_url, sort_order, is_active })
      .select(COLUMNS)
      .single();
    if (error) throw new Error(error.message);

    revalidatePath("/");
    return NextResponse.json({ partner: data }, { status: 201 });
  } catch (e) {
    await deleteLogoByUrl(uploadedUrl); // don't orphan the file if the insert failed
    return inputErrorResponse(e);
  }
}
