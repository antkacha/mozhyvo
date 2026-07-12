import type { Metadata } from "next";
import Link from "next/link";
import FeaturedSection from "@/components/FeaturedSection";
import HomeRecommendations from "@/components/HomeRecommendations";
import NewsletterSubscribe from "@/components/NewsletterSubscribe";

export const metadata: Metadata = {
  alternates: { canonical: "https://mozhyvo.ua" },
};

const features = [
  { title: "Все в одному місці", desc: "Не треба шукати по десятках Telegram-каналів. Гранти, стажування, обміни — тут.", icon: "🔍" },
  { title: "Не пропусти дедлайн", desc: "Зберігай можливості і отримуй нагадування до закінчення прийому заявок.", icon: "🔔" },
  { title: "Тільки перевірені організації", desc: "Всі партнери верифіковані командою Моживо. Жодного шахрайства.", icon: "✅" },
];

const whyCards = [
  { icon: "⏱", title: "Економить час", desc: "Не треба шукати по десятках каналів — всі можливості тут, в одному місці" },
  { icon: "🔄", title: "Регулярно", desc: "База поповнюється щодня актуальними грантами, стипендіями та стажуваннями" },
  { icon: "✅", title: "Ефективно", desc: "Тільки верифіковані організації та перевірені можливості для молоді" },
];

const marqueeItems = ["СТИПЕНДІЇ", "СТАЖУВАННЯ", "ОБМІНИ", "ВОЛОНТЕРСТВО", "ГРАНТИ", "КОНКУРСИ"];

