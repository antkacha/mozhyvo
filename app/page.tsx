import type { Metadata } from "next";
import Link from "next/link";
import FeaturedSection from "@/components/FeaturedSection";
import HomeRecommendations from "@/components/HomeRecommendations";
import NewsletterSubscribe from "@/components/NewsletterSubscribe";

export const metadata: Metadata = {
  alternates: { canonical: "https://mozhyvo.ua" },
};

const CATEGORIES = [
  { label: "Стипендії",    href: "/opportunities?category=scholarships", desc: "Навчання за кордоном та в Україні" },
  { label: "Гранти",       href: "/opportunities?category=grants",       desc: "Фінансування ідей та проєктів" },
  { label: "Стажування",   href: "/opportunities?category=internships",  desc: "Досвід у топових компаніях" },
  { label: "Обміни",       href: "/opportunities?category=exchanges",    desc: "Молодіжні програми в Європі" },
  { label: "Волонтерство", href: "/opportunities?category=volunteering", desc: "Допомагай і розвивайся" },
  { label: "Конкурси",     href: "/opportunities?category=competitions", desc: "Змагання та нагороди" },
];

const STEPS = [
  { num: "01", title: "Знайди", desc: "Переглядай сотні можливостей у зручному каталозі" },
  { num: "02", title: "Збережи", desc: "Зберігай цікаві варіанти і отримуй нагадування про дедлайни" },
  { num: "03", title: "Подай заявку", desc: "Заповни форму або перейди на сторінку організатора" },
];

