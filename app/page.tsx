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
  scholarship: "bg-violet-100 text-violet-700",
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
    href: "/opportunities/daad",
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
      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div
          aria-hidden
          className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-[0.07] bg-primary pointer-events-none"
          style={{ filter: "blur(80px)" }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-light text-primary text-xs font-semibold mb-6 tracking-wide uppercase">
            🇺🇦 Платформа для молоді України
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-tight text-balance mb-6">
            Знайди свою{" "}
            <span className="text-primary">можливість</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed text-balance">
            Гранти, стажування, обміни, волонтерство — все в одному місці для
            молоді України
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-10">
            <Link
              href="/opportunities"
              className="px-6 py-3 rounded-2xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all duration-200 shadow-md shadow-primary/20 w-full sm:w-auto text-center"
            >
              Переглянути можливості
            </Link>
            <Link
              href="/organizations"
              className="px-6 py-3 rounded-2xl border border-border text-foreground font-semibold text-sm hover:border-primary hover:text-primary transition-all duration-200 w-full sm:w-auto text-center"
            >
              Додати організацію
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
              1 200+ можливостей
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
              300+ організацій
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
              Верифіковані партнери
            </span>
          </div>
        </div>
      </section>

      {/* Category cards */}
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

      {/* Featured opportunities */}
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

      {/* CTA banner */}
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
