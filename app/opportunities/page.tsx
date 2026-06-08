import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import OpportunitiesCatalog from "@/components/OpportunitiesCatalog";
import GuestBanner from "@/components/GuestBanner";

const quickFilters = [
  { emoji: "🎓", label: "Стипендії", slug: "scholarships", color: "bg-primary-light text-primary hover:bg-primary hover:text-white" },
  { emoji: "💼", label: "Стажування", slug: "internships", color: "bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white" },
  { emoji: "🌍", label: "Обміни", slug: "exchanges", color: "bg-green-50 text-green-700 hover:bg-green-600 hover:text-white" },
  { emoji: "🤝", label: "Волонтерство", slug: "volunteering", color: "bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white" },
  { emoji: "🏆", label: "Конкурси", slug: "competitions", color: "bg-orange-50 text-orange-700 hover:bg-orange-500 hover:text-white" },
  { emoji: "🚀", label: "Гранти", slug: "grants", color: "bg-yellow-50 text-yellow-700 hover:bg-yellow-500 hover:text-white" },
];

export const metadata: Metadata = {
  title: "Можливості — Моживо",
  description:
    "Гранти, стипендії, стажування, обміни та більше — для молоді України. Фільтруй за типом, країною та форматом.",
};

function CatalogSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-11 bg-muted-bg rounded-xl mb-6 max-w-xl" />
      <div className="flex gap-8">
        <div className="hidden lg:block w-52 flex-shrink-0 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-5 bg-muted-bg rounded" />
          ))}
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-muted-bg rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function OpportunitiesPage() {
  return (
    <>
      {/* ── Hero header ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white border-b border-gray-100">
        {/* Soft glow */}
        <div
          aria-hidden
          className="absolute -top-20 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(59,79,232,0.05) 0%, transparent 65%)" }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left: text + stats + chips */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/25 bg-white text-primary text-xs font-semibold shadow-sm mb-6">
                <span>✦</span>
                Всі можливості в одному місці
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-[1.05] mb-4">
                Можливості
              </h1>
              <p className="text-gray-500 text-lg max-w-md">
                Гранти, стипендії, стажування, обміни та більше — для молоді України.
              </p>

              <div className="flex items-stretch gap-8 mt-8 mb-8">
                <div>
                  <p className="text-3xl font-black text-primary leading-none">1200+</p>
                  <p className="text-sm text-gray-500 mt-1.5">можливостей</p>
                </div>
                <div className="w-px bg-gray-100" />
                <div>
                  <p className="text-3xl font-black text-primary leading-none">40+</p>
                  <p className="text-sm text-gray-500 mt-1.5">країн</p>
                </div>
                <div className="w-px bg-gray-100" />
                <div>
                  <p className="text-3xl font-black text-primary leading-none">0₴</p>
                  <p className="text-sm text-gray-500 mt-1.5">завжди безкоштовно</p>
                </div>
              </div>

              {/* Quick-filter category chips */}
              <div className="flex flex-wrap gap-2.5">
                {quickFilters.map((f) => (
                  <Link
                    key={f.slug}
                    href={`/opportunities?category=${f.slug}`}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${f.color}`}
                  >
                    <span>{f.emoji}</span>
                    {f.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: decorative floating cards (desktop only) */}
            <div className="hidden lg:block relative h-[320px]">

              {/* Card 1 — Erasmus, primary bg, float1 */}
              <div className="absolute animate-float1" style={{ top: "20px", left: "20px", width: "270px" }}>
                <div className="bg-primary rounded-2xl p-5 shadow-2xl shadow-primary/25 text-white">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/15">🎓 Стипендія</span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-accent text-foreground">Топ</span>
                  </div>
                  <p className="font-extrabold text-base leading-tight mb-1">Erasmus+ 2025</p>
                  <p className="text-white/65 text-xs mb-3">Навчання в ЄС · До 1 000€/міс</p>
                  <div className="bg-white/10 rounded-full h-1.5 mb-1">
                    <div className="bg-accent h-1.5 rounded-full w-[65%]" />
                  </div>
                  <p className="text-white/50 text-xs">65% місць зайнято</p>
                </div>
              </div>

              {/* Card 2 — white, float2 */}
              <div className="absolute animate-float2" style={{ top: "155px", left: "80px", width: "250px" }}>
                <div className="bg-white rounded-2xl p-4 shadow-xl border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-700">🌍 Обмін</span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-700">Відкрито</span>
                  </div>
                  <p className="font-bold text-foreground text-sm leading-snug mb-1">Fulbright Graduate Student Program</p>
                  <p className="text-xs text-muted">🇺🇸 США · Повне фінансування</p>
                </div>
              </div>

              {/* Card 3 — notification, float3 */}
              <div className="absolute animate-float3" style={{ top: "10px", right: "0px", width: "170px" }}>
                <div className="bg-white rounded-2xl p-3.5 shadow-lg border border-border">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0 text-sm">🔔</div>
                    <div>
                      <p className="text-xs font-bold text-foreground leading-tight">Новий дедлайн</p>
                      <p className="text-xs text-muted mt-0.5">DAAD · 5 днів</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── Catalog ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <GuestBanner />
        <Suspense fallback={<CatalogSkeleton />}>
          <OpportunitiesCatalog />
        </Suspense>
      </div>
    </>
  );
}
