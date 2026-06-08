import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Про нас — Моживо",
  description:
    "Дізнайся більше про Моживо — платформу міжнародних можливостей для молоді України.",
};

const values = [
  {
    emoji: "🔍",
    title: "Прозорість",
    description:
      "Чіткі дедлайни, вимоги та умови участі. Мінімум неповних або «сірих» оголошень. Лише верифіковані організації.",
  },
  {
    emoji: "⚡",
    title: "Зручність",
    description:
      "Вся інформація — в одному місці. Розширені фільтри, особистий кабінет, збереження та відстеження дедлайнів.",
  },
  {
    emoji: "🎯",
    title: "Персоналізація",
    description:
      "Підбір можливостей за профілем: вік, освіта, мови, сфера інтересів. Рекомендації на основі твоєї активності.",
  },
  {
    emoji: "🤝",
    title: "Довіра",
    description:
      "Верифікація організацій, позначка «Перевірена організація», відгуки учасників програм.",
  },
];

const team = [
  {
    emoji: "👩‍💻",
    name: "Команда засновників",
    role: "Стратегія та розвиток продукту",
  },
  {
    emoji: "🎨",
    name: "Дизайн та UX",
    role: "Зручний та зрозумілий інтерфейс",
  },
  {
    emoji: "⚙️",
    name: "Технічна команда",
    role: "Розробка та підтримка платформи",
  },
  {
    emoji: "🌍",
    name: "Партнерська мережа",
    role: "Залучення організацій та верифікація",
  },
];

const milestones = [
  {
    year: "2024",
    text: "Ідея та дослідження: 50+ інтерв'ю з молоддю та організаціями",
  },
  { year: "2025", text: "Запуск MVP платформи з першими 300+ організаціями" },
  {
    year: "2025",
    text: "Мобільний застосунок та персоналізований підбір можливостей",
  },
  { year: "2026", text: "Масштабування на міжнародний рівень" },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight mb-6">
            Ми будуємо простір,{" "}
            <span className="text-primary">де можливості знаходять людей</span>
          </h1>
          <p className="text-lg text-muted leading-relaxed max-w-2xl mx-auto">
            Моживо — українська платформа, що зібрала в одному місці всі
            міжнародні можливості для молоді: гранти, стипендії, стажування,
            обміни, волонтерство та більше.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
              Наша місія
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-5">
              Зробити кожну можливість доступною
            </h2>
            <p className="text-muted leading-relaxed mb-5">
              Сьогодні молодь шукає гранти та стажування в десятках Telegram-каналів,
              на розрізнених сайтах і в соцмережах. Потрібна інформація часто
              загублена, а дедлайни — пропущені.
            </p>
            <p className="text-muted leading-relaxed">
              Моживо змінює це: ми агрегуємо, верифікуємо та структуруємо
              інформацію, щоб кожен міг знайти свою можливість за лічені хвилини.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { number: "1 200+", label: "можливостей" },
              { number: "300+", label: "організацій" },
              { number: "20+", label: "категорій" },
              { number: "50+", label: "країн" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-muted-bg rounded-2xl p-6 text-center"
              >
                <p className="text-3xl font-extrabold text-primary mb-1">
                  {stat.number}
                </p>
                <p className="text-sm text-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-muted-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-12 text-center">
            Наші цінності
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                className="bg-white rounded-2xl border border-border p-6 shadow-sm"
              >
                <span className="text-3xl mb-4 block">{v.emoji}</span>
                <h3 className="font-semibold text-foreground mb-2">
                  {v.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roadmap */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-12 text-center">
          Як ми розвиваємося
        </h2>
        <div className="relative">
          <div className="absolute left-[22px] top-0 bottom-0 w-0.5 bg-border" />
          <div className="flex flex-col gap-8">
            {milestones.map((m, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="relative z-10 w-11 h-11 rounded-full bg-primary-light border-2 border-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-primary text-xs font-bold">
                    {m.year.slice(2)}
                  </span>
                </div>
                <div className="pt-2">
                  <p className="text-xs font-semibold text-primary mb-1">
                    {m.year}
                  </p>
                  <p className="text-sm text-muted leading-relaxed">{m.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-muted-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-12 text-center">
            Команда
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member) => (
              <div
                key={member.name}
                className="bg-white rounded-2xl border border-border p-6 shadow-sm text-center"
              >
                <span className="text-5xl block mb-4">{member.emoji}</span>
                <p className="font-semibold text-foreground mb-1">
                  {member.name}
                </p>
                <p className="text-sm text-muted">{member.role}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-muted mt-8">
            Ми зростаємо 🇺🇦 — якщо хочеш долучитися,{" "}
            <Link
              href="/contacts"
              className="text-primary hover:underline font-medium"
            >
              напиши нам
            </Link>
            .
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Готовий знайти свою можливість?
        </h2>
        <p className="text-muted mb-8">
          Переглянь 1 200+ можливостей прямо зараз — безкоштовно і без реєстрації.
        </p>
        <Link
          href="/opportunities"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all duration-200 shadow-md shadow-primary/20"
        >
          Переглянути можливості →
        </Link>
      </section>
    </>
  );
}
