import type { Metadata } from "next";
import Link from "next/link";
import FeaturedSection from "@/components/FeaturedSection";
import HomeRecommendations from "@/components/HomeRecommendations";
import NewsletterSubscribe from "@/components/NewsletterSubscribe";

export const metadata: Metadata = {
  alternates: { canonical: "https://mozhyvo.ua" },
};

const CATEGORIES = [
  { label: "Стипендії",   href: "/opportunities?category=scholarships" },
  { label: "Гранти",      href: "/opportunities?category=grants" },
  { label: "Стажування",  href: "/opportunities?category=internships" },
  { label: "Обміни",      href: "/opportunities?category=exchanges" },
  { label: "Волонтерство",href: "/opportunities?category=volunteering" },
  { label: "Конкурси",    href: "/opportunities?category=competitions" },
];

const PILLARS = [
  {
    num: "01",
    title: "Все в одному місці",
    desc: "Більше не треба шукати по десятках Telegram-каналів. Гранти, стажування, обміни — тут.",
  },
  {
    num: "02",
    title: "Не пропустіть дедлайн",
    desc: "Зберігайте цікаві можливості і отримуйте нагадування до закінчення прийому заявок.",
  },
  {
    num: "03",
    title: "Тільки перевірені організації",
    desc: "Всі партнери верифіковані командою Моживо. Жодного шахрайства.",
  },
];

export default function Home() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative bg-[#07091A] overflow-hidden">
        {/* Architectural grid */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />
        {/* Blue glow — top right */}
        <div
          aria-hidden
          className="absolute -top-32 right-0 w-[900px] h-[700px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 80% 0%, rgba(59,79,232,0.35) 0%, transparent 65%)" }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 md:pt-28 md:pb-40">

          {/* Eyebrow */}
          <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-white/35 mb-10">
            Моживо — Платформа можливостей
          </p>

          {/* Headline */}
          <h1 className="text-[clamp(3rem,9vw,7.5rem)] font-black text-white leading-[0.95] tracking-tight max-w-5xl">
            Знайди свою<br />
            можливість<br />
            <span className="text-primary">у світі</span>
          </h1>

          {/* Sub + CTA */}
          <div className="mt-10 flex flex-col sm:flex-row sm:items-end gap-8 sm:gap-16">
            <p className="text-base text-white/45 leading-relaxed max-w-xs">
              Гранти, стипендії, стажування та обміни —
              зібрані для молоді України. Безкоштовно.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/opportunities"
                className="px-7 py-3.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all"
              >
                Знайти →
              </Link>
              <Link
                href="/organizations"
                className="px-7 py-3.5 rounded-xl border border-white/15 text-white/70 font-medium text-sm hover:border-white/35 hover:text-white transition-all"
              >
                Для організацій
              </Link>
            </div>
          </div>

          {/* Category chips */}
          <div className="mt-16 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="px-4 py-1.5 rounded-full border border-white/10 text-white/45 text-xs font-medium hover:border-white/25 hover:text-white/70 transition-all"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom edge line */}
        <div className="absolute bottom-0 inset-x-0 h-px bg-white/8" />
      </section>

      {/* ── Three pillars ─────────────────────────────────────────────── */}
      <section className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
            {PILLARS.map((p) => (
              <div key={p.num} className="py-12 md:px-10 first:md:pl-0 last:md:pr-0">
                <p className="text-[11px] font-mono font-bold text-primary/60 tracking-widest mb-5">{p.num}</p>
                <h3 className="text-lg font-bold text-foreground mb-3">{p.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What are you looking for? ─────────────────────────────────── */}
      <section className="bg-[#07091A] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex items-end justify-between mb-12 gap-4">
            <h2 className="text-[clamp(2rem,5vw,3.5rem)] font-black text-white leading-tight tracking-tight">
              Що ти шукаєш?
            </h2>
            <Link
              href="/opportunities"
              className="text-sm font-semibold text-white/40 hover:text-white transition-colors whitespace-nowrap pb-1"
            >
              Всі можливості →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-white/8">
            {CATEGORIES.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="group bg-[#07091A] p-8 flex items-end justify-between hover:bg-white/[0.04] transition-all"
              >
                <span className="text-xl font-bold text-white/80 group-hover:text-white transition-colors">
                  {c.label}
                </span>
                <span className="text-white/25 group-hover:text-primary transition-colors text-lg">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Personalized recommendations ──────────────────────────────── */}
      <HomeRecommendations />

      {/* ── Featured opportunities ────────────────────────────────────── */}
      <FeaturedSection />

      {/* ── For organizations ─────────────────────────────────────────── */}
      <section className="bg-white border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-muted mb-6">Для організацій</p>
              <h2 className="text-4xl md:text-5xl font-black text-foreground leading-tight tracking-tight mb-6">
                Знайдіть своїх<br />учасників
              </h2>
              <p className="text-muted leading-relaxed max-w-sm">
                Розмістіть свою програму безкоштовно і охопіть
                тисячі молодих українців, які шукають саме такі
                можливості.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 lg:justify-end">
              <Link
                href="/organizations"
                className="px-8 py-4 rounded-xl bg-foreground text-white font-semibold text-sm hover:bg-gray-800 transition-all text-center"
              >
                Розмістити програму →
              </Link>
              <Link
                href="/organizations"
                className="px-8 py-4 rounded-xl border border-border text-foreground font-medium text-sm hover:border-primary/40 hover:text-primary transition-all text-center"
              >
                Дізнатись більше
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Telegram bot ──────────────────────────────────────────────── */}
      <section className="bg-[#F7F8FF] border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-[#2AABEE] flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.01 9.473c-.148.664-.537.826-1.088.514l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.462c.537-.194 1.006.13.877.743z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-foreground">Telegram-бот</p>
                <p className="text-sm text-muted">Нові можливості та нагадування прямо в Telegram</p>
              </div>
            </div>
            <a
              href="https://t.me/mozhyvo_bot"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2AABEE] text-white font-semibold text-sm hover:bg-[#229ED9] transition-all flex-shrink-0"
            >
              Відкрити →
            </a>
          </div>
        </div>
      </section>

      {/* ── Newsletter ────────────────────────────────────────────────── */}
      <section id="newsletter" className="bg-white border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-xl mx-auto text-center">
            <p className="text-[11px] font-bold tracking-[0.22em] uppercase text-muted mb-5">Розсилка</p>
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4 tracking-tight">
              Нові можливості щотижня
            </h2>
            <p className="text-muted text-sm mb-8 leading-relaxed">
              Добірка найкращих грантів, стипендій та програм обміну
              прямо на пошту. Без спаму.
            </p>
            <div className="flex justify-center">
              <NewsletterSubscribe />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
