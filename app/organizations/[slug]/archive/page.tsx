import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { unstable_noStore as noStore } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { orgsBySlug } from "@/lib/organizations";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Project = {
  id: string;
  title: string;
  type: string;
  country: string;
  flag: string;
  deadline: string | null;
  deadline_display: string | null;
  funding: string | null;
  short_description: string | null;
};

const TYPE_LABELS: Record<string, string> = {
  exchange:    "Обмін",
  grant:       "Грант",
  internship:  "Стажування",
  volunteer:   "Волонтерство",
  conference:  "Конференція",
  competition: "Конкурс",
  hackathon:   "Хакатон",
  training:    "Тренінг",
};

const FUNDING_LABELS: Record<string, string> = {
  "fully-funded":    "Повне фінансування",
  "partially-funded":"Часткове фінансування",
  "self-funded":     "За власний рахунок",
};

export default async function OrgArchivePage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { type?: string };
}) {
  noStore();

  const { slug } = params;
  const typeFilter = searchParams.type ?? "";

  // Static orgs have no DB archive
  if (orgsBySlug[slug]) notFound();

  const admin = createAdminClient();
  const { data: org } = await admin
    .from("orgs")
    .select("id, name, slug, logo_url, brand_color, status")
    .eq("slug", slug)
    .eq("status", "verified")
    .maybeSingle();

  if (!org) notFound();

  const today = new Date().toISOString().split("T")[0];

  const { data: allProjects } = await admin
    .from("org_projects")
    .select("id, title, type, country, flag, deadline, deadline_display, funding, short_description")
    .eq("org_id", org.id)
    .eq("status", "published")
    .order("deadline", { ascending: false });

  const archived = ((allProjects ?? []) as Project[]).filter(
    (p) => p.deadline && /^\d{4}-\d{2}-\d{2}$/.test(p.deadline) && p.deadline < today,
  );

  const filtered = typeFilter
    ? archived.filter((p) => p.type === typeFilter)
    : archived;

  const types = Array.from(new Set(archived.map((p) => p.type))).filter(Boolean);

  const orgName = org.name as string;
  const brandColor = (org.brand_color as string) ?? "#3B4FE8";
  const orgInitials = orgName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="page-transition min-h-screen bg-background">
      {/* Top nav bar */}
      <div className="bg-white border-b border-border sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href={`/organizations/${slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {orgName}
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page header */}
        <div className="flex items-center gap-4 mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center text-white font-black overflow-hidden border border-border shadow-sm"
            style={{ background: org.logo_url ? undefined : brandColor }}
          >
            {org.logo_url ? (
              <Image
                src={org.logo_url as string}
                alt={orgName}
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-lg">{orgInitials}</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">Архів програм</h1>
            <p className="text-sm text-muted mt-0.5">
              {orgName} · {archived.length} завершених{" "}
              {archived.length === 1 ? "програма" : archived.length < 5 ? "програми" : "програм"}
            </p>
          </div>
        </div>

        {/* Type filter */}
        {types.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Link
              href={`/organizations/${slug}/archive`}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                !typeFilter
                  ? "bg-foreground text-white"
                  : "bg-muted-bg text-muted hover:bg-foreground/10"
              }`}
            >
              Всі типи
            </Link>
            {types.map((t) => (
              <Link
                key={t}
                href={`/organizations/${slug}/archive?type=${t}`}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  typeFilter === t
                    ? "bg-foreground text-white"
                    : "bg-muted-bg text-muted hover:bg-foreground/10"
                }`}
              >
                {TYPE_LABELS[t] ?? t}
              </Link>
            ))}
          </div>
        )}

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-16 text-center">
            <p className="text-4xl mb-4">📭</p>
            <p className="font-semibold text-foreground mb-1">
              {archived.length === 0 ? "Архів порожній" : "Нічого не знайдено"}
            </p>
            <p className="text-sm text-muted mb-4">
              {archived.length === 0
                ? "Завершені програми будуть з'являтися тут"
                : "Немає програм цього типу в архіві"}
            </p>
            {typeFilter && (
              <Link
                href={`/organizations/${slug}/archive`}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                Показати всі
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((p) => {
              const deadlineFormatted =
                p.deadline_display ||
                (p.deadline
                  ? new Date(p.deadline).toLocaleDateString("uk-UA", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "");

              return (
                <Link
                  key={p.id}
                  href={`/opportunities/${p.id}`}
                  className="bg-white rounded-2xl border border-border/70 p-5 hover:shadow-md hover:border-border transition-all group"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted-bg text-muted">
                      {TYPE_LABELS[p.type] ?? p.type}
                    </span>
                    {deadlineFormatted && (
                      <span className="text-[11px] text-muted/60 flex items-center gap-1 flex-shrink-0">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {deadlineFormatted}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-foreground/80 text-sm leading-snug mb-2 group-hover:text-foreground transition-colors line-clamp-2">
                    {p.title}
                  </h3>
                  {p.short_description && (
                    <p className="text-xs text-muted/70 leading-relaxed line-clamp-3">
                      {p.short_description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                    <span className="text-xs text-muted/70">{p.flag} {p.country}</span>
                    {p.funding && (
                      <>
                        <span className="text-border/50">·</span>
                        <span className="text-xs text-muted/70">
                          {FUNDING_LABELS[p.funding] ?? p.funding}
                        </span>
                      </>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
