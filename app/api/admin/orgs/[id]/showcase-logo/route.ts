import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/require-admin";
import {
  setOrgShowcaseLogo, clearOrgShowcaseLogo, readLogoFile, showcaseErrorResponse,
} from "@/lib/showcase-logo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Admin uploads or removes a showcase logo on behalf of any org.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const url = await setOrgShowcaseLogo(params.id, await readLogoFile(req));
    return NextResponse.json({ showcase_logo_url: url });
  } catch (e) {
    return showcaseErrorResponse(e);
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    await clearOrgShowcaseLogo(params.id);
    return NextResponse.json({ showcase_logo_url: null });
  } catch (e) {
    return showcaseErrorResponse(e);
  }
}
