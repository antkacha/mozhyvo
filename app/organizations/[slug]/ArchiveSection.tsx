"use client";

import Link from "next/link";
import { useState } from "react";

export type ArchiveProject = {
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

const PREVIEW = 6;

export default function ArchiveSection({
  projects,
  orgSlug,
}: {
  projects: ArchiveProject[];
  orgSlug: string;
}) {
  const [activeType, setActiveType] = useState("all");

  if (projects.length === 0) return null;

  const types = [...new Set(projects.map((p) => p.type))].filter(Boolean);
  const filtered =
    activeType === "all" ? projects : projects.filter((p) => p.type === activeType);
  const shown = filtered.slice(0, PREVIEW);
  const hasMore = projects.length > PREVIEW;

  return (
    <section className="pb-16 border-t border-border/50 pt-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-2xl font-black text-foreground">
          Архів програм
          <span className="ml-2 text-base font-normal text-muted">({projects.length})</span>
        </h2>
      </div>

      {/* Type filter chips */}
      {types.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-5">
          <button
            onClick={() => setActiveType("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeType === "all"
                ? "bg-foreground/10 text-foreground"
                : "bg-muted-bg text-muted hover:bg-foreground/5"
            }`}
          >
            Всі типи
          </button>
          {types.map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeType === t
                  ? "bg-foreground/10 text-foreground"
                  : "bg-muted-bg text-muted hover:bg-foreground/5"
              }`}
            >
              {TYPE_LABELS[t] ?? t}
            </button>
          ))}
        </div>
      )}

      {/* Cards */}
      {filtered.length === 0 ? (
        <p className="text-sm text-muted py-4">Немає архівних програм цього типу</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {shown.map((p) => (
              <Link
                key={p.id}
                href={`/opportunities/${p.id}`}
                className="bg-white rounded-2xl border border-border/60 p-5 hover:shadow-sm hover:border-border transition-all group opacity-70 hover:opacity-100"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted-bg text-muted">
                    {TYPE_LABELS[p.type] ?? p.type}
                  </span>
                  <span className="text-[11px] text-muted/60 flex items-center gap-1 flex-shrink-0">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Архів
                  </span>
                </div>
                <h3 className="font-bold text-foreground/70 text-sm leading-snug mb-2 group-hover:text-foreground transition-colors line-clamp-2">
                  {p.title}
                </h3>
                {p.short_description && (
                  <p className="text-xs text-muted/60 leading-relaxed line-clamp-2">
                    {p.short_description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                  <span className="text-xs text-muted/60">{p.flag} {p.country}</span>
                  {p.funding && (
                    <>
                      <span className="text-border/50">·</span>
                      <span className="text-xs text-muted/60">{p.funding}</span>
                    </>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {hasMore && (
            <div className="mt-6 text-center">
              <Link
                href={`/organizations/${orgSlug}/archive`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted hover:text-foreground hover:border-foreground/30 transition-all"
              >
                Переглянути весь архів ({projects.length})
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </>
      )}
    </section>
  );
}
