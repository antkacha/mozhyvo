import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { opportunities } from "@/lib/data";
import ApplyForm from "@/components/ApplyForm";
import { createClient as createSupabase } from "@supabase/supabase-js";

function createPublicClient() {
  return createSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
import type { Opportunity } from "@/lib/data";

export function generateStaticParams() {
  return opportunities.map((o) => ({ slug: o.slug }));
}

export const dynamicParams = true;

async function fetchOrgProject(id: string): Promise<Opportunity | null> {
  try {
    const supabase = createPublicClient();
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
    <div className="min-h-screen bg-[#f0f2f5] pb-16">
      {/* Back link */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <Link
          href={`/opportunities/${opp.slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Повернутись до програми
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 flex flex-col gap-4">
        {/* Header card — Google Forms-style colored banner */}
        <div className="rounded-2xl overflow-hidden shadow-sm border border-primary/10">
          <div className="h-2 bg-primary w-full" />
          <div className="bg-white px-8 py-7">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">{opp.org}</p>
            <h1 className="text-2xl font-black text-foreground leading-tight mb-3">{opp.title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
              <span>{opp.flag} {opp.location}</span>
              <span className="text-border">·</span>
              <span>{opp.typeName}</span>
              <span className="text-border">·</span>
              <span>Дедлайн: <span className="font-semibold text-foreground">{opp.deadlineDisplay}</span></span>
            </div>
            <p className="text-xs text-muted mt-4 pt-4 border-t border-border">
              * — обов&apos;язкові поля
            </p>
          </div>
        </div>

        {/* Form card */}
        <ApplyForm opp={opp} />
      </div>
    </div>
  );
}
