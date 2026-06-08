import Link from "next/link";

const categories = [
  { emoji: "🎓", name: "Стипендії", count: "340+", slug: "scholarships" },
  { emoji: "💼", name: "Стажування", count: "210+", slug: "internships" },
  { emoji: "🌍", name: "Обміни", count: "180+", slug: "exchanges" },
  { emoji: "🤝", name: "Волонтерство", count: "290+", slug: "volunteering" },
  { emoji: "🏆", name: "Конкурси", count: "95+", slug: "competitions" },
  { emoji: "🚀", name: "Гранти", count: "120+", slug: "grants" },
];

const badgeColors: Record<string, string> = {
  exchange: "bg-green-100 text-green-700",
  scholarship: "bg-primary-light text-primary",
  grant: "bg-yellow-100 text-yellow-700",
};

const featuredOpportunities = [
  {
    type: "exchange",
    typeName: "Обмін",
    org: "Erasmus+",
    title: "Програма академічної мобільності для студентів університетів",
    deadline: "15 лип",
    flag: "🇪🇺",
    location: "Євросоюз",
    href: "/opportunities/erasmus-plus",
  },
  {
    type: "scholarship",
    typeName: "Стипендія",
    org: "DAAD",
    title: "Дослідницькі стипендії для аспірантів і вчених",
    deadline: "1 серп",
    flag: "🇩🇪",
    location: "Німеччина",
    href: "/opportunities/daad-research",
  },
  {
    type: "grant",
    typeName: "Грант",
    org: "Український Католицький Університет",
    title: "Грант на навчання для вимушено переміщених осіб",
    deadline: "30 чер",
    flag: "🇺🇦",
    location: "Україна",
    href: "/opportunities/ucu-grant",
  },
];

export default function Home() {
  return (
    <>
      {/* ── Hero ───────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden min-h-screen flex items-center"
        style={{ backgroundColor: "#F8F9FF" }}
      >
        {/* Soft radial glow behind cards */}
        <div
          aria-hidden
          className="absolute -top-20 right-0 w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(59,79,232,0.07) 0%, transparent 65%)",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-0 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center lg:min-h-screen lg:py-28">

            {/* ── Left: content ── */}
            <div className="flex flex-col gap-7">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 self-start px-4 py-1.5 rounded-full border border-primary/25 bg-white text-primary text-xs font-semibold shadow-sm">
                <span>✦</span>
                Платформа можливостей для молоді
              </div>

              {/* Headline */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-foreground tracking-tight leading-[1.04]">
                Знайди свою
                <br />
                можливість
                <br />
                <span className="text-primary">у світі</span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg text-muted leading-relaxed max-w-[440px]">
                Гранти, стажування, обміни та волонтерство — все в одному місці
                для молоді України
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/opportunities"
                  className="px-6 py-3 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 hover:-translate-y-0.5"
                >
                  Переглянути можливості →
                </Link>
                <Link
                  href="/organizations"
                  className="px-6 py-3 rounded-full border-2 border-primary/20 text-primary font-semibold text-sm hover:border-primary/50 hover:bg-primary-light transition-all"
                >
                  Для організацій
                </Link>
              </div>

              {/* Stats */}
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

            {/* ── Right: floating UI cards ── */}
            <div className="relative h-[420px] sm:h-[480px] lg:h-[520px] w-full">

              {/* Card 1 — Erasmus, large, indigo bg, float1 (-2deg) */}
              <div
                className="absolute animate-float1"
                style={{ top: "8%", left: "0", width: "290px" }}
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
                  <p className="font-extrabold text-lg leading-tight mb-1">
                    Erasmus+ 2025
                  </p>
                  <p className="text-white/65 text-sm mb-4">
                    Навчання в ЄС · До 1 000€/міс
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-white/15">
                    <span className="text-xs text-white/60">🇪🇺 Євросоюз</span>
                    <span className="text-xs font-semibold text-white/85">
                      Детальніше →
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2 — DAAD, medium, white, float2 (+3deg) */}
              <div
                className="absolute animate-float2"
                style={{ bottom: "6%", right: "0", width: "248px" }}
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

              {/* Card 3 — Notification, small, white, float3 (-1deg) */}
              <div
                className="absolute animate-float3"
                style={{ top: "3%", right: "6%", width: "186px" }}
              >
                <div className="bg-white rounded-2xl p-4 shadow-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0 text-base">
                      🔔
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground leading-tight">
                        Новий дедлайн
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        FLEX Program · 3 дні
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── Category cards ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-10 text-center">
          Що ти шукаєш?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/opportunities?category=${cat.slug}`}
              className="group flex items-center gap-4 p-5 bg-white rounded-2xl border border-border shadow-sm hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-200"
            >
              <span className="text-3xl">{cat.emoji}</span>
              <div>
                <p className="font-semibold text-foreground group-hover:text-primary transition-colors duration-200">
                  {cat.name}
                </p>
                <p className="text-sm text-muted mt-0.5">{cat.count} активних</p>
              </div>
              <span className="ml-auto text-muted group-hover:text-primary transition-colors duration-200 text-lg">
                →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured opportunities ──────────────────────────────────── */}
      <section className="bg-muted-bg">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredOpportunities.map((opp) => (
              <div
                key={opp.href}
                className="bg-white rounded-2xl border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col p-6 gap-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      badgeColors[opp.type] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {opp.typeName}
                  </span>
                  <span className="text-xs text-muted bg-muted-bg px-2.5 py-1 rounded-full font-medium">
                    Дедлайн: {opp.deadline}
                  </span>
                </div>

                <div>
                  <p className="text-xs font-medium text-muted mb-1">{opp.org}</p>
                  <p className="font-semibold text-foreground leading-snug">
                    {opp.title}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-border">
                  <span className="text-sm text-muted flex items-center gap-1.5">
                    {opp.flag} {opp.location}
                  </span>
                  <Link
                    href={opp.href}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Детальніше →
                  </Link>
                </div>
              </div>
            ))}
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

      {/* ── CTA banner ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-primary rounded-3xl px-8 py-14 text-center relative overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, #FFD600 0%, transparent 50%), radial-gradient(circle at 80% 20%, #ffffff 0%, transparent 40%)",
            }}
          />
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
              Є організація чи програма?
            </h2>
            <p className="text-white/80 mb-8 max-w-lg mx-auto">
              Розмісти свою можливість безкоштовно і охопи тисячі молодих
              українців.
            </p>
            <Link
              href="/organizations"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-accent text-foreground font-semibold text-sm hover:bg-accent-dark transition-all duration-200 shadow-lg"
            >
              Додати організацію
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
