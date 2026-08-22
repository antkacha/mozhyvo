"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSaved } from "@/hooks/useSaved";
import { opportunities } from "@/lib/data";
import { usePublicOrgProjects } from "@/hooks/usePublicOrgProjects";
import { getDaysUntilDeadline } from "@/lib/recommendations";
import OpportunityCard from "@/components/OpportunityCard";

export default function SavedList() {
  const { saved, clearAll, ready } = useSaved();
  // includeExpired: the badge counts every saved slug regardless of
  // deadline, so this list must be able to render all of them too — the
  // default (deadline-filtered) catalog fetch is what caused the desync:
  // an expired-but-saved project would never even arrive here to be
  // counted, let alone rendered.
  const { projects: orgProjects, ready: orgReady } = usePublicOrgProjects({ includeExpired: true });

  const allOpportunities = useMemo(
    () => [...opportunities, ...orgProjects],
    [orgProjects]
  );

  if (!ready || !orgReady) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-64 bg-muted-bg rounded-2xl" />
        ))}
      </div>
    );
  }

  const savedOpportunities = allOpportunities.filter((o) => saved.includes(o.slug));
  const activeOpportunities = savedOpportunities.filter((o) => {
    const d = getDaysUntilDeadline(o.deadline);
    return d === null || d > 0;
  });
  const expiredOpportunities = savedOpportunities.filter((o) => {
    const d = getDaysUntilDeadline(o.deadline);
    return d !== null && d <= 0;
  });

  if (saved.length === 0) {
    return (
      <div className="text-center py-24 flex flex-col items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center">
          <svg
            className="w-10 h-10 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground mb-2">
            Ще нічого не збережено
          </h2>
          <p className="text-muted text-sm max-w-xs">
            Натискай серце на будь-якій можливості, щоб зберегти її і знайти пізніше.
          </p>
        </div>
        <Link
          href="/opportunities"
          className="px-5 py-2.5 rounded-2xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all duration-200 shadow-sm shadow-primary/20"
        >
          Переглянути можливості
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        {/* saved.length, not savedOpportunities.length — this is the exact
            same count the header badge reads, so the two can never desync. */}
        <p className="text-sm text-muted">
          Збережено:{" "}
          <span className="font-semibold text-foreground">
            {saved.length}
          </span>{" "}
          {saved.length === 1 ? "можливість" : "можливостей"}
        </p>
        <button
          onClick={() => clearAll()}
          className="text-xs text-muted hover:text-red-500 transition-colors"
        >
          Очистити все
        </button>
      </div>

      {activeOpportunities.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activeOpportunities.map((opp, i) => (
            <OpportunityCard key={opp.slug} opp={opp} index={i} />
          ))}
        </div>
      )}

      {expiredOpportunities.length > 0 && (
        <div className={activeOpportunities.length > 0 ? "mt-10" : ""}>
          <h2 className="text-sm font-bold text-muted mb-4">
            Дедлайн завершено ({expiredOpportunities.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {expiredOpportunities.map((opp) => (
              <div key={opp.slug} className="grayscale opacity-70">
                <OpportunityCard opp={opp} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
