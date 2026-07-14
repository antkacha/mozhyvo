"use client";

import Link from "next/link";

const quickFilters = [
  { emoji: "🎓", label: "Стипендії",    slug: "scholarships", color: "bg-primary-light text-primary hover:bg-primary hover:text-white" },
  { emoji: "💼", label: "Стажування",   slug: "internships",  color: "bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white" },
  { emoji: "🌍", label: "Обміни",       slug: "exchanges",    color: "bg-green-50 text-green-700 hover:bg-green-600 hover:text-white" },
  { emoji: "🤝", label: "Волонтерство", slug: "volunteering", color: "bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white" },
  { emoji: "🏆", label: "Конкурси",     slug: "competitions", color: "bg-orange-50 text-orange-700 hover:bg-orange-500 hover:text-white" },
  { emoji: "🚀", label: "Гранти",       slug: "grants",       color: "bg-yellow-50 text-yellow-700 hover:bg-yellow-500 hover:text-white" },
];

export default function OpportunitiesHero() {

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

          {/* Right: orbital accent */}
          <div className="hidden lg:flex items-center justify-center h-[300px]">
            <svg viewBox="0 0 480 300" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="orb" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#5B6FFF"/>
                  <stop offset="100%" stopColor="#3B4FE8"/>
                </linearGradient>
              </defs>

              {/* Outer decorative rings */}
              <circle cx="270" cy="150" r="142" stroke="#3B4FE8" strokeOpacity=".06" strokeWidth="1"/>
              <circle cx="270" cy="150" r="113" stroke="#3B4FE8" strokeOpacity=".12" strokeWidth="1"/>
              <circle cx="270" cy="150" r="86"  stroke="#3B4FE8" strokeOpacity=".22" strokeWidth="1.5"/>

              {/* Soft glow behind main circle */}
              <circle cx="270" cy="150" r="70" fill="#3B4FE8" fillOpacity=".1"/>

              {/* Main bold circle */}
              <circle cx="270" cy="150" r="57" fill="url(#orb)"/>
              {/* Inner shimmer */}
              <circle cx="270" cy="150" r="42" fill="white" fillOpacity=".1"/>

              {/* Arrow icon → */}
              <path d="M255 150 L281 150" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M274 142 L283 150 L274 158" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>

              {/* Satellite dots on ring 113 */}
              <circle cx="270" cy="37"  r="7"   fill="#3B4FE8" fillOpacity=".55"/>
              <circle cx="383" cy="150" r="6"   fill="#3B4FE8" fillOpacity=".5"/>
              <circle cx="270" cy="263" r="5.5" fill="#3B4FE8" fillOpacity=".45"/>
              <circle cx="157" cy="150" r="5"   fill="#3B4FE8" fillOpacity=".4"/>
              <circle cx="352" cy="67"  r="4.5" fill="#3B4FE8" fillOpacity=".38"/>
              <circle cx="188" cy="67"  r="4"   fill="#3B4FE8" fillOpacity=".32"/>

              {/* Small accent dots */}
              <circle cx="100" cy="75"  r="3.5" fill="#3B4FE8" fillOpacity=".2"/>
              <circle cx="432" cy="98"  r="3"   fill="#3B4FE8" fillOpacity=".18"/>
              <circle cx="420" cy="215" r="3.5" fill="#3B4FE8" fillOpacity=".18"/>
              <circle cx="108" cy="232" r="3"   fill="#3B4FE8" fillOpacity=".15"/>
              <circle cx="46"  cy="150" r="2.5" fill="#3B4FE8" fillOpacity=".15"/>
              <circle cx="460" cy="150" r="2.5" fill="#3B4FE8" fillOpacity=".12"/>
            </svg>
          </div>

        </div>
      </div>
    </section>
  );
}
