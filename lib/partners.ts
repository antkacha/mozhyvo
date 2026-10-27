import { createAdminClient } from "@/lib/supabase/admin";
import { orgsBySlug } from "@/lib/organizations";

export interface Partner {
  name: string;
  slug: string;
  hasLogo: boolean;
}

// МОЖUВО's own org row — never listed as its own partner.
export const PLATFORM_ORG_SLUG = "mozhuvo";

// Up to this many partners sit in a static centered row; more become a marquee.
export const PARTNERS_STATIC_MAX = 6;

/**
 * Verified orgs an admin marked show_as_partner. Never selects logo_url
 * (base64 data URLs up to ~2.7 MB) — logos load from
 * /api/public/orgs/[slug]/logo instead, so the homepage stays light.
 */
export async function getPartners(): Promise<Partner[]> {
  const admin = createAdminClient();
  const base = () =>
    admin
      .from("orgs")
      .select("name, slug")
      .eq("status", "verified")
      .eq("show_as_partner", true)
      .neq("slug", PLATFORM_ORG_SLUG)
      .not("slug", "is", null);

  // Second query filters on logo_url without returning it — the cheap way to
  // get a has-logo flag out of PostgREST.
  const [all, withLogo] = await Promise.all([
    base().order("name"),
    base().not("logo_url", "is", null).neq("logo_url", ""),
  ]);
  if (all.error) {
    console.error("[partners] query failed:", all.error.message);
    return [];
  }
  const logoSlugs = new Set((withLogo.data ?? []).map((o) => o.slug as string));

  return (all.data ?? [])
    // A slug shadowed by a hardcoded catalogue org would link to that page.
    .filter((o) => !orgsBySlug[o.slug as string])
    .map((o) => ({
      name: o.name as string,
      slug: o.slug as string,
      hasLogo: logoSlugs.has(o.slug as string),
    }));
}
