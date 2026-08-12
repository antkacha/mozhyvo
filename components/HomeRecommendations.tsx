"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { usePublicOrgProjects } from "@/hooks/usePublicOrgProjects";
import { getRecommendations } from "@/lib/recommendations";
import OpportunityCard from "@/components/OpportunityCard";

export default function HomeRecommendations() {
  const { user } = useAuth();
  const { profile, ready: profileReady } = useProfile();
  const { projects, ready: projectsReady } = usePublicOrgProjects();

  if (!user || !profileReady || !projectsReady) return null;

  const recs = getRecommendations(projects, profile, 3);
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
          {recs.map((opp, i) => (
            <OpportunityCard key={opp.slug} opp={opp} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
