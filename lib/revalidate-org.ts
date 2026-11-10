import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Public org pages (/organizations/<slug>, the /organizations/<id> UUID
 * fallback, and /archive) are ISR with revalidate = 300. Call this after any
 * write that changes what they show — org profile/media/status, the org's
 * projects — so the change is visible immediately instead of within 5 min.
 *
 * Pass the slug when you already have it (required after a delete, when the
 * row is gone); otherwise it's looked up by id. Never throws: a failed
 * revalidation must not fail the write that triggered it.
 */
export async function revalidateOrg(org: { id: string; slug?: string | null }): Promise<void> {
  try {
    let slug = org.slug;
    if (slug === undefined) {
      const { data } = await createAdminClient().from("orgs").select("slug").eq("id", org.id).maybeSingle();
      slug = (data?.slug as string | null | undefined) ?? null;
    }
    for (const key of Array.from(new Set([org.id, slug].filter((k): k is string => !!k)))) {
      revalidatePath(`/organizations/${key}`);
      revalidatePath(`/organizations/${key}/archive`);
    }
  } catch (e) {
    console.error("[revalidateOrg]", org.id, e);
  }
}
