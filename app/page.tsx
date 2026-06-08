import Link from "next/link";

const categories = [
  { emoji: "🎓", name: "Стипендії", count: "340+", slug: "scholarships", bg: "bg-primary-light" },
  { emoji: "💼", name: "Стажування", count: "210+", slug: "internships", bg: "bg-amber-50" },
  { emoji: "🌍", name: "Обміни", count: "180+", slug: "exchanges", bg: "bg-green-50" },
  { emoji: "🤝", name: "Волонтерство", count: "290+", slug: "volunteering", bg: "bg-rose-50" },
  { emoji: "🏆", name: "Конкурси", count: "95+", slug: "competitions", bg: "bg-purple-50" },
  { emoji: "🚀", name: "Гранти", count: "120+", slug: "grants", bg: "bg-sky-50" },
];

const badgeColors: Record<string, string> = {
  exchange: "bg-green-100 text-green-700",
  scholarship: "bg-primary-light text-primary",
  grant: "bg-yellow-100 text-yellow-700",
};

const heartIcon = (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </svg>
);

export default function Home() {
  return (
    <>
      {/* ── Hero — white ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[80vh] flex items-center bg-white">
        {/* Soft radial glow */}
        <div
          aria-hidden
          className="absolute -top-20 right-0 w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(59,79,232,0.06) 0%, transparent 65%)",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center py-8 lg:py-16">

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
            <div className="relative h-[380px] sm:h-[420px] lg:h-[420px] w-full">

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

      {/* ── Why Mozhyvo — white ─────────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold tracking-widest text-primary uppercase mb-3">
              Платформа
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Чому Моживо?
            </h2>
            <p className="text-muted max-w-xl mx-auto">
              Ми зібрали все, що потрібно молодій людині для розвитку — в одному зручному місці
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-2xl mb-4">
                🔍
              </div>
              <h3 className="font-bold text-foreground text-lg mb-2">Все в одному місці</h3>
              <p className="text-muted text-sm leading-relaxed">
                Більше не треба шукати по десятках Telegram-каналів. Гранти,
                стажування, обміни — тут.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-2xl mb-4">
                🔔
              </div>
              <h3 className="font-bold text-foreground text-lg mb-2">Не пропусти дедлайн</h3>
              <p className="text-muted text-sm leading-relaxed">
                Зберігай цікаві можливості і отримуй нагадування до закінчення
                прийому заявок.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-2xl mb-4">
                ✅
              </div>
              <h3 className="font-bold text-foreground text-lg mb-2">Тільки перевірені організації</h3>
              <p className="text-muted text-sm leading-relaxed">
                Всі партнери верифіковані командою Моживо. Жодного шахрайства.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Category cards — #F7F8FF ─────────────────────────────────── */}
      <section style={{ backgroundColor: "#F7F8FF" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-10 text-center">
            Що ти шукаєш?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/opportunities?category=${cat.slug}`}
                className="group relative flex items-center gap-4 p-5 bg-white rounded-2xl border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-primary rounded-l-2xl transition-colors duration-200" />
                <div
                  className={`w-12 h-12 rounded-2xl ${cat.bg} flex items-center justify-center text-2xl flex-shrink-0`}
                >
                  {cat.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground group-hover:text-primary transition-colors duration-200">
                    {cat.name}
                  </p>
                  <span className="inline-block mt-1 text-xs font-medium px-2 py-0.5 bg-muted-bg text-muted rounded-full">
                    {cat.count} активних
                  </span>
                </div>
                <span className="text-muted group-hover:text-primary transition-colors duration-200 text-lg flex-shrink-0">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured opportunities — white, editorial layout ─────────── */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Актуальні можливості
            </h2>
            <Link
              href="/opportunities"
              className="text-sm font-semibold text-primary hover:underline hidden sm:block"
            >
              Переглянути всі →
            </Link>
          </div>

          {/* Editorial grid: large card left + 2 stacked right */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Large left card — Erasmus, indigo gradient */}
            <div className="lg:col-span-3">
              <div
                className="h-full min-h-[280px] rounded-2xl p-6 flex flex-col gap-4 relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, #3B4FE8 0%, #6366F1 100%)",
                }}
              >
                {/* Top row */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white text-primary">
                    🔄 Обмін
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-accent text-foreground">
                      15 лип
                    </span>
                    <span
                      className="text-white/60 hover:text-white transition-colors cursor-pointer"
                      aria-label="Зберегти"
                    >
                      {heartIcon}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col gap-2">
                  <p className="text-sm text-white/75">Erasmus+</p>
                  <p className="text-xl font-bold text-white leading-snug">
                    Програма академічної мобільності для студентів університетів
                  </p>
                  <p className="text-sm text-white/70 mt-auto">🇪🇺 Євросоюз</p>
                </div>

                {/* CTA */}
                <div className="pt-2">
                  <Link
                    href="/opportunities/erasmus-plus"
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white text-primary font-semibold text-sm hover:bg-primary-light transition-all"
                  >
                    Детальніше →
                  </Link>
                </div>
              </div>
            </div>

            {/* Right column — 2 stacked cards */}
            <div className="lg:col-span-2 flex flex-col gap-6">

              {/* DAAD — blue top border */}
              <div className="bg-white rounded-2xl border border-border border-t-4 border-t-blue-500 shadow-sm flex flex-col p-6 gap-3 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeColors.scholarship}`}>
                    Стипендія
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted bg-muted-bg px-2.5 py-1 rounded-full font-medium">
                      1 серп
                    </span>
                    <span
                      className="text-muted hover:text-rose-500 transition-colors cursor-pointer"
                      aria-label="Зберегти"
                    >
                      {heartIcon}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary mb-1">DAAD</p>
                  <p className="font-semibold text-foreground text-sm leading-snug">
                    Дослідницькі стипендії для аспірантів і вчених
                  </p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                  <span className="text-sm text-muted">🇩🇪 Німеччина</span>
                  <Link
                    href="/opportunities/daad-research"
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Детальніше →
                  </Link>
                </div>
              </div>

              {/* UCU — green top border */}
              <div className="bg-white rounded-2xl border border-border border-t-4 border-t-emerald-500 shadow-sm flex flex-col p-6 gap-3 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeColors.grant}`}>
                    Грант
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted bg-muted-bg px-2.5 py-1 rounded-full font-medium">
                      30 чер
                    </span>
                    <span
                      className="text-muted hover:text-rose-500 transition-colors cursor-pointer"
                      aria-label="Зберегти"
                    >
                      {heartIcon}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary mb-1">
                    Український Католицький Університет
                  </p>
                  <p className="font-semibold text-foreground text-sm leading-snug">
                    Грант на навчання для вимушено переміщених осіб
                  </p>
                </div>
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-border">
                  <span className="text-sm text-muted">🇺🇦 Україна</span>
                  <Link
                    href="/opportunities/ucu-grant"
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Детальніше →
                  </Link>
                </div>
              </div>

            </div>
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/opportunities"
              className="text-sm font-semibold text-primary hover:underline"
            >
              Переглянути всі →
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA banner — white section, indigo inner ─────────────────── */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
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
