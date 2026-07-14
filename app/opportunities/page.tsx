import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import OpportunitiesCatalog from "@/components/OpportunitiesCatalog";
import GuestBanner from "@/components/GuestBanner";

const quickFilters = [
  { emoji: "🎓", label: "Стипендії",   slug: "scholarships" },
  { emoji: "💼", label: "Стажування",  slug: "internships" },
  { emoji: "🌍", label: "Обміни",      slug: "exchanges" },
  { emoji: "🤝", label: "Волонтерство",slug: "volunteering" },
  { emoji: "🏆", label: "Конкурси",    slug: "competitions" },
  { emoji: "🚀", label: "Гранти",      slug: "grants" },
];

export const metadata: Metadata = {
  title: "Можливості для молоді України — гранти, стипендії, обміни",
  description:
    "Понад 1200 грантів, стипендій, стажувань та програм обміну для молоді України. Erasmus+, DAAD, Фулбрайт та сотні інших — в одному місці.",
  keywords: [
    "гранти молодь Україна", "стипендії для студентів", "Erasmus+ Україна",
    "програми обміну студентів", "стажування за кордоном", "волонтерство Україна",
  ],
  alternates: { canonical: "https://mozhyvo.ua/opportunities" },
  openGraph: {
    title: "Можливості для молоді України",
    description: "Понад 1200 грантів, стипендій та обмінів в одному місці",
    url: "https://mozhyvo.ua/opportunities",
    images: [{ url: "https://mozhyvo.ua/opengraph-image", width: 1200, height: 630 }],
  },
};

function CatalogSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-11 bg-muted-bg rounded-xl mb-6 max-w-xl" />
      <div className="flex gap-8">
        <div className="hidden lg:block w-56 flex-shrink-0 space-y-3">
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
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-primary">
        {/* Dot grid */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Bottom fade into page */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#f5f6fb] to-transparent pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 text-white text-xs font-semibold mb-6">
                <span>✦</span>
                Всі можливості в одному місці
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.02] mb-4">
                Можливості
              </h1>
              <p className="text-white/60 text-lg max-w-md mb-8">
                Гранти, стипендії, стажування та обміни — безкоштовно для молоді України.
              </p>

              {/* Stats */}
              <div className="flex items-stretch gap-8 mb-8">
                <div>
                  <p className="text-3xl font-black text-white leading-none">1200+</p>
                  <p className="text-sm text-white/50 mt-1.5">можливостей</p>
                </div>
                <div className="w-px bg-white/15" />
                <div>
                  <p className="text-3xl font-black text-white leading-none">40+</p>
                  <p className="text-sm text-white/50 mt-1.5">країн</p>
                </div>
                <div className="w-px bg-white/15" />
                <div>
                  <p className="text-3xl font-black text-white leading-none">0₴</p>
                  <p className="text-sm text-white/50 mt-1.5">завжди безкоштовно</p>
                </div>
              </div>

              {/* Category chips */}
              <div className="flex flex-wrap gap-2">
                {quickFilters.map((f) => (
                  <Link
                    key={f.slug}
                    href={`/opportunities?category=${f.slug}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border border-white/20 bg-white/10 text-white hover:bg-white hover:text-primary transition-all duration-200"
                  >
                    <span>{f.emoji}</span>
                    {f.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right: decorative floating cards */}
            <div className="hidden lg:block relative h-[300px]">
              <div className="absolute animate-float1" style={{ top: "16px", left: "16px", width: "270px" }}>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-5 text-white">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/15">🎓 Стипендія</span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-accent text-foreground">Топ</span>
                  </div>
                  <p className="font-extrabold text-base leading-tight mb-1">Erasmus+ 2025</p>
                  <p className="text-white/60 text-xs mb-3">Навчання в ЄС · До 1 000€/міс</p>
                  <div className="bg-white/10 rounded-full h-1.5 mb-1">
                    <div className="bg-accent h-1.5 rounded-full w-[65%]" />
                  </div>
                  <p className="text-white/50 text-xs">65% місць зайнято</p>
                </div>
              </div>

              <div className="absolute animate-float2" style={{ top: "148px", left: "72px", width: "252px" }}>
                <div className="bg-white rounded-2xl p-4 shadow-xl border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-700">🌍 Обмін</span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-700">Відкрито</span>
                  </div>
                  <p className="font-bold text-foreground text-sm leading-snug mb-1">Fulbright Graduate Student Program</p>
                  <p className="text-xs text-muted">🇺🇸 США · Повне фінансування</p>
                </div>
              </div>

              <div className="absolute animate-float3" style={{ top: "8px", right: "0px", width: "170px" }}>
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
      <div className="bg-[#f5f6fb] min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <GuestBanner />
          <Suspense fallback={<CatalogSkeleton />}>
            <OpportunitiesCatalog />
          </Suspense>
        </div>
      </div>
    </>
  );
}
