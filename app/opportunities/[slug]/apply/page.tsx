import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { opportunities } from "@/lib/data";
import ApplyForm from "@/components/ApplyForm";
import { createClient } from "@/lib/supabase/client";
import type { Opportunity } from "@/lib/data";

export function generateStaticParams() {
  return opportunities.map((o) => ({ slug: o.slug }));
}

export const dynamicParams = true;

async function fetchOrgProject(id: string): Promise<Opportunity | null> {
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from("org_projects")
      .select("*, orgs!inner(name, status)")
      .eq("id", id)
      .eq("status", "published")
      .maybeSingle();
    if (!data) return null;
    const org = data.orgs as { name: string; status: string };
    if (org.status !== "verified") return null;
    return {
      slug:             data.id as string,
      type:             (data.type as Opportunity["type"]) ?? "exchange",
      typeName:         (data.type_name as string) ?? "",
      org:              org.name ?? "",
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
      applyUrl:         (data.external_apply_url as string) || `/opportunities/${data.id}/apply`,
      duration:         (data.duration as string) ?? "",
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const opp = opportunities.find((o) => o.slug === params.slug) ?? await fetchOrgProject(params.slug);
  if (!opp) return {};
  return {
    title: `Подати заявку — ${opp.title} | Моживо`,
    description: `Заповни заявку на участь у програмі ${opp.title} від ${opp.org}.`,
  };
}

export default async function ApplyPage({ params }: { params: { slug: string } }) {
  const opp = opportunities.find((o) => o.slug === params.slug) ?? await fetchOrgProject(params.slug);
  if (!opp) notFound();

  // If org project has an external apply URL, redirect there directly
  if (opp.applyUrl.startsWith("http")) redirect(opp.applyUrl);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      {/* Back */}
      <Link
        href={`/opportunities/${opp.slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors mb-8"
      >
        ← Повернутись до програми
      </Link>

      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-medium text-muted mb-1">{opp.org}</p>
        <h1 className="text-2xl font-extrabold text-foreground leading-tight mb-2">
          {opp.title}
        </h1>
        <div className="flex items-center gap-3 text-sm text-muted">
          <span>{opp.flag} {opp.location}</span>
          <span>·</span>
          <span>Дедлайн: {opp.deadlineDisplay}</span>
        </div>
      </div>

      <ApplyForm opp={opp} />
    </div>
  );
}
