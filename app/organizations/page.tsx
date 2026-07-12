import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Для організацій — МОЖUВО",
  description:
    "Розмісти свою можливість на МОЖUВО і охопи молодих українців. Безкоштовно.",
};

const steps = [
  {
    number: "01",
    title: "Створи профіль",
    description:
      "Зареєструйся, заповни профіль організації, пройди верифікацію — і отримай позначку «Перевірена організація».",
    icon: "🏛️",
  },
  {
    number: "02",
    title: "Додай можливість",
    description:
      "Заповни форму: назва, опис, вимоги, дедлайн, формат, фінансування. Ми допоможемо зробити оголошення привабливим.",
    icon: "📝",
  },
  {
    number: "03",
    title: "Отримуй заявки",
    description:
      "Молодь знаходить твою можливість через пошук і фільтри, зберігає та подає заявки. Відстежуй охоплення в кабінеті.",
    icon: "📊",
  },
];

const benefits = [
  {
    emoji: "🎯",
    title: "Цільова аудиторія",
    description: "Студенти, активісти та фахівці, які активно шукають можливості для розвитку.",
  },
  {
    emoji: "✅",
    title: "Верифікація та довіра",
    description: "Верифіковані організації отримують знак довіри, що підвищує відгук на оголошення.",
  },
  {
    emoji: "📊",
    title: "Аналітика охоплення",
    description: "Переглядай кількість переглядів, збережень і кліків на кнопку «Подати заявку».",
  },
  {
    emoji: "🆓",
    title: "Безкоштовний старт",
    description: "Базове розміщення повністю безкоштовне. Преміум-опції для більшого охоплення — в планах.",
  },
  {
    emoji: "⚡",
    title: "Швидкий старт",
    description: "Перше оголошення можна опублікувати менш ніж за 10 хвилин без технічних навичок.",
  },
  {
    emoji: "🌍",
    title: "Міжнародний масштаб",
    description: "Платформа будується з урахуванням росту — незабаром додамо підтримку інших країн та мов.",
  },
];

const orgTypes = [
  "🏛️ НГО та громадські організації",
  "🎓 Університети та освітні установи",
  "💰 Міжнародні фонди та донори",
  "🏢 Компанії зі стажуванням",
  "🇪🇺 Програми ЄС та міжнародні партнерства",
  "🚀 Стартапи та tech-компанії",
];

export default function OrganizationsPage() {
  return (
    <>
      {/* ── Hero — primary blue ──────────────────────────────────── */}
      <section className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 text-white/70 text-xs font-semibold mb-8">
              <span>✦</span>
              Для організацій-партнерів
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.04] mb-6">
              Розміщуй там,
              <br />
              де молодь{" "}
              <span className="underline decoration-white/40 decoration-wavy">справді шукає</span>
            </h1>
            <p className="text-white/70 text-xl leading-relaxed max-w-xl mb-10">
              Тисячі молодих українців щодня шукають гранти, стажування та
              обміни. МОЖUВО — єдина платформа, де вони це роблять.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/register"
                className="px-8 py-4 rounded-full bg-white text-primary font-bold hover:bg-primary-light transition-all duration-200 shadow-lg"
              >
                Зареєструвати організацію →
              </Link>
              <Link
                href="/opportunities"
                className="px-8 py-4 rounded-full border border-white/30 text-white font-semibold hover:bg-white/10 transition-all duration-200"
              >
                Переглянути приклади
              </Link>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-16 pt-8 border-t border-white/15 flex flex-wrap gap-12">
            {[
              { num: "< 10 хв", label: "до першої публікації" },
              { num: "0₴", label: "базове розміщення" },
              { num: "100%", label: "верифіковані організації" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-4xl font-black leading-none text-white">
                  {s.num}
                </p>
                <p className="text-white/50 text-sm mt-1.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works — horizontal timeline ───────────────────── */}
      <section className="bg-white py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-[1.05]">
              Як це працює?
            </h2>
            <p className="text-gray-500 text-base mt-3">
              Три кроки до першої публікації
            </p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Connecting line */}
            <div
              aria-hidden
              className="hidden md:block absolute top-6 h-px bg-gray-200"
              style={{ left: "calc(16.67% + 24px)", right: "calc(16.67% + 24px)" }}
            />

            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-black text-sm relative z-10 mb-5 shadow-lg shadow-primary/30">
                  {step.number}
                </div>
                <span className="text-3xl mb-3">{step.icon}</span>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed max-w-xs">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits — horizontal feature rows ───────────────────── */}
      <section style={{ backgroundColor: "#F7F8FF" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-[1.05]">
              Чому обирають МОЖUВО?
            </h2>
            <p className="text-gray-500 text-base mt-3">
              Платформа, яка працює на результат
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {benefits.map((b) => (
              <div
                key={b.title}
                className="flex items-start gap-5 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary-light flex items-center justify-center text-2xl flex-shrink-0">
                  {b.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 mb-1">{b.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who can post ─────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-[1.05] mb-5">
                Хто може<br />розміщувати?
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed mb-8 max-w-sm">
                Ми працюємо з усіма типами організацій, що пропонують
                можливості для молоді.
              </p>
              <div className="flex flex-wrap gap-2.5">
                {orgTypes.map((type) => (
                  <span
                    key={type}
                    className="inline-flex items-center px-4 py-2 rounded-full bg-primary-light text-primary text-sm font-medium"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-primary rounded-3xl p-8 text-white relative overflow-hidden">
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 85% 15%, rgba(255,255,255,0.12) 0%, transparent 50%)",
                }}
              />
              <div className="relative z-10 divide-y divide-white/15">
                <div className="pb-6">
                  <p className="text-5xl font-black leading-none mb-1">0₴</p>
                  <p className="text-white/55 text-sm">базове розміщення — завжди безкоштовно</p>
                </div>
                <div className="py-6">
                  <p className="text-5xl font-black leading-none mb-1">100%</p>
                  <p className="text-white/55 text-sm">верифіковані організації — тільки перевірені</p>
                </div>
                <div className="pt-6">
                  <p className="text-5xl font-black leading-none mb-1">{"< 10 хв"}</p>
                  <p className="text-white/55 text-sm">до першої публікації без технічних навичок</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="bg-primary rounded-3xl px-8 py-16 text-center relative overflow-hidden">
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 15% 50%, rgba(255,214,0,0.15) 0%, transparent 45%), radial-gradient(circle at 85% 20%, rgba(255,255,255,0.10) 0%, transparent 40%)",
              }}
            />
            <div className="relative z-10">
              <div className="text-4xl mb-5">🚀</div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
                Готові почати?
              </h2>
              <p className="text-white/80 mb-8 max-w-lg mx-auto">
                Зареєструйтесь і опублікуйте першу можливість безкоштовно.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-primary font-bold hover:bg-primary-light transition-all duration-200 shadow-lg hover:-translate-y-0.5"
                >
                  Зареєструвати організацію →
                </Link>
                <Link
                  href="/contacts"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-white/30 text-white font-semibold hover:bg-white/10 transition-all duration-200"
                >
                  Написати нам
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
