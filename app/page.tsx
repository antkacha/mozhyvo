import type { Metadata } from "next";
import Link from "next/link";
import FeaturedSection from "@/components/FeaturedSection";
import HomeRecommendations from "@/components/HomeRecommendations";
import NewsletterSubscribe from "@/components/NewsletterSubscribe";
import RevealOnScroll from "@/components/RevealOnScroll";

export const metadata: Metadata = {
  alternates: { canonical: "https://mozhyvo.ua" },
};

const CATEGORIES = [
  { label: "Стипендії",    href: "/opportunities?category=scholarships", desc: "Навчання за кордоном" },
  { label: "Гранти",       href: "/opportunities?category=grants",       desc: "Фінансування проєктів" },
  { label: "Стажування",   href: "/opportunities?category=internships",  desc: "Досвід у компаніях" },
  { label: "Обміни",       href: "/opportunities?category=exchanges",    desc: "Молодіжні програми" },
  { label: "Волонтерство", href: "/opportunities?category=volunteering", desc: "Допомагай і розвивайся" },
  { label: "Конкурси",     href: "/opportunities?category=competitions", desc: "Конкурси та нагороди" },
];

const PILLARS = [
  {
    num: "01",
    title: "Все в одному місці",
    desc: "Більше не треба шукати по десятках каналів. Гранти, стажування, обміни — тут.",
  },
  {
    num: "02",
    title: "Не пропустіть дедлайн",
    desc: "Зберігайте цікаві можливості та отримуйте нагадування перед закінченням прийому заявок.",
  },
  {
    num: "03",
    title: "Тільки верифіковані",
    desc: "Всі організації перевірені командою Моживо. Жодного шахрайства — лише надійні партнери.",
  },
];

