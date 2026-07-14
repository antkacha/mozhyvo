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

          {/* Right: abstract constellation */}
          <div className="hidden lg:flex items-center justify-center h-[300px]">
            <svg viewBox="0 0 480 300" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Lines */}
              <line x1="80"  y1="60"  x2="200" y2="130" stroke="#3B4FE8" strokeOpacity=".15" strokeWidth="1"/>
              <line x1="200" y1="130" x2="340" y2="80"  stroke="#3B4FE8" strokeOpacity=".15" strokeWidth="1"/>
              <line x1="340" y1="80"  x2="400" y2="180" stroke="#3B4FE8" strokeOpacity=".15" strokeWidth="1"/>
              <line x1="200" y1="130" x2="260" y2="220" stroke="#3B4FE8" strokeOpacity=".15" strokeWidth="1"/>
              <line x1="260" y1="220" x2="400" y2="180" stroke="#3B4FE8" strokeOpacity=".15" strokeWidth="1"/>
              <line x1="80"  y1="60"  x2="120" y2="190" stroke="#3B4FE8" strokeOpacity=".1"  strokeWidth="1"/>
              <line x1="120" y1="190" x2="260" y2="220" stroke="#3B4FE8" strokeOpacity=".1"  strokeWidth="1"/>
              <line x1="340" y1="80"  x2="260" y2="220" stroke="#3B4FE8" strokeOpacity=".08" strokeWidth="1"/>
              <line x1="200" y1="130" x2="120" y2="190" stroke="#3B4FE8" strokeOpacity=".08" strokeWidth="1"/>
              <line x1="80"  y1="60"  x2="340" y2="80"  stroke="#3B4FE8" strokeOpacity=".06" strokeWidth="1"/>
              <line x1="400" y1="180" x2="440" y2="100" stroke="#3B4FE8" strokeOpacity=".1"  strokeWidth="1"/>
              <line x1="340" y1="80"  x2="440" y2="100" stroke="#3B4FE8" strokeOpacity=".1"  strokeWidth="1"/>
              <line x1="40"  y1="200" x2="120" y2="190" stroke="#3B4FE8" strokeOpacity=".08" strokeWidth="1"/>
              <line x1="40"  y1="200" x2="80"  y2="60"  stroke="#3B4FE8" strokeOpacity=".05" strokeWidth="1"/>

              {/* Outer glow rings on key nodes */}
              <circle cx="200" cy="130" r="22" fill="#3B4FE8" fillOpacity=".06"/>
              <circle cx="340" cy="80"  r="16" fill="#3B4FE8" fillOpacity=".06"/>
              <circle cx="260" cy="220" r="14" fill="#3B4FE8" fillOpacity=".06"/>

              {/* Nodes — small */}
              <circle cx="80"  cy="60"  r="3.5" fill="#3B4FE8" fillOpacity=".3"/>
              <circle cx="120" cy="190" r="3.5" fill="#3B4FE8" fillOpacity=".3"/>
              <circle cx="400" cy="180" r="3.5" fill="#3B4FE8" fillOpacity=".3"/>
              <circle cx="440" cy="100" r="3"   fill="#3B4FE8" fillOpacity=".2"/>
              <circle cx="40"  cy="200" r="3"   fill="#3B4FE8" fillOpacity=".2"/>

              {/* Nodes — medium */}
              <circle cx="340" cy="80"  r="6"   fill="#3B4FE8" fillOpacity=".4"/>
              <circle cx="260" cy="220" r="5"   fill="#3B4FE8" fillOpacity=".35"/>

              {/* Main node */}
              <circle cx="200" cy="130" r="10"  fill="#3B4FE8" fillOpacity=".9"/>
              <circle cx="200" cy="130" r="5"   fill="white"/>
            </svg>
          </div>

        </div>
      </div>
    </section>
  );
}
