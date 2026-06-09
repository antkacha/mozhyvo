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
    icon: "🏛️",
  },
  {
    number: "02",
    title: "Додай можливість",
    description:
      "Заповни структуровану форму: назва, опис, вимоги, дедлайн, формат, фінансування. Ми допоможемо зробити оголошення зрозумілим та привабливим.",
    icon: "📝",
  },
  {
    number: "03",
    title: "Отримуй заявки",
    description:
      "Молодь знаходить твою можливість через пошук і фільтри, зберігає її та подає заявки. Відстежуй охоплення у своєму кабінеті.",
    icon: "📊",
  },
];

const benefits = [
  { emoji: "🎯", title: "Цільова аудиторія", description: "Студенти, активісти та фахівці, які активно шукають можливості для розвитку.", wide: true },
  { emoji: "✅", title: "Верифікація", description: "Верифіковані організації отримують знак довіри, що підвищує відгук на оголошення." },
  { emoji: "📊", title: "Аналітика", description: "Переглядай кількість переглядів, збережень і кліків на кнопку «Подати заявку»." },
  { emoji: "🆓", title: "Безкоштовний старт", description: "Базове розміщення повністю безкоштовне. Преміум-опції для більшого охоплення — в планах." },
  { emoji: "🌍", title: "Міжнародний масштаб", description: "Платформа будується з урахуванням росту — незабаром додамо підтримку інших країн та мов." },
  { emoji: "⚡", title: "Швидкий старт", description: "Перше оголошення можна опублікувати менш ніж за 10 хвилин без технічних навичок.", wide: true },
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
      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white border-b border-gray-100">
        <div
          aria-hidden
          className="absolute -top-20 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(59,79,232,0.05) 0%, transparent 65%)" }}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/25 bg-white text-primary text-xs font-semibold shadow-sm mb-6">
                <span>✦</span>
                Для організацій-партнерів
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-[1.05] mb-5">
                Розміщуй свої<br />
                можливості там,{" "}
                <span className="text-primary">де їх побачать</span>
              </h1>
              <p className="text-gray-500 text-lg leading-relaxed max-w-md mb-8">
                Тисячі молодих українців щодня шукають гранти, стажування та
                обміни. Моживо — єдина платформа, де вони це роблять.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="px-6 py-3 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all shadow-lg shadow-primary/25 hover:-translate-y-0.5"
                >
                  Зареєструвати організацію →
                </Link>
                <Link
                  href="/opportunities"
                  className="px-6 py-3 rounded-full border-2 border-primary/20 text-primary font-semibold text-sm hover:border-primary/50 hover:bg-primary-light transition-all"
                >
                  Переглянути приклади
                </Link>
              </div>
            </div>

            {/* Right: floating stat cards */}
            <div className="hidden lg:block relative h-[300px]">

              {/* Main stats card */}
              <div className="absolute animate-float1" style={{ top: "20px", left: "10px", width: "260px" }}>
                <div className="bg-primary rounded-2xl p-6 shadow-2xl shadow-primary/25 text-white">
                  <p className="text-xs font-semibold text-white/60 uppercase tracking-wide mb-4">Моживо сьогодні</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-3xl font-black leading-none">1 200+</p>
                      <p className="text-white/60 text-xs mt-0.5">можливостей на платформі</p>
                    </div>
                    <div className="border-t border-white/10 pt-3">
                      <p className="text-3xl font-black leading-none">5 000+</p>
                      <p className="text-white/60 text-xs mt-0.5">активних користувачів</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verified badge card */}
              <div className="absolute animate-float2" style={{ top: "170px", left: "70px", width: "230px" }}>
                <div className="bg-white rounded-2xl p-4 shadow-xl border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-lg flex-shrink-0">✅</div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 leading-tight">Організацію верифіковано</p>
                      <p className="text-xs text-gray-400 mt-0.5">300+ партнерів</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notification */}
              <div className="absolute animate-float3" style={{ top: "10px", right: "0px", width: "165px" }}>
                <div className="bg-white rounded-2xl p-3.5 shadow-lg border border-border">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0 text-sm">🎯</div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 leading-tight">Нова заявка</p>
                      <p className="text-xs text-gray-400 mt-0.5">Erasmus+ · щойно</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── How it works — editorial numbered steps ──────────────── */}
      <section className="bg-white py-16 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            {/* Left: title + stat */}
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-[1.05] mb-5">
                Як це<br />працює?
              </h2>
              <p className="text-gray-500 text-lg leading-relaxed max-w-xs">
                Три прості кроки — і твоя можливість доступна тисячам.
              </p>
              <div className="mt-10">
                <p className="text-5xl font-black text-primary leading-none">10 хв</p>
                <p className="text-sm text-gray-500 mt-2">до першої публікації</p>
              </div>
            </div>

            {/* Right: numbered steps */}
            <div>
              {steps.map((step) => (
                <div key={step.number} className="flex gap-5 py-6 border-b border-gray-100 last:border-0">
                  <span className="text-xs font-mono font-bold text-gray-300 pt-1 w-5 flex-shrink-0">{step.number}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-base mb-1.5">{step.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
                  </div>
                  <span className="text-2xl flex-shrink-0 self-start">{step.icon}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── Benefits — bento grid ────────────────────────────────── */}
      <section style={{ backgroundColor: "#F7F8FF" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-[1.05]">
              Чому обирають Моживо?
            </h2>
            <p className="text-gray-500 text-base mt-3">
              Платформа, яка працює на результат
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            {/* Wide: Цільова аудиторія */}
            <div className="col-span-1 md:col-span-2 bg-primary rounded-3xl p-7 text-white">
              <span className="text-4xl mb-5 block">🎯</span>
              <h3 className="text-xl font-black mb-2">Цільова аудиторія</h3>
              <p className="text-white/65 text-sm leading-relaxed">
                Студенти, активісти та фахівці, які активно шукають можливості для розвитку.
              </p>
            </div>

            {/* Normal: Верифікація */}
            <div className="col-span-1 bg-white rounded-3xl p-6 border border-gray-100 flex flex-col justify-between">
              <span className="text-3xl mb-4 block">✅</span>
              <div>
                <h3 className="font-bold text-gray-900 mb-1.5">Верифікація</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Знак довіри підвищує відгук на оголошення.</p>
              </div>
            </div>

            {/* Normal: Аналітика */}
            <div className="col-span-1 bg-white rounded-3xl p-6 border border-gray-100 flex flex-col justify-between">
              <span className="text-3xl mb-4 block">📊</span>
              <div>
                <h3 className="font-bold text-gray-900 mb-1.5">Аналітика</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Переглядай перегляди, збереження та кліки.</p>
              </div>
            </div>

            {/* Normal: Безкоштовно */}
            <div className="col-span-1 bg-white rounded-3xl p-6 border border-gray-100 flex flex-col justify-between">
              <span className="text-3xl mb-4 block">🆓</span>
              <div>
                <h3 className="font-bold text-gray-900 mb-1.5">Безкоштовний старт</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Базове розміщення повністю безкоштовне.</p>
              </div>
            </div>

            {/* Normal: Міжнародний масштаб */}
            <div className="col-span-1 bg-white rounded-3xl p-6 border border-gray-100 flex flex-col justify-between">
              <span className="text-3xl mb-4 block">🌍</span>
              <div>
                <h3 className="font-bold text-gray-900 mb-1.5">Міжнародний масштаб</h3>
                <p className="text-gray-500 text-sm leading-relaxed">Незабаром додамо підтримку інших країн та мов.</p>
              </div>
            </div>

            {/* Wide: Швидкий старт */}
            <div className="col-span-1 md:col-span-2 bg-primary rounded-3xl p-7 text-white">
              <span className="text-4xl mb-5 block">⚡</span>
              <h3 className="text-xl font-black mb-2">Швидкий старт</h3>
              <p className="text-white/65 text-sm leading-relaxed">
                Перше оголошення можна опублікувати менш ніж за 10 хвилин без технічних навичок.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── Who can post ─────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left */}
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

            {/* Right: stats card */}
            <div className="bg-primary rounded-3xl p-8 text-white relative overflow-hidden">
              <div
                aria-hidden
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 85% 15%, rgba(255,214,0,0.2) 0%, transparent 45%), radial-gradient(circle at 15% 85%, rgba(255,255,255,0.07) 0%, transparent 40%)",
                }}
              />
              <div className="relative z-10 divide-y divide-white/10">
                <div className="pb-6">
                  <p className="text-5xl font-black leading-none mb-1">1 200+</p>
                  <p className="text-white/60 text-sm">можливостей на платформі</p>
                </div>
                <div className="py-6">
                  <p className="text-5xl font-black leading-none mb-1">300+</p>
                  <p className="text-white/60 text-sm">верифікованих організацій</p>
                </div>
                <div className="pt-6">
                  <p className="text-5xl font-black leading-none mb-1">5 000+</p>
                  <p className="text-white/60 text-sm">активних користувачів щомісяця</p>
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
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-accent text-foreground font-semibold hover:bg-accent-dark transition-all duration-200 shadow-lg"
                >
                  Зареєструвати організацію →
                </Link>
                <Link
                  href="/contacts"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/10 text-white font-semibold hover:bg-white/20 transition-all duration-200"
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
