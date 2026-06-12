"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePublicOrgProjects } from "@/hooks/usePublicOrgProjects";
import { typeColors, typeNames, fundingLabels } from "@/lib/data";
import type { Opportunity } from "@/lib/data";

function SmallCard({
  opp,
  refProp,
  delay,
  accentColor,
}: {
  opp: Opportunity;
  refProp: React.RefObject<HTMLDivElement>;
  delay: string;
  accentColor: string;
}) {
  return (
    <div
      ref={refProp}
      className={`slide-in-right bg-white rounded-2xl border border-border border-t-4 shadow-sm flex flex-col p-6 gap-3 flex-1 ${accentColor}`}
      style={{ transitionDelay: delay }}
    >
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
  const leftRef = useRef<HTMLDivElement>(null);
  const rightTopRef = useRef<HTMLDivElement>(null);
  const rightBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = [leftRef.current, rightTopRef.current, rightBottomRef.current];
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
    els.forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [projects]);

  if (!ready) {
    return (
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="h-8 bg-muted-bg rounded w-64 mb-10 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 h-80 bg-muted-bg rounded-2xl animate-pulse" />
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="flex-1 h-36 bg-muted-bg rounded-2xl animate-pulse" />
              <div className="flex-1 h-36 bg-muted-bg rounded-2xl animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Take up to 3 most recent published projects
  const featured = projects.slice(0, 3);

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

  const main = featured[0];
  const rest = featured.slice(1);

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

        <div className={`grid grid-cols-1 gap-6 ${rest.length > 0 ? "lg:grid-cols-5" : ""}`}>

          {/* Large left card */}
          <div ref={leftRef} className={`slide-in-left ${rest.length > 0 ? "lg:col-span-3" : ""}`}>
            <div
              className="relative h-full min-h-[320px] rounded-2xl p-6 flex flex-col gap-4 overflow-hidden"
              style={{ background: "linear-gradient(135deg, #3B4FE8 0%, #6366F1 100%)" }}
            >
              <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />

              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white text-primary">
                  {main.typeName || typeNames[main.type] || main.type}
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-accent text-foreground">
                  {main.deadlineDisplay || "—"}
                </span>
              </div>

              <div>
                <p className="text-sm text-white/75 mb-1">{main.org}</p>
                <p className="text-xl font-bold text-white leading-snug">{main.title}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {main.funding && (
                  <span className="px-3 py-1 rounded-full bg-white/20 text-sm text-white">
                    💰 {fundingLabels[main.funding]}
                  </span>
                )}
                {main.duration && (
                  <span className="px-3 py-1 rounded-full bg-white/20 text-sm text-white">
                    📅 {main.duration}
                  </span>
                )}
                {(main.ageMin || main.ageMax) && (
                  <span className="px-3 py-1 rounded-full bg-white/20 text-sm text-white">
                    🎓 {main.ageMin && main.ageMax ? `${main.ageMin}–${main.ageMax} р.` : main.ageMax ? `до ${main.ageMax} р.` : `від ${main.ageMin} р.`}
                  </span>
                )}
              </div>

              {main.shortDescription && (
                <p className="text-sm text-white/80 leading-relaxed line-clamp-2">{main.shortDescription}</p>
              )}

              <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/15">
                <span className="text-sm text-white/70">{main.flag} {main.country}</span>
                <Link
                  href={`/opportunities/${main.slug}`}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white text-primary font-semibold text-sm hover:bg-primary-light transition-all"
                >
                  Детальніше →
                </Link>
              </div>
            </div>
          </div>

          {/* Right column */}
          {rest.length > 0 && (
            <div className="lg:col-span-2 flex flex-col gap-6">
              {rest.map((opp, i) => (
                <SmallCard
                  key={opp.slug}
                  opp={opp}
                  refProp={i === 0 ? rightTopRef : rightBottomRef}
                  delay={`${(i + 1) * 150}ms`}
                  accentColor={ACCENT_COLORS[i % ACCENT_COLORS.length]}
                />
              ))}
            </div>
          )}
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
