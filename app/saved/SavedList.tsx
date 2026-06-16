"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSaved } from "@/hooks/useSaved";
import { opportunities } from "@/lib/data";
import { usePublicOrgProjects } from "@/hooks/usePublicOrgProjects";
import OpportunityCard from "@/components/OpportunityCard";

export default function SavedList() {
  const { saved, toggle, ready } = useSaved();
  const { projects: orgProjects, ready: orgReady } = usePublicOrgProjects();

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

  if (savedOpportunities.length === 0) {
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
        <p className="text-sm text-muted">
          Збережено:{" "}
          <span className="font-semibold text-foreground">
            {savedOpportunities.length}
          </span>{" "}
          {savedOpportunities.length === 1 ? "можливість" : "можливостей"}
        </p>
        <button
          onClick={() => saved.forEach((slug) => toggle(slug))}
          className="text-xs text-muted hover:text-red-500 transition-colors"
        >
          Очистити все
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {savedOpportunities.map((opp) => (
          <OpportunityCard key={opp.slug} opp={opp} />
        ))}
      </div>
    </div>
  );
}
