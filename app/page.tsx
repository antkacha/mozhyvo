import type { Metadata } from "next";
import Link from "next/link";
import FeaturedSection from "@/components/FeaturedSection";
import HomeRecommendations from "@/components/HomeRecommendations";
import NewsletterSubscribe from "@/components/NewsletterSubscribe";

export const metadata: Metadata = {
  alternates: { canonical: "https://mozhyvo.ua" },
};

const features = [
  { num: "01", title: "Все в одному місці", desc: "Більше не треба шукати по десятках Telegram-каналів. Гранти, стажування, обміни — тут.", icon: "🔍" },
  { num: "02", title: "Не пропусти дедлайн", desc: "Зберігай цікаві можливості і отримуй нагадування до закінчення прийому заявок.", icon: "🔔" },
  { num: "03", title: "Тільки перевірені організації", desc: "Всі партнери верифіковані командою Моживо. Жодного шахрайства.", icon: "✅" },
];

const marqueeItems = ["СТИПЕНДІЇ", "СТАЖУВАННЯ", "ОБМІНИ", "ВОЛОНТЕРСТВО", "ГРАНТИ", "КОНКУРСИ"];

export default function Home() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="bg-white relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Blue paint stroke decorations */}
        <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none select-none">
          <div
            className="absolute bg-primary"
            style={{
              top: "-80px",
              right: "-100px",
              width: "540px",
              height: "360px",
              opacity: 0.07,
              borderRadius: "68% 32% 71% 29% / 42% 61% 39% 58%",
              transform: "rotate(-14deg)",
            }}
          />
          <div
            className="absolute bg-primary"
            style={{
              bottom: "-100px",
              left: "-60px",
              width: "460px",
              height: "300px",
              opacity: 0.055,
              borderRadius: "38% 62% 49% 51% / 58% 41% 59% 42%",
              transform: "rotate(9deg)",
            }}
          />
          <div
            className="absolute bg-primary"
            style={{
              top: "40%",
              right: "30%",
              width: "180px",
              height: "110px",
              opacity: 0.04,
              borderRadius: "55% 45% 60% 40% / 48% 56% 44% 52%",
              transform: "rotate(-6deg)",
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left: content */}
            <div className="flex flex-col gap-6">
              <h1 className="text-6xl md:text-7xl lg:text-[5.5rem] font-black text-gray-900 tracking-tight leading-[0.92]">
                Знайди<br />
                <span className="text-primary">свою</span><br />
                можливість
              </h1>

              <p className="text-gray-400 text-lg leading-relaxed max-w-[420px]">
                Гранти, стажування, обміни та волонтерство — все в одному місці для молоді України
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/opportunities"
                  className="px-7 py-3.5 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 hover:-translate-y-0.5"
                >
                  Знайти можливість →
                </Link>
                <Link
                  href="/organizations"
                  className="px-7 py-3.5 rounded-full border border-gray-200 text-gray-700 font-semibold text-sm hover:border-gray-400 hover:bg-gray-50 transition-all"
                >
                  Для організацій
                </Link>
              </div>

              <div className="flex items-center gap-6">
                {["🌍 Міжнародні", "✅ Верифіковані", "💙 Безкоштовно"].map((tag) => (
                  <span key={tag} className="text-xs text-gray-400 font-medium">{tag}</span>
                ))}
              </div>
            </div>

            {/* Right: floating cards */}
            <div className="relative h-[380px] sm:h-[420px] w-full">

              {/* Card 1 — Erasmus */}
              <div className="absolute z-10 animate-float1" style={{ top: "40px", left: "0px", width: "290px" }}>
                <div className="bg-white rounded-2xl overflow-hidden" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.10), 0 4px 16px rgba(59,79,232,0.10)" }}>
                  <div className="h-1.5 w-full bg-primary" />
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary-light text-primary">🎓 Стипендія</span>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary-light text-primary">1 лип</span>
                    </div>
                    <p className="font-extrabold text-base leading-tight mb-1 text-foreground">Erasmus+ 2026</p>
                    <p className="text-muted text-xs mb-4">Навчання в ЄС · До 1 000€/міс</p>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="text-xs text-muted">🇪🇺 Євросоюз</span>
                      <span className="text-xs font-semibold text-primary">Детальніше →</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2 — DAAD */}
              <div className="absolute z-20 animate-float2" style={{ top: "210px", left: "60px", width: "252px" }}>
                <div className="bg-white rounded-2xl p-5" style={{ boxShadow: "0 16px 48px rgba(0,0,0,0.08), 0 4px 12px rgba(59,79,232,0.08)" }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-foreground text-sm">DAAD</span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-green-100 text-green-700">Відкрито</span>
                  </div>
                  <p className="text-xs text-muted mb-1.5">🌍 Німеччина</p>
                  <p className="font-semibold text-foreground text-sm leading-snug mb-3">Літня школа · Берлін</p>
                  <div className="bg-gray-100 rounded-full h-1.5 mb-1.5">
                    <div className="h-1.5 rounded-full w-[65%] bg-primary" />
                  </div>
                  <p className="text-xs text-muted">65% місць зайнято</p>
                </div>
              </div>

              {/* Card 3 — Notification */}
              <div className="absolute z-30 animate-float3" style={{ top: "10px", right: "0px", width: "200px" }}>
                <div className="bg-white rounded-2xl p-4" style={{ boxShadow: "0 12px 36px rgba(0,0,0,0.08), 0 2px 8px rgba(59,79,232,0.07)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-primary-light">🔔</div>
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

      {/* ── Marquee strip — blue ──────────────────────────────────────── */}
      <div className="bg-primary py-4 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap w-max">
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center flex-none">
              {marqueeItems.map((item) => (
                <span key={`${i}-${item}`} className="inline-flex items-center gap-6 text-xs font-bold tracking-[0.2em] text-white/50 px-6">
                  {item}
                  <span className="text-white/30 font-black">·</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Why Mozhyvo — editorial 2-col layout ─────────────────────── */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            {/* Left: bold statement + bullets */}
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-[1.05] mb-5">
                Чому<br />Моживо?
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed max-w-xs">
                Ми зібрали все для розвитку молоді — в одному місці
              </p>
              <div className="mt-10 flex flex-col gap-4">
                {[
                  { icon: "💙", text: "Безкоштовно — назавжди" },
                  { icon: "🔄", text: "Поповнюється щодня" },
                  { icon: "✅", text: "Тільки верифіковані організації" },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <p className="text-base font-semibold text-gray-800">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: numbered feature list */}
            <div>
              {features.map((f) => (
                <div key={f.num} className="flex gap-5 py-6 border-b border-gray-100 last:border-0">
                  <span className="text-xs font-mono font-bold text-gray-300 pt-1 w-5 flex-shrink-0">{f.num}</span>
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

      {/* ── Category bento grid ───────────────────────────────────────── */}
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
              <p className="text-3xl font-black leading-tight mb-2">Стипендії</p>
              <p className="text-white/65 text-sm leading-relaxed">Навчання за кордоном та в Україні</p>
            </Link>

            {/* Стажування */}
            <Link
              href="/opportunities?category=internships"
              className="col-span-1 group bg-white rounded-3xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border border-gray-100 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">💼</span>
                <span className="text-gray-300 group-hover:text-primary text-lg transition-colors duration-200">→</span>
              </div>
              <div>
                <p className="text-xl font-black text-gray-900 leading-tight mb-1">Стажування</p>
                <p className="text-xs text-gray-500 leading-snug">Досвід у топових компаніях</p>
              </div>
            </Link>

            {/* Обміни */}
            <Link
              href="/opportunities?category=exchanges"
              className="col-span-1 group bg-white rounded-3xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border border-gray-100 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">🌍</span>
                <span className="text-gray-300 group-hover:text-primary text-lg transition-colors duration-200">→</span>
              </div>
              <div>
                <p className="text-xl font-black text-gray-900 leading-tight mb-1">Обміни</p>
                <p className="text-xs text-gray-500 leading-snug">Програми обміну в Європі та світі</p>
              </div>
            </Link>

            {/* Волонтерство */}
            <Link
              href="/opportunities?category=volunteering"
              className="col-span-1 group bg-white rounded-3xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border border-gray-100 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">🤝</span>
                <span className="text-gray-300 group-hover:text-primary text-lg transition-colors duration-200">→</span>
              </div>
              <div>
                <p className="text-xl font-black text-gray-900 leading-tight mb-1">Волонтерство</p>
                <p className="text-xs text-gray-500 leading-snug">Допомагай і розвивайся</p>
              </div>
            </Link>

            {/* Конкурси */}
            <Link
              href="/opportunities?category=competitions"
              className="col-span-1 group bg-white rounded-3xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border border-gray-100 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">🏆</span>
                <span className="text-gray-300 group-hover:text-primary text-lg transition-colors duration-200">→</span>
              </div>
              <div>
                <p className="text-xl font-black text-gray-900 leading-tight mb-1">Конкурси</p>
                <p className="text-xs text-gray-500 leading-snug">Змагання та нагороди</p>
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
              <p className="text-3xl font-black leading-tight mb-2">Гранти</p>
              <p className="text-white/65 text-sm leading-relaxed">Фінансування ідей та проєктів</p>
            </Link>

          </div>
        </div>
      </section>

      {/* ── Personalized recommendations ─────────────────────────────── */}
      <HomeRecommendations />

      {/* ── Featured opportunities ────────────────────────────────────── */}
      <FeaturedSection />

      {/* ── CTA banner — white section, blue inner ───────────────────── */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="bg-primary rounded-3xl px-8 py-16 text-center relative overflow-hidden">
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 15% 50%, rgba(255,255,255,0.08) 0%, transparent 45%), radial-gradient(circle at 85% 20%, rgba(255,255,255,0.10) 0%, transparent 40%), radial-gradient(circle at 75% 80%, rgba(255,255,255,0.07) 0%, transparent 35%)",
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
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-primary font-semibold hover:bg-primary-light transition-all duration-200 shadow-lg"
              >
                Розмістити можливість →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Telegram bot ─────────────────────────────────────────────── */}
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

      {/* ── Newsletter ───────────────────────────────────────────────── */}
      <section id="newsletter" className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-light text-primary mb-5 text-2xl">
              📬
            </div>
            <h2 className="text-3xl font-black text-foreground mb-3">Нові можливості щотижня</h2>
            <p className="text-muted text-base mb-8 leading-relaxed">
              Підписуйся та отримуй добірку найкращих грантів, стипендій та програм обміну прямо на пошту. Без спаму — тільки корисне.
            </p>
            <div className="flex justify-center">
              <NewsletterSubscribe />
            </div>
            <p className="text-xs text-muted mt-4">Відписатись можна в будь-який момент</p>
          </div>
        </div>
      </section>
    </>
  );
}
