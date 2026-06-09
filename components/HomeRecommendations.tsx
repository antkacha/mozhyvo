"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { getRecommendations, getDaysUntilDeadline } from "@/lib/recommendations";
import { opportunities, typeColors } from "@/lib/data";

export default function HomeRecommendations() {
  const { user } = useAuth();
  const { profile, ready } = useProfile();

  if (!user || !ready) return null;

  const recs = getRecommendations(opportunities, profile, 3);
  if (recs.length === 0) return null;

  return (
    <section className="bg-primary-light border-t border-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">✨ Для тебе</p>
            <h2 className="text-xl font-black text-foreground">Рекомендовано</h2>
          </div>
          <Link href="/opportunities" className="text-sm font-semibold text-primary hover:underline">Всі →</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {recs.map((opp) => {
            const days = getDaysUntilDeadline(opp.deadline);
            return (
              <Link key={opp.slug} href={`/opportunities/${opp.slug}`}
                className="bg-white rounded-2xl border border-border/60 p-5 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all group">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeColors[opp.type]}`}>{opp.typeName}</span>
                  {days <= 7 && days > 0 && <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">⏰ {days}д</span>}
                </div>
                <p className="text-xs font-semibold text-muted mb-1 uppercase tracking-wide">{opp.org}</p>
                <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-3">{opp.title}</p>
                <p className="text-xs text-muted">{opp.flag} {opp.location} · {opp.deadlineDisplay}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