export default function Home() {
  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-border overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 min-h-[88vh] items-center py-16 lg:py-0">

            {/* Left */}
            <div className="flex flex-col gap-8 lg:pr-12 lg:py-24">

              <div className="inline-flex items-center gap-2 self-start">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-xs font-semibold tracking-[0.15em] uppercase text-muted">
                  Платформа можливостей для молоді
                </span>
              </div>

              <h1 className="font-display font-bold text-foreground leading-[0.95] tracking-tight"
                style={{ fontSize: "clamp(3.5rem, 8vw, 7rem)" }}>
                Знайди свою<br />
                можливість<br />
                <span className="text-primary">у світі ↗</span>
              </h1>

              <p className="text-base text-muted leading-relaxed max-w-sm">
                Гранти, стипендії, стажування та обміни — зібрані
                для молоді України. Безкоштовно.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/opportunities"
                  className="px-7 py-3.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-colors"
                >
                  Знайти можливість →
                </Link>
                <Link
                  href="/register"
                  className="px-7 py-3.5 border border-border text-foreground text-sm font-medium rounded-xl hover:border-primary/40 hover:text-primary transition-colors"
                >
                  Зареєструватись
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-2 border-t border-border">
                {["Безкоштовно", "Верифіковані", "Щодня нове"].map((tag) => (
                  <span key={tag} className="text-xs text-muted font-medium">{tag}</span>
                ))}
              </div>
            </div>

            {/* Right — floating cards */}
            <div className="relative h-[380px] sm:h-[440px] lg:h-full lg:min-h-[500px] w-full lg:border-l border-border">

              {/* Background tint */}
              <div className="absolute inset-0 bg-[#F7F8FF]" />

              {/* Card 1 — Erasmus */}
              <div className="absolute z-10 animate-float1" style={{ top: "60px", left: "32px", width: "272px" }}>
                <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-border/60">
                  <div className="h-1 w-full bg-primary" />
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary-light text-primary">
                        🎓 Стипендія
                      </span>
                      <span className="text-xs font-bold text-muted">1 лип</span>
                    </div>
                    <p className="font-bold text-base text-foreground mb-1">Erasmus+ 2026</p>
                    <p className="text-muted text-xs mb-4">Навчання в ЄС · До 1 000€/міс</p>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="text-xs text-muted">🇪🇺 Євросоюз</span>
                      <span className="text-xs font-semibold text-primary">Детальніше →</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2 — DAAD */}
              <div className="absolute z-20 animate-float2" style={{ top: "240px", left: "80px", width: "240px" }}>
                <div className="bg-white rounded-2xl p-5 shadow-xl border border-border/60">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-foreground text-sm">DAAD</span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-50 text-green-700">Відкрито</span>
                  </div>
                  <p className="text-xs text-muted mb-1.5">🌍 Німеччина</p>
                  <p className="font-semibold text-foreground text-sm leading-snug mb-3">Літня школа · Берлін</p>
                  <div className="bg-muted-bg rounded-full h-1.5 mb-1.5">
                    <div className="h-1.5 rounded-full w-[65%] bg-primary" />
                  </div>
                  <p className="text-xs text-muted">65% місць зайнято</p>
                </div>
              </div>

              {/* Card 3 — Notification */}
              <div className="absolute z-30 animate-float3" style={{ top: "30px", right: "32px", width: "180px" }}>
                <div className="bg-white rounded-2xl p-4 shadow-lg border border-border/60">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0 text-sm">
                      🔔
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground leading-tight">Новий дедлайн</p>
                      <p className="text-[11px] text-muted mt-0.5">FLEX Program · 3 дні</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────── */}
      <section className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
            {STEPS.map((s) => (
              <div key={s.num} className="py-8 sm:py-0 sm:px-10 first:sm:pl-0 last:sm:pr-0">
                <p className="font-display font-bold text-primary text-sm mb-4">{s.num}</p>
                <h3 className="font-display font-bold text-foreground text-2xl mb-2">{s.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-16 items-start">

            {/* Left: sticky heading */}
            <div className="lg:sticky lg:top-24">
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-muted mb-4">Напрями</p>
              <h2 className="font-display font-bold text-foreground leading-[0.95] tracking-tight"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>
                Що ти<br />шукаєш?
              </h2>
              <p className="text-sm text-muted mt-4 leading-relaxed max-w-[200px]">
                Обери напрям і знайди те, що підходить саме тобі
              </p>
              <Link
                href="/opportunities"
                className="inline-flex items-center gap-2 mt-8 text-sm font-semibold text-primary hover:gap-3 transition-all"
              >
                Всі можливості →
              </Link>
            </div>

            {/* Right: category rows */}
            <div className="divide-y divide-border border-t border-b border-border">
              {CATEGORIES.map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  className="group flex items-center justify-between gap-6 py-5 hover:bg-[#F7F8FF] px-4 -mx-4 transition-colors"
                >
                  <div>
                    <p className="font-display font-bold text-foreground text-xl group-hover:text-primary transition-colors">
                      {c.label}
                    </p>
                    <p className="text-xs text-muted mt-0.5">{c.desc}</p>
                  </div>
                  <span className="text-muted group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 text-lg">→</span>
                </Link>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── PERSONALIZED ─────────────────────────────────────────────── */}
      <HomeRecommendations />

      {/* ── FEATURED ─────────────────────────────────────────────────── */}
      <FeaturedSection />

      {/* ── FOR ORGANIZATIONS ────────────────────────────────────────── */}
      <section className="bg-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-end">
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-white/50 mb-6">
                Для організацій
              </p>
              <h2 className="font-display font-bold text-white leading-[0.95] tracking-tight"
                style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)" }}>
                Знайдіть<br />своїх<br />учасників
              </h2>
            </div>
            <div className="lg:pb-2">
              <p className="text-white/60 text-base leading-relaxed mb-8 max-w-sm">
                Розмістіть програму безкоштовно і охопіть молодих
                українців, які шукають саме такі можливості.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/organizations"
                  className="px-7 py-3.5 bg-white text-primary text-sm font-semibold rounded-xl hover:bg-primary-light transition-colors"
                >
                  Розмістити програму →
                </Link>
                <Link
                  href="/organizations"
                  className="px-7 py-3.5 border border-white/25 text-white text-sm font-medium rounded-xl hover:border-white/50 hover:bg-white/5 transition-colors"
                >
                  Дізнатись більше
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TELEGRAM ─────────────────────────────────────────────────── */}
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
              className="px-5 py-2.5 rounded-xl bg-[#2AABEE] text-white font-semibold text-sm hover:bg-[#229ED9] transition-colors whitespace-nowrap"
            >
              Відкрити →
            </a>
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ───────────────────────────────────────────────── */}
      <section id="newsletter" className="bg-[#F7F8FF] border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-muted mb-4">Розсилка</p>
              <h2 className="font-display font-bold text-foreground leading-tight tracking-tight"
                style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
                Нові можливості<br />щотижня
              </h2>
              <p className="text-muted text-sm mt-4 leading-relaxed max-w-sm">
                Найкращі гранти, стипендії та програми обміну —
                прямо на пошту. Без спаму.
              </p>
            </div>
            <div>
              <NewsletterSubscribe />
              <p className="text-xs text-muted mt-3">Відписатись можна в будь-який момент</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
