import type { Metadata } from "next";
import Link from "next/link";
import FeaturedSection from "@/components/FeaturedSection";
import HomeRecommendations from "@/components/HomeRecommendations";
import NewsletterSubscribe from "@/components/NewsletterSubscribe";

export const metadata: Metadata = {
  alternates: { canonical: "https://mozhyvo.ua" },
};

const features = [
  {
    num: "01",
    title: "Все в одному місці",
    desc: "Більше не треба шукати по десятках Telegram-каналів. Гранти, стажування, обміни — тут.",
    icon: "🔍",
  },
  {
    num: "02",
    title: "Не пропусти дедлайн",
    desc: "Зберігай цікаві можливості і отримуй нагадування до закінчення прийому заявок.",
    icon: "🔔",
  },
  {
    num: "03",
    title: "Тільки перевірені організації",
    desc: "Всі партнери верифіковані командою Моживо. Жодного шахрайства.",
    icon: "✅",
  },
];

export default function Home() {
  return (
    <>
      {/* ── Hero — dark ─────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #09091a 0%, #0f1235 55%, #0b1228 100%)" }}
      >
        {/* Dot grid */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.055) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Glows */}
        <div
          aria-hidden
          className="absolute -top-24 right-0 w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(59,79,232,0.3) 0%, transparent 65%)" }}
        />
        <div
          aria-hidden
          className="absolute bottom-0 -left-20 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(59,79,232,0.12) 0%, transparent 65%)" }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-28 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center py-4 lg:py-8">

            {/* Left: content */}
            <div className="flex flex-col gap-7">
              <div className="inline-flex items-center gap-2 self-start px-4 py-1.5 rounded-full border border-white/15 bg-white/[0.06] text-white/70 text-xs font-semibold backdrop-blur-sm">
                <span className="text-accent">✦</span>
                Платформа можливостей для молоді
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.04]">
                Знайди свою
                <br />
                можливість
                <br />
                <span className="text-accent">у світі</span>
              </h1>

              <p className="text-lg text-white/55 leading-relaxed max-w-[440px]">
                Гранти, стажування, обміни та волонтерство — все в одному місці
                для молоді України
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/opportunities"
                  className="px-6 py-3 rounded-full bg-accent text-foreground font-semibold text-sm hover:bg-accent-dark transition-all shadow-lg shadow-accent/20 hover:-translate-y-0.5"
                >
                  Знайти свою можливість →
                </Link>
                <Link
                  href="/organizations"
                  className="px-6 py-3 rounded-full border border-white/20 text-white font-semibold text-sm hover:border-white/40 hover:bg-white/[0.06] transition-all"
                >
                  Для організацій
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🌍</span>
                  <div>
                    <p className="text-sm font-bold text-white leading-tight">40+</p>
                    <p className="text-xs text-white/40">країн</p>
                  </div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">📋</span>
                  <div>
                    <p className="text-sm font-bold text-white leading-tight">1 200+</p>
                    <p className="text-xs text-white/40">можливостей</p>
                  </div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🎓</span>
                  <div>
                    <p className="text-sm font-bold text-white leading-tight">0₴</p>
                    <p className="text-xs text-white/40">завжди</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: overlapping card stack — look great on dark bg */}
            <div className="relative h-[360px] sm:h-[400px] lg:h-[400px] w-full overflow-hidden">

              {/* Card 1 — Erasmus, indigo */}
              <div className="absolute z-0 animate-float1" style={{ top: "80px", left: "10px", width: "278px" }}>
                <div className="bg-primary rounded-2xl p-5 shadow-2xl shadow-primary/40 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/15">
                      🎓 Стипендія
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-accent text-foreground">
                      1 лип
                    </span>
                  </div>
                  <p className="font-extrabold text-lg leading-tight mb-1">Erasmus+ 2025</p>
                  <p className="text-white/65 text-sm mb-4">Навчання в ЄС · До 1 000€/міс</p>
                  <div className="flex items-center justify-between pt-3 border-t border-white/15">
                    <span className="text-xs text-white/60">🇪🇺 Євросоюз</span>
                    <span className="text-xs font-semibold text-white/85">Детальніше →</span>
                  </div>
                </div>
              </div>

              {/* Card 2 — DAAD, white */}
              <div className="absolute z-10 animate-float2" style={{ top: "205px", left: "50px", width: "240px" }}>
                <div className="bg-white rounded-2xl p-5 shadow-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-foreground text-sm">DAAD</span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-700">
                      Відкрито
                    </span>
                  </div>
                  <p className="text-xs text-muted mb-1.5">🌍 Німеччина</p>
                  <p className="font-semibold text-foreground text-sm leading-snug mb-3">
                    Літня школа · Берлін
                  </p>
                  <div className="bg-muted-bg rounded-full h-1.5 mb-1.5">
                    <div className="bg-primary h-1.5 rounded-full w-[65%]" />
                  </div>
                  <p className="text-xs text-muted">65% місць зайнято</p>
                </div>
              </div>

              {/* Card 3 — Notification */}
              <div className="absolute z-20 animate-float3" style={{ top: "15px", right: "10px", width: "178px" }}>
                <div className="bg-white rounded-2xl p-4 shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0 text-base">
                      🔔
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground leading-tight">Новий дедлайн</p>
                      <p className="text-xs text-muted mt-0.5">FLEX Program · 3 дні</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Wave transition to white sections below */}
        <div aria-hidden className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ lineHeight: 0 }}>
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "80px" }}>
            <path d="M0,80 L1440,80 L1440,44 Q1080,0 720,22 Q360,44 0,14 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ── Why Mozhyvo — editorial 2-col layout ─────────────────────── */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            {/* Left: bold statement + stats */}
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-[1.05] mb-5">
                Чому<br />Моживо?
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed max-w-xs">
                Ми зібрали все для розвитку молоді — в одному місці
              </p>
              <div className="mt-10 flex items-stretch gap-10">
                <div>
                  <p className="text-5xl font-black text-primary leading-none">1200+</p>
                  <p className="text-sm text-gray-500 mt-2">можливостей</p>
                </div>
                <div className="w-px bg-gray-100" />
                <div>
                  <p className="text-5xl font-black text-primary leading-none">40+</p>
                  <p className="text-sm text-gray-500 mt-2">країн</p>
                </div>
                <div className="w-px bg-gray-100" />
                <div>
                  <p className="text-5xl font-black text-primary leading-none">0₴</p>
                  <p className="text-sm text-gray-500 mt-2">завжди безкоштовно</p>
                </div>
              </div>
            </div>

            {/* Right: numbered feature list */}
            <div>
              {features.map((f) => (
                <div
                  key={f.num}
                  className="flex gap-5 py-6 border-b border-gray-100 last:border-0"
                >
                  <span className="text-xs font-mono font-bold text-gray-300 pt-1 w-5 flex-shrink-0">
                    {f.num}
                  </span>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-base mb-1.5">{f.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                  <span className="text-2xl flex-shrink-0 self-start">{f.icon}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── Category bento grid — #F7F8FF ────────────────────────────── */}
      <section style={{ backgroundColor: "#F7F8FF" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900">
              Що ти шукаєш?
            </h2>
            <p className="text-gray-500 text-base mt-3">
              Оберіть напрям — і знайдіть можливості саме для вас
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {/* Wide featured: Стипендії */}
            <Link
              href="/opportunities?category=scholarships"
              className="col-span-1 md:col-span-2 group bg-primary rounded-3xl p-7 text-white hover:bg-primary-dark transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-6">
                <span className="text-4xl">🎓</span>
                <span className="text-white/40 group-hover:text-white text-xl transition-colors duration-200">→</span>
              </div>
              <p className="text-5xl md:text-6xl font-black leading-none mb-2">340+</p>
              <p className="text-lg font-bold">Стипендії</p>
              <p className="text-white/55 text-sm mt-1">активних можливостей</p>
            </Link>

            {/* Normal: Стажування */}
            <Link
              href="/opportunities?category=internships"
              className="col-span-1 group bg-white rounded-3xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border border-gray-100 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">💼</span>
                <span className="text-gray-300 group-hover:text-primary text-lg transition-colors duration-200">→</span>
              </div>
              <div>
                <p className="text-4xl font-black text-gray-900 leading-none mb-1.5">210+</p>
                <p className="font-bold text-gray-700">Стажування</p>
                <p className="text-xs text-gray-400 mt-1">активних</p>
              </div>
            </Link>

            {/* Normal: Обміни */}
            <Link
              href="/opportunities?category=exchanges"
              className="col-span-1 group bg-white rounded-3xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border border-gray-100 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">🌍</span>
                <span className="text-gray-300 group-hover:text-primary text-lg transition-colors duration-200">→</span>
              </div>
              <div>
                <p className="text-4xl font-black text-gray-900 leading-none mb-1.5">180+</p>
                <p className="font-bold text-gray-700">Обміни</p>
                <p className="text-xs text-gray-400 mt-1">активних</p>
              </div>
            </Link>

            {/* Normal: Волонтерство */}
            <Link
              href="/opportunities?category=volunteering"
              className="col-span-1 group bg-white rounded-3xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border border-gray-100 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">🤝</span>
                <span className="text-gray-300 group-hover:text-primary text-lg transition-colors duration-200">→</span>
              </div>
              <div>
                <p className="text-4xl font-black text-gray-900 leading-none mb-1.5">290+</p>
                <p className="font-bold text-gray-700">Волонтерство</p>
                <p className="text-xs text-gray-400 mt-1">активних</p>
              </div>
            </Link>

            {/* Normal: Конкурси */}
            <Link
              href="/opportunities?category=competitions"
              className="col-span-1 group bg-white rounded-3xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border border-gray-100 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">🏆</span>
                <span className="text-gray-300 group-hover:text-primary text-lg transition-colors duration-200">→</span>
              </div>
              <div>
                <p className="text-4xl font-black text-gray-900 leading-none mb-1.5">95+</p>
                <p className="font-bold text-gray-700">Конкурси</p>
                <p className="text-xs text-gray-400 mt-1">активних</p>
              </div>
            </Link>

            {/* Wide featured: Гранти */}
            <Link
              href="/opportunities?category=grants"
              className="col-span-1 md:col-span-2 group bg-primary rounded-3xl p-7 text-white hover:bg-primary-dark transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-6">
                <span className="text-4xl">🚀</span>
                <span className="text-white/40 group-hover:text-white text-xl transition-colors duration-200">→</span>
              </div>
              <p className="text-5xl md:text-6xl font-black leading-none mb-2">120+</p>
              <p className="text-lg font-bold">Гранти</p>
              <p className="text-white/55 text-sm mt-1">активних можливостей</p>
            </Link>

          </div>
        </div>
      </section>

      {/* ── Personalized recommendations (shown when logged in) ─────── */}
      <HomeRecommendations />

      {/* ── Featured opportunities — animated client component ──────── */}
      <FeaturedSection />

      {/* ── CTA banner — white section, indigo inner ─────────────────── */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="bg-primary rounded-3xl px-8 py-16 text-center relative overflow-hidden">
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 15% 50%, rgba(255,214,0,0.15) 0%, transparent 45%), radial-gradient(circle at 85% 20%, rgba(255,255,255,0.10) 0%, transparent 40%), radial-gradient(circle at 75% 80%, rgba(255,255,255,0.07) 0%, transparent 35%)",
              }}
            />
            <div className="relative z-10">
              <div className="text-4xl mb-5">🏢</div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
                Ви організація або фонд?
              </h2>
              <p className="text-white/80 mb-8 max-w-lg mx-auto">
                Розмістіть свою програму безкоштовно і охопіть тисячі молодих
                українців, які шукають саме такі можливості.
              </p>
              <Link
                href="/organizations"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-accent text-foreground font-semibold hover:bg-accent-dark transition-all duration-200 shadow-lg"
              >
                Розмістити можливість →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Telegram bot ─────────────────────────────────────────── */}
      <section className="bg-primary-light border-t border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-[#2AABEE] flex items-center justify-center flex-shrink-0 shadow-md">
                <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248l-2.01 9.473c-.148.664-.537.826-1.088.514l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.462c.537-.194 1.006.13.877.743z" />
                </svg>
              </div>
              <div>
                <p className="font-black text-foreground text-lg">Telegram-бот Моживо</p>
                <p className="text-sm text-muted mt-0.5">Отримуй нові можливості та нагадування прямо в Telegram</p>
              </div>
            </div>
            <a
              href="https://t.me/mozhyvo_bot"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#2AABEE] text-white font-semibold text-sm hover:bg-[#229ED9] transition-all shadow-md flex-shrink-0"
            >
              Відкрити бота →
            </a>
          </div>
        </div>
      </section>

      {/* ── Newsletter section ───────────────────────────────────── */}
      <section id="newsletter" className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-light text-primary mb-5 text-2xl">
              📬
            </div>
            <h2 className="text-3xl font-black text-foreground mb-3">
              Нові можливості щотижня
            </h2>
            <p className="text-muted text-base mb-8 leading-relaxed">
              Підписуйся та отримуй добірку найкращих грантів, стипендій та програм обміну прямо на пошту. Без спаму — тільки корисне.
            </p>
            <div className="flex justify-center">
              <NewsletterSubscribe />
            </div>
            <p className="text-xs text-muted mt-4">
              Понад 3 000 підписників · Відписатись можна в будь-який момент
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