export default function Home() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-primary">
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div aria-hidden className="absolute -top-24 right-0 w-[700px] h-[700px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.10) 0%, transparent 60%)" }} />
        <div aria-hidden className="absolute bottom-0 -left-20 w-[500px] h-[500px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 65%)" }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-28 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center py-4 lg:py-8">

            <div className="flex flex-col gap-7">
              <div className="inline-flex items-center gap-2 self-start">
                <span className="text-white font-black text-2xl leading-none">✦</span>
                <span className="text-white/60 text-xs font-bold tracking-widest uppercase">Платформа можливостей для молоді</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.0]">
                Знайди{" "}
                <span className="relative inline-block">
                  свою
                  <span className="absolute -bottom-1 left-0 right-0 h-[4px] bg-white/55 rounded-full" />
                </span>
                <br />
                можливість
                <br />
                <span className="text-white/70">у світі</span>
              </h1>

              <p className="text-lg text-white/55 leading-relaxed max-w-[440px]">
                Гранти, стажування, обміни та волонтерство — все в одному місці для молоді України
              </p>

              <div className="flex flex-wrap gap-3">
                <Link href="/opportunities" className="px-6 py-3 rounded-full bg-white text-primary font-semibold text-sm hover:bg-primary-light transition-all shadow-lg hover:-translate-y-0.5">
                  Знайти свою можливість →
                </Link>
                <Link href="/organizations" className="px-6 py-3 rounded-full border border-white/20 text-white font-semibold text-sm hover:border-white/40 hover:bg-white/[0.06] transition-all">
                  Для організацій
                </Link>
              </div>

              <div className="flex items-center gap-5 pt-1 flex-wrap">
                {["🌍 Міжнародні можливості", "✅ Верифіковані", "💙 Безкоштовно"].map((tag) => (
                  <span key={tag} className="text-xs text-white/55 font-medium">{tag}</span>
                ))}
              </div>
            </div>

            {/* Floating cards */}
            <div className="relative h-[380px] sm:h-[420px] lg:h-[420px] w-full">
              <div className="absolute z-10 animate-float1" style={{ top: "40px", left: "0px", width: "290px" }}>
                <div className="bg-white rounded-2xl overflow-hidden shadow-2xl" style={{ boxShadow: "0 24px 48px rgba(0,0,0,0.22)" }}>
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

              <div className="absolute z-20 animate-float2" style={{ top: "210px", left: "60px", width: "252px" }}>
                <div className="bg-white rounded-2xl p-5 shadow-2xl" style={{ boxShadow: "0 20px 40px rgba(0,0,0,0.18)" }}>
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

              <div className="absolute z-30 animate-float3" style={{ top: "10px", right: "0px", width: "188px" }}>
                <div className="bg-white rounded-2xl p-4 shadow-xl" style={{ boxShadow: "0 16px 32px rgba(0,0,0,0.15)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-base bg-primary-light">🔔</div>
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

        <div aria-hidden className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ lineHeight: 0 }}>
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" style={{ display: "block", width: "100%", height: "80px" }}>
            <path d="M0,80 L1440,80 L1440,44 Q1080,0 720,22 Q360,44 0,14 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ── Що таке Моживо? ───────────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-gray-400 text-sm font-semibold mb-5">— платформа можливостей</p>
              <h2 className="text-5xl md:text-6xl font-black text-gray-900 leading-[1.0] mb-6">
                Що таке
                <br />
                <span className="bg-primary text-white px-4 py-1 rounded-2xl inline-block mt-1">
                  Моживо?
                </span>
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mt-6">
                Ми зібрали всі можливості для молоді в одному місці — щоб ти не витрачав час на пошук по десятках каналів і сайтів
              </p>
            </div>

            <div className="flex flex-col gap-7 pt-2">
              {features.map((f) => (
                <div key={f.title} className="flex gap-4 items-start">
                  <span className="text-primary font-black text-xl mt-0.5 flex-shrink-0">✦</span>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base mb-1">{f.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Blue statement strip ─────────────────────────────────────── */}
      <section className="bg-primary py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-[1.15]">
            Моживо підходить усім, хто прагне{" "}
            <span className="relative inline-block">
              розвиватися
              <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-white/50 rounded-full" />
            </span>
            , знаходити нові можливості та будувати{" "}
            <span className="relative inline-block">
              своє майбутнє
              <span className="absolute -bottom-1 left-0 right-0 h-[3px] bg-white/50 rounded-full" />
            </span>
          </p>
        </div>
      </section>

      {/* ── Чому варто? ──────────────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-5xl md:text-6xl font-black text-gray-900 leading-[1.0] mb-12">
            Чому{" "}
            <span className="bg-primary-light text-primary px-4 py-1 rounded-2xl inline-block border border-primary/15">
              Моживо?
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {whyCards.map((card) => (
              <div key={card.title} className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                <span className="text-3xl mb-5 block">{card.icon}</span>
                <h3 className="font-black text-gray-900 text-xl mb-3">{card.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Категорії ────────────────────────────────────────────────── */}
      <section style={{ backgroundColor: "#F7F8FF" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-[1.05]">
              Що ти{" "}
              <span className="bg-primary text-white px-4 py-1 rounded-2xl inline-block">
                шукаєш?
              </span>
            </h2>
            <p className="text-gray-500 text-base mt-4">
              Оберіть напрям — і знайдіть можливості саме для вас
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/opportunities?category=scholarships" className="col-span-1 md:col-span-2 group bg-primary rounded-3xl p-7 text-white hover:bg-primary-dark transition-all duration-200">
              <div className="flex items-start justify-between mb-6">
                <span className="text-4xl">🎓</span>
                <span className="text-white/40 group-hover:text-white text-xl transition-colors duration-200">→</span>
              </div>
              <p className="text-3xl font-black leading-tight mb-2">Стипендії</p>
              <p className="text-white/65 text-sm leading-relaxed">Навчання за кордоном та в Україні</p>
            </Link>

            <Link href="/opportunities?category=internships" className="col-span-1 group bg-white rounded-3xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border border-gray-100 flex flex-col justify-between">
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">💼</span>
                <span className="text-gray-300 group-hover:text-primary text-lg transition-colors duration-200">→</span>
              </div>
              <div>
                <p className="text-xl font-black text-gray-900 leading-tight mb-1">Стажування</p>
                <p className="text-xs text-gray-500 leading-snug">Досвід у топових компаніях</p>
              </div>
            </Link>

            <Link href="/opportunities?category=exchanges" className="col-span-1 group bg-white rounded-3xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border border-gray-100 flex flex-col justify-between">
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">🌍</span>
                <span className="text-gray-300 group-hover:text-primary text-lg transition-colors duration-200">→</span>
              </div>
              <div>
                <p className="text-xl font-black text-gray-900 leading-tight mb-1">Обміни</p>
                <p className="text-xs text-gray-500 leading-snug">Програми обміну в Європі та світі</p>
              </div>
            </Link>

            <Link href="/opportunities?category=volunteering" className="col-span-1 group bg-white rounded-3xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border border-gray-100 flex flex-col justify-between">
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">🤝</span>
                <span className="text-gray-300 group-hover:text-primary text-lg transition-colors duration-200">→</span>
              </div>
              <div>
                <p className="text-xl font-black text-gray-900 leading-tight mb-1">Волонтерство</p>
                <p className="text-xs text-gray-500 leading-snug">Допомагай і розвивайся</p>
              </div>
            </Link>

            <Link href="/opportunities?category=competitions" className="col-span-1 group bg-white rounded-3xl p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border border-gray-100 flex flex-col justify-between">
              <div className="flex items-start justify-between mb-4">
                <span className="text-3xl">🏆</span>
                <span className="text-gray-300 group-hover:text-primary text-lg transition-colors duration-200">→</span>
              </div>
              <div>
                <p className="text-xl font-black text-gray-900 leading-tight mb-1">Конкурси</p>
                <p className="text-xs text-gray-500 leading-snug">Змагання та нагороди</p>
              </div>
            </Link>

            <Link href="/opportunities?category=grants" className="col-span-1 md:col-span-2 group bg-primary rounded-3xl p-7 text-white hover:bg-primary-dark transition-all duration-200">
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

      {/* ── Recommendations + Featured ───────────────────────────────── */}
      <HomeRecommendations />
      <FeaturedSection />

      {/* ── Org CTA — full blue ──────────────────────────────────────── */}
      <section className="bg-primary py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
            <div>
              <p className="text-white/50 text-xs font-bold tracking-widest uppercase mb-5">Для організацій</p>
              <h2 className="text-5xl md:text-6xl font-black text-white leading-[1.0] mb-6">
                Ви організація
                <br />
                або{" "}
                <span className="relative inline-block">
                  фонд?
                  <span className="absolute -bottom-1 left-0 right-0 h-[4px] bg-white/50 rounded-full" />
                </span>
              </h2>
              <p className="text-white/60 text-lg leading-relaxed max-w-md">
                Розмістіть свою програму безкоштовно і охопіть тисячі молодих українців, які шукають саме такі можливості
              </p>
            </div>
            <Link
              href="/organizations"
              className="flex-shrink-0 px-8 py-4 rounded-2xl bg-white text-primary font-bold text-base hover:bg-primary-light transition-all shadow-xl hover:-translate-y-0.5"
            >
              Розмістити можливість →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Marquee ──────────────────────────────────────────────────── */}
      <div className="bg-foreground py-4 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap w-max">
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center flex-none">
              {marqueeItems.map((item) => (
                <span key={`${i}-${item}`} className="inline-flex items-center gap-6 text-xs font-bold tracking-[0.2em] text-white/40 px-6">
                  {item}
                  <span className="text-primary font-black">·</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Telegram ─────────────────────────────────────────────────── */}
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
            <a href="https://t.me/mozhyvo_bot" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#2AABEE] text-white font-semibold text-sm hover:bg-[#229ED9] transition-all shadow-md flex-shrink-0">
              Відкрити бота →
            </a>
          </div>
        </div>
      </section>

      {/* ── Newsletter ───────────────────────────────────────────────── */}
      <section id="newsletter" className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-light text-primary mb-5 text-2xl">📬</div>
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
