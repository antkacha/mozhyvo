"use client";

import Link from "next/link";
import { Opportunity, typeColors, formatLabels } from "@/lib/data";
import { useSaved } from "@/hooks/useSaved";

function isExpiringSoon(deadline: string): boolean {
  const diff =
    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return diff <= 14 && diff > 0;
}

export default function OpportunityCard({ opp }: { opp: Opportunity }) {
  const expiring = isExpiringSoon(opp.deadline);
  const { isSaved, toggle, ready } = useSaved();
  const saved = isSaved(opp.slug);

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col p-6 gap-4 group">
      {/* Type badge + save icon + deadline */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeColors[opp.type]}`}
        >
          {opp.typeName}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => toggle(opp.slug)}
            disabled={!ready}
            className="p-1 rounded-lg text-muted hover:text-primary transition-colors duration-150 disabled:opacity-40"
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
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              expiring ? "bg-red-50 text-red-600" : "text-muted bg-muted-bg"
            }`}
          >
            {expiring ? "⏰ " : ""}Дедлайн: {opp.deadlineDisplay}
          </span>
        </div>
      </div>

      {/* Org + title + description */}
      <div className="flex-1">
        <p className="text-xs font-medium text-muted mb-1">{opp.org}</p>
        <Link href={`/opportunities/${opp.slug}`}>
          <h3 className="font-semibold text-foreground leading-snug group-hover:text-primary transition-colors duration-200 line-clamp-2">
            {opp.title}
          </h3>
        </Link>
        <p className="text-sm text-muted mt-2 line-clamp-2">{opp.shortDescription}</p>
      </div>

      {/* Info chips */}
      <div className="flex flex-wrap gap-1.5">
        <span className="text-xs bg-muted-bg text-muted px-2 py-0.5 rounded-full">
          {formatLabels[opp.format]}
        </span>
        {opp.funding === "fully-funded" && (
          <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
            Повне фінансування
          </span>
        )}
        {opp.duration && (
          <span className="text-xs bg-muted-bg text-muted px-2 py-0.5 rounded-full">
            {opp.duration}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="text-sm text-muted flex items-center gap-1.5">
          {opp.flag} {opp.location}
        </span>
        <Link
          href={`/opportunities/${opp.slug}`}
          className="text-sm font-semibold text-primary hover:underline"
        >
          Детальніше →
        </Link>
      </div>
    </div>
  );
}
