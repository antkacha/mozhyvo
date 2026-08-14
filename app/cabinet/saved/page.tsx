"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSaved } from "@/hooks/useSaved";
import { opportunities } from "@/lib/data";
import { usePublicOrgProjects } from "@/hooks/usePublicOrgProjects";
import { getDaysUntilDeadline } from "@/lib/recommendations";
import OpportunityCard from "@/components/OpportunityCard";
import OpportunityCoverImage from "@/components/OpportunityCoverImage";

export default function CabinetSavedPage() {
  const { saved, toggle, ready } = useSaved();
  const { projects: orgProjects } = usePublicOrgProjects();

  const allOpportunities = useMemo(
    () => [...opportunities, ...orgProjects],
    [orgProjects]
  );

  const savedOpps = allOpportunities.filter((o) => saved.includes(o.slug));
  const expired   = savedOpps.filter((o) => { const d = getDaysUntilDeadline(o.deadline); return d !== null && d <= 0; });
  const active    = savedOpps.filter((o) => { const d = getDaysUntilDeadline(o.deadline); return d === null || d > 0; });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground">Збережені</h1>
          <p className="text-sm text-muted mt-0.5">{ready ? `${saved.length} збережено` : "Завантаження..."}</p>
        </div>
        <Link href="/opportunities"
          className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-dark transition-all">
          Знайти ще →
        </Link>
      </div>

      {!ready ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({length:4}).map((_,i) => <div key={i} className="h-36 bg-muted-bg rounded-2xl animate-pulse" />)}
        </div>
      ) : savedOpps.length === 0 ? (
        <div className="text-center py-20 bg-white border border-border rounded-2xl">
          <p className="text-5xl mb-4">🔖</p>
          <p className="text-base font-bold text-foreground mb-2">Нічого не збережено</p>
          <p className="text-sm text-muted mb-6">Зберігай цікаві програми, щоб не загубити</p>
          <Link href="/opportunities"
            className="inline-block px-6 py-3 bg-primary text-white font-semibold rounded-full text-sm hover:bg-primary-dark transition-all">
            Переглянути можливості
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active */}
          {active.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-foreground mb-3">Активні ({active.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {active.map((opp, i) => (
                  <OpportunityCard key={opp.slug} opp={opp} index={i} />
                ))}
              </div>
            </section>
          )}

          {/* Expired */}
          {expired.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-muted mb-3">Дедлайн минув ({expired.length})</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 opacity-60">
                {expired.map((opp) => (
                  <div key={opp.slug} className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 grayscale">
                      <OpportunityCoverImage photo={opp.photo} title={opp.title} type={opp.type} className="h-12" sizes="48px" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted mb-0.5">{opp.org}</p>
                      <p className="text-sm font-semibold text-foreground line-clamp-1">{opp.title}</p>
                      <p className="text-xs text-muted">{opp.deadlineDisplay}</p>
                    </div>
                    <button onClick={() => toggle(opp.slug)}
                      className="p-2 rounded-xl border border-border text-muted hover:border-red-300 hover:text-red-500 transition-all flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
