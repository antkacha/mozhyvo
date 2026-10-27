import { createClient } from "@supabase/supabase-js";

/** A homepage partner, as the public section needs it. */
export interface Partner {
  id: string;
  name: string;
  logoUrl: string | null;
  linkUrl: string | null;
}

// Up to this many partners sit in a static centered row; more become a marquee.
export const PARTNERS_STATIC_MAX = 6;

/**
 * Active partners in display order. Uses the public anon key with no user
 * session, so the partners RLS policy (public read of is_active rows) is
 * what decides visibility — and the homepage stays statically cacheable.
 */
export async function getActivePartners(): Promise<Partner[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data, error } = await supabase
    .from("partners")
    .select("id, name, logo_url, link_url")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (error) {
    console.error("[partners] query failed:", error.message);
    return [];
  }
  return (data ?? []).map((p) => ({
    id: p.id as string,
    name: p.name as string,
    logoUrl: (p.logo_url as string | null) || null,
    linkUrl: (p.link_url as string | null) || null,
  }));
}
