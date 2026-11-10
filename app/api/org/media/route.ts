import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { requireActiveOrg } from "@/lib/active-org";
import { ACTIVE_ORG_COOKIE } from "@/lib/org-access";
import {
  setOrgMedia, clearOrgMedia, readOrgMediaInput, parseOrgMediaKind, orgMediaErrorResponse,
} from "@/lib/org-media";
import { revalidateOrg } from "@/lib/revalidate-org";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// The cover "link" tab downloads the image server-side (lib/remote-image,
// bounded to 7s) — stay under Vercel Hobby's 10s limit.
export const maxDuration = 9;

// Same rule as PATCH /api/me/org: only the owner edits the org profile.
const OWNER_ONLY = { ownerOnly: true, ownerOnlyMessage: "Лише власник може змінювати логотип і обкладинку організації" };

/**
 * The owner's active org (validated against real ownership). If the
 * mzv_active_org cookie names a different org than the one resolved — the
 * user can't act as it — refuse instead of silently writing to another org
 * of theirs.
 */
async function ownerOrg() {
  const ctx = await requireActiveOrg(OWNER_ONLY);
  if (ctx.response) return ctx;
  const requested = cookies().get(ACTIVE_ORG_COOKIE)?.value;
  if (requested && requested !== ctx.org.id) {
    return { response: NextResponse.json({ error: "Немає доступу до цієї організації" }, { status: 403 }) };
  }
  return ctx;
}

// ?kind=logo|cover. Body: multipart "file", or JSON { url } (cover only).
export async function POST(req: Request) {
  const ctx = await ownerOrg();
  if (ctx.response) return ctx.response;
  try {
    const kind = parseOrgMediaKind(new URL(req.url).searchParams.get("kind"));
    const url = await setOrgMedia(ctx.org.id, kind, await readOrgMediaInput(req, kind));
    await revalidateOrg({ id: ctx.org.id });
    return NextResponse.json({ url });
  } catch (e) {
    return orgMediaErrorResponse(e);
  }
}

// ?kind=logo|cover — removes the image and our file.
export async function DELETE(req: Request) {
  const ctx = await ownerOrg();
  if (ctx.response) return ctx.response;
  try {
    const kind = parseOrgMediaKind(new URL(req.url).searchParams.get("kind"));
    await clearOrgMedia(ctx.org.id, kind);
    await revalidateOrg({ id: ctx.org.id });
    return NextResponse.json({ url: null });
  } catch (e) {
    return orgMediaErrorResponse(e);
  }
}
