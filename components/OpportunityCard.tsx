"use client";

import Link from "next/link";
import { Opportunity, typeColors, formatLabels } from "@/lib/data";
import { useSaved } from "@/hooks/useSaved";

const typeBorderColors: Record<string, string> = {
  scholarship: "border-t-primary",
  internship: "border-t-blue-500",
  exchange: "border-t-green-500",
  volunteering: "border-t-teal-500",
  competition: "border-t-orange-500",
  grant: "border-t-yellow-400",
  conference: "border-t-pink-500",
  hackathon: "border-t-red-500",
};

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
    <div className={`relative bg-white rounded-2xl border border-border border-t-4 ${typeBorderColors[opp.type] ?? "border-t-gray-200"} shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col p-6 gap-4 group`}>
      {/* Save button — top-right corner */}
      <button
        onClick={() => toggle(opp.slug)}
        disabled={!ready}
        className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 disabled:opacity-40 ${
          saved
            ? "bg-primary text-white shadow-md"
            : "bg-white border border-border text-muted hover:border-primary hover:text-primary shadow-sm"
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

      {/* Type badge + deadline */}
      <div className="flex items-center justify-between gap-2 pr-8">
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${typeColors[opp.type]}`}
        >
          {opp.typeName}
        </span>
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
            expiring ? "bg-red-50 text-red-600" : "text-muted bg-muted-bg"
          }`}
        >
          {expiring ? "⏰ " : ""}Дедлайн: {opp.deadlineDisplay}
        </span>
      </div>

      {/* Org + title + description */}
      <div className="flex-1">
        <p className="text-xs font-semibold text-muted mb-1.5 uppercase tracking-wide">{opp.org}</p>
        <Link href={`/opportunities/${opp.slug}`}>
          <h3 className="font-bold text-foreground leading-snug group-hover:text-primary transition-colors duration-200 line-clamp-2">
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
