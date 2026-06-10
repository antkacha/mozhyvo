"use client";

import Link from "next/link";
import { Opportunity, typeColors, formatLabels } from "@/lib/data";
import { orgNameToSlug } from "@/lib/organizations";
import { useSaved } from "@/hooks/useSaved";

const typeEmoji: Record<string, string> = {
  scholarship: "🎓",
  internship: "💼",
  exchange: "🌍",
  volunteering: "🤝",
  competition: "🏆",
  grant: "🚀",
  conference: "🎙",
  hackathon: "💻",
};

const typeAvatarBg: Record<string, string> = {
  scholarship: "bg-primary-light",
  internship: "bg-blue-50",
  exchange: "bg-green-50",
  volunteering: "bg-teal-50",
  competition: "bg-orange-50",
  grant: "bg-yellow-50",
  conference: "bg-pink-50",
  hackathon: "bg-red-50",
};

function isExpiringSoon(deadline: string): boolean {
  const diff = (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return diff <= 14 && diff > 0;
}

export default function OpportunityCard({ opp, index = 0 }: { opp: Opportunity; index?: number }) {
  const expiring = isExpiringSoon(opp.deadline);
  const { isSaved, toggle, ready } = useSaved();
  const saved = isSaved(opp.slug);
  const orgSlug = orgNameToSlug[opp.org];

  return (
    <div
      className="card-animate bg-white rounded-2xl border border-border hover:border-primary/30 hover:shadow-xl hover:shadow-primary/[0.06] hover:-translate-y-1 transition-all duration-200 flex flex-col overflow-hidden group"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="p-5 flex flex-col gap-4 flex-1">

        {/* ── Header row: avatar + org + save ─────────────────── */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${typeAvatarBg[opp.type] ?? "bg-muted-bg"}`}
            >
              {typeEmoji[opp.type] ?? "✦"}
            </div>
            <div className="min-w-0">
              {orgSlug ? (
                <Link
                  href={`/organizations/${orgSlug}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[11px] font-bold text-muted/60 uppercase tracking-wider truncate leading-none mb-1.5 hover:text-primary transition-colors block"
                >
                  {opp.org}
                </Link>
              ) : (
                <p className="text-[11px] font-bold text-muted/60 uppercase tracking-wider truncate leading-none mb-1.5">
                  {opp.org}
                </p>
              )}
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeColors[opp.type]}`}>
                {opp.typeName}
              </span>
            </div>
          </div>

          {/* Save button — inside the card */}
          <button
            onClick={() => toggle(opp.slug)}
            disabled={!ready}
            className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-150 disabled:opacity-40 ${
              saved
                ? "bg-primary text-white shadow-sm shadow-primary/25"
                : "bg-muted-bg text-muted hover:bg-primary/10 hover:text-primary"
            }`}
            aria-label={saved ? "Видалити зі збережених" : "Зберегти"}
          >
            <svg
              className="w-4 h-4"
              fill={saved ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>

        {/* ── Title + description ──────────────────────────────── */}
        <div className="flex-1">
          <Link href={`/opportunities/${opp.slug}`}>
            <h3 className="font-extrabold text-foreground text-[15px] leading-snug group-hover:text-primary transition-colors duration-150 line-clamp-2 mb-2">
              {opp.title}
            </h3>
          </Link>
          <p className="text-sm text-muted line-clamp-2 leading-relaxed">
            {opp.shortDescription}
          </p>
        </div>

        {/* ── Chips ───────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-1.5">
          <span className="text-[11px] bg-muted-bg text-muted px-2 py-0.5 rounded-full">
            {formatLabels[opp.format]}
          </span>
          {opp.funding === "fully-funded" && (
            <span className="text-[11px] bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
              ✓ Повне фінансування
            </span>
          )}
          {opp.duration && (
            <span className="text-[11px] bg-muted-bg text-muted px-2 py-0.5 rounded-full">
              {opp.duration}
            </span>
          )}
        </div>
      </div>

      {/* ── Footer strip ─────────────────────────────────────── */}
      <div className="px-5 py-3 border-t border-border/60 bg-muted-bg/30 flex items-center justify-between gap-3">
        <span className="text-xs text-muted truncate">
          {opp.flag} {opp.location}
        </span>
        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${
            expiring
              ? "bg-red-50 text-red-600 ring-1 ring-inset ring-red-200"
              : "bg-white text-muted border border-border"
          }`}
        >
          {expiring ? "⏰ " : ""}{opp.deadlineDisplay}
        </span>
      </div>
    </div>
  );
}
