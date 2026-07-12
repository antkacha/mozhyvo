import type { Metadata } from "next";
import Link from "next/link";
import FeaturedSection from "@/components/FeaturedSection";
import HomeRecommendations from "@/components/HomeRecommendations";
import NewsletterSubscribe from "@/components/NewsletterSubscribe";

export const metadata: Metadata = {
  alternates: { canonical: "https://mozhyvo.ua" },
};

const CATEGORIES = [
  {
    label: "Стипендії",
    href: "/opportunities?category=scholarships",
    desc: "Навчання за кордоном",
    emoji: "🎓",
    bg: "#EEF2FF",
    accent: "#3B4FE8",
  },
  {
    label: "Гранти",
    href: "/opportunities?category=grants",
    desc: "Фінансування проєктів",
    emoji: "🚀",
    bg: "#FFF7ED",
    accent: "#EA580C",
  },
  {
    label: "Стажування",
    href: "/opportunities?category=internships",
    desc: "Досвід у топових компаніях",
    emoji: "💼",
    bg: "#F0FDF4",
    accent: "#16A34A",
  },
  {
    label: "Обміни",
    href: "/opportunities?category=exchanges",
    desc: "Програми в Європі та світі",
    emoji: "🌍",
    bg: "#FAF5FF",
    accent: "#9333EA",
  },
  {
    label: "Волонтерство",
    href: "/opportunities?category=volunteering",
    desc: "Допомагай і розвивайся",
    emoji: "🤝",
    bg: "#FFF1F2",
    accent: "#E11D48",
  },
  {
    label: "Конкурси",
    href: "/opportunities?category=competitions",
    desc: "Змагання та нагороди",
    emoji: "🏆",
    bg: "#FFFBEB",
    accent: "#D97706",
  },
];

export default function Home() {
  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-light text-primary text-xs font-semibold mb-10 hero-anim hero-anim-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
            Безкоштовна платформа для молоді України
          </div>

          {/* Headline */}
          <h1 className="hero-anim hero-anim-2 text-[clamp(2.75rem,7vw,6rem)] font-black text-foreground leading-[1.0] tracking-[-0.03em] mb-6">
            Знайди своє
            <br />
            <span className="text-primary">місце у світі</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-anim hero-anim-3 text-base sm:text-lg text-muted max-w-xl mx-auto leading-relaxed mb-10">
            Гранти, стипендії, стажування та обміни — зібрані
            в одному місці. Без реєстрації, без плати.
          </p>

          {/* CTAs */}
          <div className="hero-anim hero-anim-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/opportunities"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-colors"
            >
              Знайти можливість →
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-muted-bg text-foreground font-medium text-sm hover:bg-border transition-colors"
            >
              Зареєструватись
            </Link>
          </div>
        </div>

        {/* Bottom divider */}
        <div className="border-t border-border" />
      </section>

      {/* ── CATEGORIES ────────────────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Що шукаєш?
            </h2>
            <Link
              href="/opportunities"
              className="hidden sm:inline-flex text-sm font-medium text-muted hover:text-primary transition-colors"
            >
              Всі можливості →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {CATEGORIES.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="group relative rounded-2xl p-5 sm:p-6 flex flex-col gap-3 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
                style={{ backgroundColor: c.bg }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{ backgroundColor: `${c.accent}18` }}
                >
                  {c.emoji}
                </div>
                <div>
                  <p
                    className="font-bold text-base mb-0.5"
                    style={{ color: c.accent }}
                  >
                    {c.label}
                  </p>
                  <p className="text-xs text-muted leading-snug">{c.desc}</p>
                </div>
                <span
                  className="text-xs font-semibold mt-auto opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: c.accent }}
                >
                  Переглянути →
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-8 sm:hidden text-center">
            <Link href="/opportunities" className="text-sm font-medium text-muted hover:text-primary transition-colors">
              Всі можливості →
            </Link>
          </div>
        </div>
      </section>

      {/* ── PERSONALIZED ─────────────────────────────────────────────── */}
      <HomeRecommendations />

      {/* ── FEATURED ─────────────────────────────────────────────────── */}
      <FeaturedSection />

      {/* ── WHY MOZHYVO ──────────────────────────────────────────────── */}
      <section className="bg-white border-t border-border py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mb-12 text-center">
            Чому Моживо?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                icon: "🔍",
                title: "Все в одному місці",
                desc: "Більше не треба шукати по десятках каналів і Telegram-групах.",
              },
              {
                icon: "✅",
                title: "Тільки верифіковані",
                desc: "Всі організації перевірені командою Моживо. Жодного шахрайства.",
              },
              {
                icon: "🔔",
                title: "Не пропустіш дедлайн",
                desc: "Зберігай і отримуй нагадування про важливі дедлайни.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl bg-[#FAFAFA] border border-border p-7 flex flex-col gap-4"
              >
                <span className="text-3xl">{item.icon}</span>
                <div>
                  <h3 className="font-bold text-foreground mb-1.5">{item.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR ORGANIZATIONS ────────────────────────────────────────── */}
      <section className="bg-primary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-white/50 mb-5">
              Для організацій
            </p>
            <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight tracking-tight mb-4">
              Знайдіть своїх учасників
            </h2>
            <p className="text-white/65 text-[15px] leading-relaxed mb-8 max-w-md">
              Розмістіть свою програму безкоштовно і охопіть молодих
              українців, які шукають саме такі можливості.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/organizations"
                className="px-6 py-3 rounded-xl bg-white text-primary font-semibold text-sm hover:bg-primary-light transition-colors"
              >
                Розмістити програму →
              </Link>
              <Link
                href="/organizations"
                className="px-6 py-3 rounded-xl border border-white/25 text-white font-medium text-sm hover:bg-white/10 transition-colors"
              >
                Дізнатись більше
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TELEGRAM ─────────────────────────────────────────────────── */}
      <section className="bg-white border-t border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-[#2AABEE] flex items-center justify-center flex-shrink-0">
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
      <section id="newsletter" className="bg-[#F4F6FF] border-t border-border py-20">
        <div className="max-w-md mx-auto px-4 text-center">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-primary/60 mb-4">Розсилка</p>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground mb-3 tracking-tight">
            Нові можливості щотижня
          </h2>
          <p className="text-sm text-muted mb-8 leading-relaxed">
            Найкращі гранти, стипендії та обміни — прямо на пошту. Без спаму.
          </p>
          <NewsletterSubscribe />
        </div>
      </section>
    </>
  );
}
