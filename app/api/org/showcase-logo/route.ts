import { NextResponse } from "next/server";
import { requireActiveOrg } from "@/lib/active-org";
import {
  setOrgShowcaseLogo, clearOrgShowcaseLogo, readLogoFile, showcaseErrorResponse,
} from "@/lib/showcase-logo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// The org is always the caller's active org (validated against their real
// ownership). Nothing in the request can point this at another org.
const OWNER_ONLY = { ownerOnly: true, ownerOnlyMessage: "Лише власник може змінювати логотип організації" };

// Multipart: logo (file). Replaces any existing showcase logo.
export async function POST(req: Request) {
  const ctx = await requireActiveOrg(OWNER_ONLY);
  if (ctx.response) return ctx.response;
  try {
    const url = await setOrgShowcaseLogo(ctx.org.id, await readLogoFile(req));
    return NextResponse.json({ showcase_logo_url: url });
  } catch (e) {
    return showcaseErrorResponse(e);
  }
}

export async function DELETE() {
  const ctx = await requireActiveOrg(OWNER_ONLY);
  if (ctx.response) return ctx.response;
  try {
    await clearOrgShowcaseLogo(ctx.org.id);
    return NextResponse.json({ showcase_logo_url: null });
  } catch (e) {
    return showcaseErrorResponse(e);
  }
}
