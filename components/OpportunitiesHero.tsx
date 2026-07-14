"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  { emoji: "🎓", label: "Стипендії",    slug: "scholarships",  color: "hover:bg-violet-500" },
  { emoji: "💼", label: "Стажування",   slug: "internships",   color: "hover:bg-blue-500" },
  { emoji: "🌍", label: "Обміни",       slug: "exchanges",     color: "hover:bg-green-500" },
  { emoji: "🤝", label: "Волонтерство", slug: "volunteering",  color: "hover:bg-teal-500" },
  { emoji: "🏆", label: "Конкурси",     slug: "competitions",  color: "hover:bg-orange-500" },
  { emoji: "🚀", label: "Гранти",       slug: "grants",        color: "hover:bg-yellow-500" },
];

export default function OpportunitiesHero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/opportunities?q=${encodeURIComponent(q)}` : "/opportunities");
  }

  return (
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

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-16 lg:py-20 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 text-white text-xs font-semibold mb-6">
          <span>✦</span>
          Безкоштовно для молоді України
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.02] mb-4">
          Знайди свою<br />можливість
        </h1>
        <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
          Гранти, стипендії, стажування та обміни — все в одному місці.
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="relative mb-8">
          <div className="flex items-center bg-white rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
            <svg className="w-5 h-5 text-muted ml-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Назва програми, організація, країна..."
              className="flex-1 px-4 py-4 text-base text-foreground placeholder:text-muted bg-transparent focus:outline-none"
            />
            <button
              type="submit"
              className="m-1.5 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary-dark transition-all flex-shrink-0"
            >
              Знайти
            </button>
          </div>
        </form>

        {/* Category chips */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-white/40 text-xs font-medium mr-1">Швидкий пошук:</span>
          {CATEGORIES.map((c) => (
            <button
              key={c.slug}
              onClick={() => router.push(`/opportunities?category=${c.slug}`)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-semibold border border-white/20 bg-white/10 text-white transition-all duration-150 hover:text-white hover:border-transparent ${c.color}`}
            >
              <span>{c.emoji}</span>
              {c.label}
            </button>
          ))}
        </div>

      </div>
    </section>
  );
}