export default function Home() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative bg-background overflow-hidden">
        {/* Subtle blue glow — top right corner */}
        <div
          aria-hidden
          className="absolute -top-40 -right-40 w-[600px] h-[600px] pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(59,79,232,0.07) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 md:pt-28 md:pb-32">

          {/* Eyebrow */}
          <p className="hero-anim hero-anim-1 text-[11px] font-semibold tracking-[0.2em] uppercase text-muted mb-8">
            Моживо — платформа можливостей для молоді
          </p>

          {/* Headline */}
          <div className="overflow-hidden">
            <h1 className="hero-anim hero-anim-2 text-[clamp(3.2rem,8.5vw,7.5rem)] font-black text-foreground leading-[0.95] tracking-tight">
              Знайди свою<br />
              можливість<br />
              <em className="not-italic text-primary">у світі</em>
            </h1>
          </div>

          {/* Sub + CTA row */}
          <div className="hero-anim hero-anim-3 mt-10 flex flex-col sm:flex-row sm:items-center gap-8 sm:gap-16 max-w-3xl">
            <p className="text-[15px] text-muted leading-relaxed max-w-xs">
              Гранти, стипендії, стажування та обміни —
              зібрані для молоді України. Безкоштовно.
            </p>
            <div className="flex flex-wrap gap-3 shrink-0">
              <Link
                href="/opportunities"
                className="px-7 py-3.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors shadow-sm shadow-primary/20"
              >
                Знайти →
              </Link>
              <Link
                href="/organizations"
                className="px-7 py-3.5 rounded-xl border border-border text-foreground font-medium text-sm hover:border-primary/40 hover:text-primary transition-colors"
              >
                Для організацій
              </Link>
            </div>
          </div>

          {/* Category chips */}
          <div className="hero-anim hero-anim-4 mt-14 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="px-4 py-1.5 rounded-full border border-border text-muted text-xs font-medium hover:border-primary/40 hover:text-primary hover:bg-primary-light transition-all"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-px bg-border" />
      </section>

      {/* ── Three pillars ─────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
            {PILLARS.map((p, i) => (
              <RevealOnScroll key={p.num} delay={i * 100}>
                <div className="py-12 md:px-10 first:md:pl-0 last:md:pr-0">
                  <p className="text-[10px] font-mono font-bold text-primary/50 tracking-[0.2em] mb-5 uppercase">{p.num}</p>
                  <h3 className="text-base font-bold text-foreground mb-3 tracking-tight">{p.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{p.desc}</p>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────────────── */}
      <section className="bg-white border-t border-border py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <RevealOnScroll>
            <div className="flex items-end justify-between mb-12">
              <h2 className="text-[clamp(2rem,5vw,3.25rem)] font-black text-foreground leading-tight tracking-tight">
                Що ти шукаєш?
              </h2>
              <Link
                href="/opportunities"
                className="text-sm font-medium text-muted hover:text-primary transition-colors whitespace-nowrap pb-1 hidden sm:block"
              >
                Всі можливості →
              </Link>
            </div>
          </RevealOnScroll>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-l border-border">
            {CATEGORIES.map((c, i) => (
              <RevealOnScroll key={c.href} delay={i * 60}>
                <Link
                  href={c.href}
                  className="group border-b border-r border-border p-8 flex flex-col gap-3 hover:bg-primary-light transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {c.label}
                    </span>
                    <span className="text-muted group-hover:text-primary transition-colors text-base">→</span>
                  </div>
                  <p className="text-xs text-muted">{c.desc}</p>
                </Link>
              </RevealOnScroll>
            ))}
          </div>

          <div className="mt-6 sm:hidden">
            <Link href="/opportunities" className="text-sm font-medium text-muted hover:text-primary transition-colors">
              Всі можливості →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Personalized recommendations ──────────────────────────────── */}
      <HomeRecommendations />

      {/* ── Featured opportunities ────────────────────────────────────── */}
      <FeaturedSection />

      {/* ── For organizations ─────────────────────────────────────────── */}
      <section className="bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <RevealOnScroll>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/50 mb-6">
                  Для організацій
                </p>
                <h2 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight mb-6">
                  Знайдіть своїх<br />учасників
                </h2>
                <p className="text-white/65 leading-relaxed max-w-sm text-[15px]">
                  Розмістіть свою програму безкоштовно і охопіть
                  тисячі молодих українців, які шукають саме такі
                  можливості.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 lg:justify-end">
                <Link
                  href="/organizations"
                  className="px-8 py-4 rounded-xl bg-white text-primary font-semibold text-sm hover:bg-primary-light transition-colors text-center"
                >
                  Розмістити програму →
                </Link>
                <Link
                  href="/organizations"
                  className="px-8 py-4 rounded-xl border border-white/25 text-white font-medium text-sm hover:border-white/50 hover:bg-white/5 transition-colors text-center"
                >
                  Дізнатись більше
                </Link>
              </div>
            </div>
          </RevealOnScroll>
        </div>
      </section>

      {/* ── Telegram bot ──────────────────────────────────────────────── */}
      <section className="bg-white border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#2AABEE] flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.01 9.473c-.148.664-.537.826-1.088.514l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.462c.537-.194 1.006.13.877.743z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-foreground text-sm">Telegram-бот Моживо</p>
                <p className="text-xs text-muted mt-0.5">Нові можливості та нагадування прямо в Telegram</p>
              </div>
            </div>
            <a
              href="https://t.me/mozhyvo_bot"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2AABEE] text-white font-semibold text-sm hover:bg-[#229ED9] transition-colors flex-shrink-0"
            >
              Відкрити →
            </a>
          </div>
        </div>
      </section>

      {/* ── Newsletter ────────────────────────────────────────────────── */}
      <section id="newsletter" className="bg-[#F4F6FF] border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <RevealOnScroll>
            <div className="max-w-lg mx-auto text-center">
              <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-muted mb-5">Розсилка</p>
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
          </RevealOnScroll>
        </div>
      </section>
    </>
  );
}
