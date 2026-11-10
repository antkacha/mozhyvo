"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import OpportunityCoverImage from "@/components/OpportunityCoverImage";
import { normalizeType, typeNames } from "@/lib/data";

// The archive page is ISR (same HTML for everyone), so the ?type= filter is
// applied here on the client. Links and URLs are unchanged.

export type ArchiveProject = {
  id: string;
  title: string;
  type: string;
  type_name: string | null;
  country: string;
  flag: string;
  deadline: string | null;
  deadline_display: string | null;
  funding: string | null;
  short_description: string | null;
  photo_url: string | null;
};

const FUNDING_LABELS: Record<string, string> = {
  "fully-funded":    "Повне фінансування",
  "partially-funded":"Часткове фінансування",
  "self-funded":     "За власний рахунок",
};

const typeOf = (p: ArchiveProject) => normalizeType(p.type, p.type_name);

type Props = { slug: string; archived: ArchiveProject[] };

/** Filter chips + grid for a given type ("" = all). Also the server-rendered fallback. */
export function ArchiveGridView({ slug, archived, typeFilter }: Props & { typeFilter: string }) {
  const types = Array.from(new Set(archived.map(typeOf)));
  const filtered = typeFilter ? archived.filter((p) => typeOf(p) === typeFilter) : archived;

  return (
    <>
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
              {typeNames[t]}
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
                className="bg-white rounded-2xl border border-border/70 overflow-hidden hover:shadow-md hover:border-border transition-all group"
              >
                <div className="grayscale">
                  <OpportunityCoverImage
                    photo={p.photo_url ?? undefined}
                    title={p.title}
                    type={typeOf(p)}
                    sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 320px"
                    thumb
                  />
                </div>
                <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted-bg text-muted">
                    {p.type_name || typeNames[typeOf(p)]}
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
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}

/** Reads ?type= from the URL. Must sit inside <Suspense> (useSearchParams on a static page). */
export default function ArchiveGrid(props: Props) {
  const typeFilter = useSearchParams().get("type") ?? "";
  return <ArchiveGridView {...props} typeFilter={typeFilter} />;
}
