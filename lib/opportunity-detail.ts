import { unstable_cache } from "next/cache";
import { normalizeType, type Opportunity } from "@/lib/data";
import { applyFieldsFromRow } from "@/lib/apply-method";
import { createAdminClient } from "@/lib/supabase/admin";

// Supabase-js's fetch is otherwise cached indefinitely and untagged by
// Next.js's default fetch caching — revalidateTag("projects") (called by
// every project mutation route, including the cover upload) would have no
// entry to invalidate. Same tag/strategy as /api/public/opportunities so
// catalog and detail page share one invalidation path.
const fetchOrgProjectRow = unstable_cache(
  async (id: string) => {
    const admin = createAdminClient();
    const { data } = await admin
      .from("org_projects")
      .select("*, orgs!inner(id, name, status, slug)")
      .eq("id", id)
      .eq("status", "published")
      .maybeSingle();
    return data;
  },
  ["org-project-detail"],
  { tags: ["projects"], revalidate: 60 },
);

// The one definition of "this opportunity is public": published, and its
// org is verified. Used by the detail page, its metadata and its OG image.
export async function getPublicOpportunity(id: string): Promise<Opportunity | null> {
  try {
    const data = await fetchOrgProjectRow(id);
    if (!data) return null;
    const org = data.orgs as { id: string; name: string; status?: string; slug?: string };
    // Only verified orgs' projects are public — also by direct URL.
    if (org.status !== "verified") return null;
    return {
      slug:             data.id as string,
      type:             normalizeType(data.type as string, data.type_name as string),
      typeName:         (data.type_name as string) ?? "",
      org:              org.name ?? "",
      orgSlug:          org.slug || org.id,
      title:            (data.title as string) ?? "",
      shortDescription: (data.short_description as string) ?? "",
      fullDescription:  (data.full_description as string) ?? "",
      deadline:         (data.deadline as string) ?? "",
      deadlineDisplay:  (data.deadline_display as string) ?? "",
      flag:             (data.flag as string) ?? "🇺🇦",
      location:         (data.location as string) ?? "",
      country:          (data.country as string) ?? "",
      format:           (data.format as Opportunity["format"]) ?? "offline",
      languages:        (data.languages as string[]) ?? [],
      ageMin:           data.age_min as number | undefined,
      ageMax:           data.age_max as number | undefined,
      funding:          (data.funding as Opportunity["funding"]) ?? "fully-funded",
      fundingDetails:   (data.funding_details as string) ?? "",
      requirements:     (data.requirements as string[]) ?? [],
      benefits:         (data.benefits as string[]) ?? [],
      tags:             (data.tags as string[]) ?? [],
      ...applyFieldsFromRow(data),
      duration:         (data.duration as string) ?? "",
      infoPackUrl:      (data.info_pack_url as string) || undefined,
      photo:            (data.photo_url as string) || undefined,
      importantNote:    (data.important_note as string) || undefined,
      hasFee:           (data.has_fee as boolean) ?? false,
      feeAmount:        (data.fee_amount as string) || undefined,
      feeWho:           (data.fee_who as Opportunity["feeWho"]) ?? "selected",
      projectId:        data.id as string,
      orgVerified:      org.status === "verified",
    };
  } catch {
    return null;
  }
}
