import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

// Homepage partner strip: verified orgs that uploaded a wide showcase logo
// and that an admin hasn't hidden. The platform's own org is never listed.

export interface Partner {
  name: string;
  slug: string;
  showcaseLogoUrl: string;
}

export const PARTNERS_STATIC_MAX = 6;
const PLATFORM_ORG_SLUG = "mozhuvo";
const PARTNERS_TAG = "partners";

/**
 * Service-role read (orgs isn't publicly readable), limited to the three
 * public columns. Cached for an hour; every write that can change the strip
 * calls revalidatePartners().
 */
const cachedPartnerOrgs = unstable_cache(
  async (): Promise<Partner[]> => {
    const { data, error } = await createAdminClient()
      .from("orgs")
      .select("name, slug, showcase_logo_url")
      .eq("status", "verified")
      .not("showcase_logo_url", "is", null)
      .eq("partner_hidden", false)
      .neq("slug", PLATFORM_ORG_SLUG)
      .order("verified_at", { ascending: true, nullsFirst: false })
      .order("name", { ascending: true });
    // Throw rather than return []: a failed read must not be cached for an hour.
    if (error) throw new Error(error.message);
    return (data ?? [])
      .filter((o) => o.slug && o.showcase_logo_url)
      .map((o) => ({
        name: (o.name as string) ?? "",
        slug: o.slug as string,
        showcaseLogoUrl: o.showcase_logo_url as string,
      }));
  },
  ["partner-orgs"],
  { revalidate: 3600, tags: [PARTNERS_TAG] },
);

export async function getPartnerOrgs(): Promise<Partner[]> {
  try {
    return await cachedPartnerOrgs();
  } catch (e) {
    console.error("[partners] query failed:", e instanceof Error ? e.message : e);
    return [];
  }
}

/** Drops the cached partner list and the homepage, so changes show right away. */
export function revalidatePartners() {
  revalidateTag(PARTNERS_TAG);
  revalidatePath("/");
}
