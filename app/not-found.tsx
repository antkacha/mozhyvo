import Link from "next/link";
import type { Metadata } from "next";
import { opportunities } from "@/lib/data";

export const metadata: Metadata = {
  title: "404 — Сторінку не знайдено",
  robots: { index: false, follow: false },
};

const POPULAR = opportunities.filter((o) => o.featured).slice(0, 3);

const QUICK_LINKS = [
  { href: "/opportunities",                       label: "Всі можливості", emoji: "🔍" },
  { href: "/opportunities?category=scholarships", label: "Стипендії",      emoji: "🎓" },
  { href: "/opportunities?category=internships",  label: "Стажування",     emoji: "💼" },
  { href: "/opportunities?category=exchanges",    label: "Обміни",         emoji: "✈️" },
];

export default function NotFound() {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-16">
      {/* Big number */}
      <div className="relative mb-8 select-none">
        <p className="text-[160px] sm:text-[200px] font-black leading-none text-primary/8 tracking-tighter">
          404
        </p>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center shadow-xl shadow-primary/30">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Text */}
      <div className="text-center max-w-lg mb-10">
        <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-3 leading-tight">
          Цю сторінку не знайдено
        </h1>
        <p className="text-muted text-base leading-relaxed">
          Схоже, вона переїхала або ніколи не існувала. Але твоя можливість точно десь тут — переглянь розділи нижче.
        </p>
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-2 justify-center mb-12">
        {QUICK_LINKS.map(({ href, label, emoji }) => (
          <Link key={href} href={href}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-border bg-white text-sm font-semibold text-foreground hover:border-primary hover:text-primary hover:shadow-sm transition-all">
            <span>{emoji}</span>
            {label}
          </Link>
        ))}
      </div>

      {/* Popular opportunities */}
      {POPULAR.length > 0 && (
        <div className="w-full max-w-2xl">
          <p className="text-xs font-bold text-muted uppercase tracking-wider mb-4 text-center">
            Популярні можливості
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {POPULAR.map((opp) => (
              <Link key={opp.slug} href={`/opportunities/${opp.slug}`}
                className="group bg-white rounded-2xl border border-border p-4 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all">
                <p className="text-xs font-semibold text-muted mb-1 truncate">{opp.org}</p>
                <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-2">
                  {opp.title}
                </p>
                <p className="text-xs text-muted">{opp.flag} {opp.location}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/"
          className="px-6 py-3 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all shadow-md shadow-primary/20">
          ← На головну
        </Link>
        <Link href="/opportunities"
          className="px-6 py-3 rounded-full border border-border text-foreground font-semibold text-sm hover:border-primary hover:text-primary transition-all">
          Усі можливості
        </Link>
      </div>
    </div>
  );
}
