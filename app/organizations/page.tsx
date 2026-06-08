import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Для організацій — Моживо",
  description:
    "Розмісти свою можливість на Моживо і охопи тисячі молодих українців. Безкоштовно.",
};

const steps = [
  {
    number: "01",
    title: "Створи профіль організації",
    description:
      "Зареєструйся, заповни профіль НГО, фонду або компанії, пройди верифікацію — і отримай позначку «Перевірена організація».",
  },
  {
    number: "02",
    title: "Додай можливість",
    description:
      "Заповни структуровану форму: назва, опис, вимоги, дедлайн, формат, фінансування. Ми допоможемо зробити оголошення зрозумілим та привабливим.",
  },
  {
    number: "03",
    title: "Отримуй заявки",
    description:
      "Молодь знаходить твою можливість через пошук і фільтри, зберігає її та подає заявки. Відстежуй охоплення у своєму кабінеті.",
  },
];

const benefits = [
  {
    emoji: "🎯",
    title: "Цільова аудиторія",
    description:
      "Платформою користуються студенти, активісти та фахівці, які активно шукають можливості для розвитку.",
  },
  {
    emoji: "✅",
    title: "Верифікація",
    description:
      "Верифіковані організації отримують знак довіри, що підвищує відгук на оголошення.",
  },
  {
    emoji: "📊",
    title: "Аналітика",
    description:
      "Переглядай кількість переглядів, збережень і кліків на кнопку «Подати заявку».",
  },
  {
    emoji: "🆓",
    title: "Безкоштовний старт",
    description:
      "Базовий розміщення повністю безкоштовне. Преміум-опції для більшого охоплення — в планах.",
  },
  {
    emoji: "🌍",
    title: "Міжнародний масштаб",
    description:
      "Платформа будується з урахуванням росту — незабаром додамо підтримку інших країн та мов.",
  },
  {
    emoji: "⚡",
    title: "Швидкий старт",
    description:
      "Перше оголошення можна опублікувати менш ніж за 10 хвилин без технічних навичок.",
  },
];

const orgTypes = [
  "🏛️ НГО та громадські організації",
  "🎓 Університети та освітні установи",
  "💰 Міжнародні фонди та донори",
  "🏢 Компанії зі стажуванням та молодіжними програмами",
  "🇪🇺 Програми ЄС та міжнародні партнерства",
  "🚀 Стартапи та tech-компанії",
];

export default function OrganizationsPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-light text-primary text-xs font-semibold mb-6 uppercase tracking-wide">
            Для організацій-партнерів
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight leading-tight mb-6 text-balance">
            Розміщуй свої можливості там,{" "}
            <span className="text-primary">де їх побачать</span>
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto mb-10 leading-relaxed text-balance">
            Тисячі молодих українців щодня шукають гранти, стажування та
            обміни. Моживо — єдина платформа, де вони це роблять.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="px-6 py-3 rounded-2xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all duration-200 shadow-md shadow-primary/20"
            >
              Зареєструвати організацію
            </Link>
            <Link
              href="/opportunities"
              className="px-6 py-3 rounded-2xl border border-border text-foreground font-semibold text-sm hover:border-primary hover:text-primary transition-all duration-200"
            >
              Переглянути приклади →
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-12 text-center">
          Як це працює?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center">
                <span className="text-primary font-bold text-sm">
                  {step.number}
                </span>
              </div>
              <h3 className="font-bold text-foreground text-lg">
                {step.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-muted-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-12 text-center">
            Чому обирають Моживо?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="bg-white rounded-2xl border border-border p-6 shadow-sm"
              >
                <span className="text-3xl mb-4 block">{b.emoji}</span>
                <h3 className="font-semibold text-foreground mb-2">
                  {b.title}
                </h3>
                <p className="text-sm text-muted leading-relaxed">
                  {b.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who can post */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Хто може розміщувати?
            </h2>
            <p className="text-muted mb-8 leading-relaxed">
              Ми працюємо з усіма типами організацій, що пропонують
              можливості для молоді — від невеликих НГО до великих
              міжнародних програм.
            </p>
            <ul className="flex flex-col gap-3">
              {orgTypes.map((type) => (
                <li key={type} className="flex items-center gap-3 text-sm text-muted">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  {type}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-primary rounded-3xl p-8 text-white relative overflow-hidden">
            <div
              aria-hidden
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 80% 20%, #FFD600 0%, transparent 50%)",
              }}
            />
            <div className="relative z-10">
              <p className="text-4xl font-extrabold mb-1">1 200+</p>
              <p className="text-white/70 text-sm mb-6">
                можливостей на платформі
              </p>
              <p className="text-4xl font-extrabold mb-1">300+</p>
              <p className="text-white/70 text-sm mb-6">
                верифікованих організацій
              </p>
              <p className="text-4xl font-extrabold mb-1">5 000+</p>
              <p className="text-white/70 text-sm">
                активних користувачів щомісяця
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-muted-bg border-t border-border">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Готові почати?
          </h2>
          <p className="text-muted mb-8">
            Зареєструйтесь і опублікуйте першу можливість безкоштовно.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/register"
              className="px-6 py-3 rounded-2xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all duration-200 shadow-md shadow-primary/20"
            >
              Зареєструвати організацію
            </Link>
            <Link
              href="/contacts"
              className="px-6 py-3 rounded-2xl border border-border text-foreground font-semibold text-sm hover:border-primary hover:text-primary transition-all duration-200"
            >
              Написати нам
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
