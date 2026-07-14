"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

const quickFilters = [
  { emoji: "🎓", label: "Стипендії",    slug: "scholarships", color: "bg-primary-light text-primary hover:bg-primary hover:text-white" },
  { emoji: "💼", label: "Стажування",   slug: "internships",  color: "bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white" },
  { emoji: "🌍", label: "Обміни",       slug: "exchanges",    color: "bg-green-50 text-green-700 hover:bg-green-600 hover:text-white" },
  { emoji: "🤝", label: "Волонтерство", slug: "volunteering", color: "bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white" },
  { emoji: "🏆", label: "Конкурси",     slug: "competitions", color: "bg-orange-50 text-orange-700 hover:bg-orange-500 hover:text-white" },
  { emoji: "🚀", label: "Гранти",       slug: "grants",       color: "bg-yellow-50 text-yellow-700 hover:bg-yellow-500 hover:text-white" },
];

// Countries where opportunities exist
const COUNTRIES = [
  { flag: "🇩🇪", name: "Німеччина" },
  { flag: "🇺🇸", name: "США" },
  { flag: "🇬🇧", name: "Велика Британія" },
  { flag: "🇫🇷", name: "Франція" },
  { flag: "🇵🇱", name: "Польща" },
  { flag: "🇳🇱", name: "Нідерланди" },
  { flag: "🇨🇿", name: "Чехія" },
  { flag: "🇦🇹", name: "Австрія" },
  { flag: "🇸🇪", name: "Швеція" },
  { flag: "🇨🇦", name: "Канада" },
  { flag: "🇯🇵", name: "Японія" },
  { flag: "🇦🇺", name: "Австралія" },
  { flag: "🇨🇭", name: "Швейцарія" },
  { flag: "🇳🇴", name: "Норвегія" },
  { flag: "🇧🇪", name: "Бельгія" },
  { flag: "🇮🇹", name: "Італія" },
  { flag: "🇪🇸", name: "Іспанія" },
  { flag: "🇫🇮", name: "Фінляндія" },
  { flag: "🇰🇷", name: "Корея" },
  { flag: "🇺🇦", name: "Україна" },
];

export default function OpportunitiesHero() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden bg-white border-b border-gray-100">
      {/* Soft glow */}
      <div
        aria-hidden
        className="absolute -top-20 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(59,79,232,0.05) 0%, transparent 65%)" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/25 bg-white text-primary text-xs font-semibold shadow-sm mb-6">
              <span>✦</span>
              Всі можливості в одному місці
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-[1.05] mb-4">
              Можливості
            </h1>
            <p className="text-gray-500 text-lg max-w-md mb-8">
              Гранти, стипендії, стажування, обміни та більше — для молоді України.
            </p>

            {/* Category chips */}
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

          {/* Right: country flags mosaic */}
          <div className="hidden lg:block">
            <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">
              Де шукати можливості
            </p>
            <div className="flex flex-wrap gap-2">
              {COUNTRIES.map((c) => (
                <button
                  key={c.name}
                  onClick={() => router.push(`/opportunities?country=${encodeURIComponent(c.name)}`)}
                  className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-border rounded-xl text-sm text-foreground hover:border-primary hover:text-primary hover:shadow-sm transition-all duration-150"
                >
                  <span className="text-base leading-none">{c.flag}</span>
                  <span className="font-medium text-[13px]">{c.name}</span>
                </button>
              ))}
              <div className="inline-flex items-center px-3 py-2 rounded-xl text-sm text-muted">
                та інші →
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
