import Link from "next/link";
import FeaturedSection from "@/components/FeaturedSection";

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
      {/* ── Hero — white ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white">
        {/* Soft radial glow */}
        <div
          aria-hidden
          className="absolute -top-20 right-0 w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(59,79,232,0.06) 0%, transparent 65%)",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-0 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center py-6 lg:py-10">

            {/* Left: content */}
            <div className="flex flex-col gap-7">
              <div className="inline-flex items-center gap-2 self-start px-4 py-1.5 rounded-full border border-primary/25 bg-white text-primary text-xs font-semibold shadow-sm">
                <span>✦</span>
                Платформа можливостей для молоді
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-foreground tracking-tight leading-[1.04]">
                Знайди свою
                <br />
                можливість
                <br />
                <span className="text-primary">у світі</span>
              </h1>

              <p className="text-lg text-muted leading-relaxed max-w-[440px]">
                Гранти, стажування, обміни та волонтерство — все в одному місці
                для молоді України
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/opportunities"
                  className="px-6 py-3 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 hover:-translate-y-0.5"
                >
                  Знайти свою можливість →
                </Link>
                <Link
                  href="/organizations"
                  className="px-6 py-3 rounded-full border-2 border-primary/20 text-primary font-semibold text-sm hover:border-primary/50 hover:bg-primary-light transition-all"
                >
                  Для організацій
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-1">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🌍</span>
                  <div>
                    <p className="text-sm font-bold text-foreground leading-tight">40+</p>
                    <p className="text-xs text-muted">країн</p>
                  </div>
                </div>
                <div className="w-px h-8 bg-border" />
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">📋</span>
                  <div>
                    <p className="text-sm font-bold text-foreground leading-tight">1 200+</p>
                    <p className="text-xs text-muted">можливостей</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: compact overlapping card stack */}
            <div className="relative h-[360px] sm:h-[400px] lg:h-[400px] w-full overflow-hidden">

              {/* Card 1 — Erasmus, indigo, float1 */}
              <div
                className="absolute z-0 animate-float1"
                style={{ top: "80px", left: "10px", width: "278px" }}
              >
                <div className="bg-primary rounded-2xl p-5 shadow-2xl shadow-primary/30 text-white">
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

              {/* Card 2 — DAAD, white, float2, overlaps Card 1 bottom */}
              <div
                className="absolute z-10 animate-float2"
                style={{ top: "205px", left: "50px", width: "240px" }}
              >
                <div className="bg-white rounded-2xl p-5 shadow-xl border border-border">
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

              {/* Card 3 — Notification, top-right, float3 */}
              <div
                className="absolute z-20 animate-float3"
                style={{ top: "15px", right: "10px", width: "178px" }}
              >
                <div className="bg-white rounded-2xl p-4 shadow-lg border border-border">
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
      </section>

      {/* ── Why Mozhyvo — editorial 2-col layout ─────────────────────── */}
      <section className="bg-white py-16 border-t border-gray-100">
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
    </>
  );
}
