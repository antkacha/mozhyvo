"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

const badgeColors: Record<string, string> = {
  scholarship: "bg-primary-light text-primary",
  grant: "bg-yellow-100 text-yellow-700",
};

const HeartIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
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
);

export default function FeaturedSection() {
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
  }, []);

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
              Актуальні можливості
            </h2>
            <p className="text-gray-500 text-base mt-2">
              Відібрані програми з дедлайнами найближчих місяців
            </p>
          </div>
          <Link
            href="/opportunities"
            className="text-sm font-semibold text-primary hover:underline hidden sm:block mb-1"
          >
            Переглянути всі →
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Large left card — Erasmus, indigo gradient */}
          <div ref={leftRef} className="lg:col-span-3 slide-in-left">
            <div
              className="relative h-full min-h-[320px] rounded-2xl p-6 flex flex-col gap-4 overflow-hidden"
              style={{ background: "linear-gradient(135deg, #3B4FE8 0%, #6366F1 100%)" }}
            >
              {/* Decorative faded circle */}
              <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-white/10 pointer-events-none" />

              {/* Top row */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white text-primary">
                  🔄 Обмін
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-accent text-foreground">
                    15 лип
                  </span>
                  <span
                    className="text-white/60 hover:text-white transition-colors cursor-pointer"
                    aria-label="Зберегти"
                  >
                    <HeartIcon />
                  </span>
                </div>
              </div>

              {/* Org + title */}
              <div>
                <p className="text-sm text-white/75 mb-1">Erasmus+</p>
                <p className="text-xl font-bold text-white leading-snug">
                  Програма академічної мобільності для студентів університетів
                </p>
              </div>

              {/* Stat pills */}
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-white/20 text-sm text-white">
                  💰 До 1 000€/міс
                </span>
                <span className="px-3 py-1 rounded-full bg-white/20 text-sm text-white">
                  📅 10 місяців
                </span>
                <span className="px-3 py-1 rounded-full bg-white/20 text-sm text-white">
                  🎓 Бакалаври та магістри
                </span>
              </div>

              {/* Short description */}
              <p className="text-sm text-white/80 leading-relaxed">
                Програма підтримує навчання, стажування та молодіжні обміни в країнах ЄС.
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/15">
                <span className="text-sm text-white/70">🇪🇺 Євросоюз</span>
                <Link
                  href="/opportunities/erasmus-plus"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white text-primary font-semibold text-sm hover:bg-primary-light transition-all"
                >
                  Детальніше →
                </Link>
              </div>
            </div>
          </div>

          {/* Right column — 2 stacked cards */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* DAAD — blue top border, slides in from right */}
            <div
              ref={rightTopRef}
              className="slide-in-right bg-white rounded-2xl border border-border border-t-4 border-t-blue-500 shadow-sm flex flex-col p-6 gap-3 flex-1"
              style={{ transitionDelay: "150ms" }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeColors.scholarship}`}>
                  Стипендія
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted bg-muted-bg px-2.5 py-1 rounded-full font-medium">
                    1 серп
                  </span>
                  <span
                    className="text-muted hover:text-rose-500 transition-colors cursor-pointer"
                    aria-label="Зберегти"
                  >
                    <HeartIcon />
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-primary mb-1">DAAD</p>
                <p className="font-semibold text-foreground text-sm leading-snug">
                  Дослідницькі стипендії для аспірантів і вчених
                </p>
              </div>
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                <span className="text-sm text-muted">🇩🇪 Німеччина</span>
                <Link
                  href="/opportunities/daad-research"
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Детальніше →
                </Link>
              </div>
            </div>

            {/* UCU — green top border, slides in from right with more delay */}
            <div
              ref={rightBottomRef}
              className="slide-in-right bg-white rounded-2xl border border-border border-t-4 border-t-emerald-500 shadow-sm flex flex-col p-6 gap-3 flex-1"
              style={{ transitionDelay: "300ms" }}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeColors.grant}`}>
                  Грант
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted bg-muted-bg px-2.5 py-1 rounded-full font-medium">
                    30 чер
                  </span>
                  <span
                    className="text-muted hover:text-rose-500 transition-colors cursor-pointer"
                    aria-label="Зберегти"
                  >
                    <HeartIcon />
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-primary mb-1">
                  Український Католицький Університет
                </p>
                <p className="font-semibold text-foreground text-sm leading-snug">
                  Грант на навчання для вимушено переміщених осіб
                </p>
              </div>
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                <span className="text-sm text-muted">🇺🇦 Україна</span>
                <Link
                  href="/opportunities/ucu-grant"
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Детальніше →
                </Link>
              </div>
            </div>

          </div>
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/opportunities"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Переглянути всі →
          </Link>
        </div>
      </div>
    </section>
  );
}
