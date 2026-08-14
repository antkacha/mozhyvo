"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePublicOrgProjects } from "@/hooks/usePublicOrgProjects";
import { typeColors, typeNames } from "@/lib/data";
import { getDaysUntilDeadline } from "@/lib/recommendations";
import type { Opportunity } from "@/lib/data";
import OpportunityCoverImage from "@/components/OpportunityCoverImage";

function OpportunityGridCard({
  opp,
  refProp,
  delay,
  accentColor,
}: {
  opp: Opportunity;
  refProp: (el: HTMLDivElement | null) => void;
  delay: string;
  accentColor: string;
}) {
  return (
    <div
      ref={refProp}
      className={`slide-in-right bg-white rounded-2xl border border-border border-t-4 shadow-sm flex flex-col h-full overflow-hidden ${accentColor}`}
      style={{ transitionDelay: delay }}
    >
      <OpportunityCoverImage
        photo={opp.photo}
        title={opp.title}
        type={opp.type}
        className="!aspect-auto h-24"
        sizes="(max-width: 767px) 100vw, 50vw"
      />
      <div className="flex flex-col p-6 gap-3 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeColors[opp.type] ?? "bg-muted-bg text-muted"}`}>
            {opp.typeName || typeNames[opp.type] || opp.type}
          </span>
          <span className="text-xs text-muted bg-muted-bg px-2.5 py-1 rounded-full font-medium">
            {opp.deadlineDisplay || "—"}
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold text-primary mb-1 truncate">{opp.org}</p>
          <p className="font-semibold text-foreground text-sm leading-snug line-clamp-2">{opp.title}</p>
        </div>
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
          <span className="text-sm text-muted">{opp.flag} {opp.country}</span>
          <Link
            href={`/opportunities/${opp.slug}`}
            className="text-sm font-semibold text-primary hover:underline"
          >
            Детальніше →
          </Link>
        </div>
      </div>
    </div>
  );
}

const ACCENT_COLORS = [
  "border-t-blue-500",
  "border-t-emerald-500",
  "border-t-orange-500",
  "border-t-violet-500",
];

export default function FeaturedSection() {
  const { projects, ready } = usePublicOrgProjects();
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    cardRefs.current.forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [projects]);

  if (!ready) {
    return (
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="h-8 bg-muted-bg rounded w-64 mb-10 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-72 bg-muted-bg rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Top 4 opportunities by nearest deadline — items with no deadline
  // (rolling/ASAP) sort last instead of being excluded.
  const featured = [...projects]
    .sort((a, b) => (getDaysUntilDeadline(a.deadline) ?? Infinity) - (getDaysUntilDeadline(b.deadline) ?? Infinity))
    .slice(0, 4);

  if (featured.length === 0) {
    return (
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Актуальні можливості</h2>
              <p className="text-gray-500 text-base mt-2">Відібрані програми з дедлайнами найближчих місяців</p>
            </div>
          </div>
          <div className="text-center py-16 rounded-2xl border border-dashed border-border">
            <p className="text-2xl mb-3">🔍</p>
            <p className="text-foreground font-semibold mb-1">Скоро тут з&apos;являться можливості</p>
            <p className="text-sm text-muted mb-5">Наразі організації готують програми для вас</p>
            <Link href="/opportunities" className="text-sm font-semibold text-primary hover:underline">
              Переглянути каталог →
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Актуальні можливості</h2>
            <p className="text-gray-500 text-base mt-2">Відібрані програми з дедлайнами найближчих місяців</p>
          </div>
          <Link href="/opportunities" className="text-sm font-semibold text-primary hover:underline hidden sm:block mb-1">
            Переглянути всі →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {featured.map((opp, i) => (
            <OpportunityGridCard
              key={opp.slug}
              opp={opp}
              refProp={(el) => { cardRefs.current[i] = el; }}
              delay={`${i * 100}ms`}
              accentColor={ACCENT_COLORS[i % ACCENT_COLORS.length]}
            />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link href="/opportunities" className="text-sm font-semibold text-primary hover:underline">
            Переглянути всі →
          </Link>
        </div>
      </div>
    </section>
  );
}
