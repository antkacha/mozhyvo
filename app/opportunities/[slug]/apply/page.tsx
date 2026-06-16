import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { opportunities } from "@/lib/data";
import ApplyForm from "@/components/ApplyForm";
import { createClient as createSupabase } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

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
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/opportunities/${params.slug}/apply`);

  const opp = opportunities.find((o) => o.slug === params.slug) ?? await fetchOrgProject(params.slug);
  if (!opp) notFound();

  // If org project has an external apply URL, redirect there directly
  if (opp.applyUrl.startsWith("http")) redirect(opp.applyUrl);

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-8 pb-4">
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

      <div className="max-w-2xl mx-auto px-4 sm:px-6 flex flex-col gap-5">
        {/* Hero header */}
        <div className="rounded-2xl overflow-hidden border border-border shadow-sm">
          {/* Gradient top */}
          <div className="px-7 py-6" style={{ background: "linear-gradient(135deg, #3B4FE8 0%, #6366F1 100%)" }}>
            <p className="text-xs font-semibold text-white/70 uppercase tracking-widest mb-2">{opp.org}</p>
            <h1 className="text-xl font-black text-white leading-snug mb-4">{opp.title}</h1>
            {/* Chips */}
            <div className="flex flex-wrap gap-2">
              {opp.deadlineDisplay && (
                <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {opp.deadlineDisplay}
                </span>
              )}
              {opp.location && (
                <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                  {opp.flag} {opp.location}
                </span>
              )}
              {opp.typeName && (
                <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                  {opp.typeName}
                </span>
              )}
            </div>
          </div>
          {/* Note */}
          <div className="bg-white px-7 py-3 border-t border-border/50 flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-muted">Поля зі <span className="text-red-500 font-semibold">*</span> є обов&apos;язковими для заповнення</p>
          </div>
        </div>

        {/* Form */}
        <ApplyForm opp={opp} />
      </div>
    </div>
  );
}
