import type { Metadata } from "next";
import Link from "next/link";
import FounderImage from "@/components/FounderImage";

export const metadata: Metadata = {
  title: "Про нас — Моживо",
  description:
    "Знайомся з командою Моживо — платформою, що зібрала гранти, стажування та обміни для молоді України в одному місці.",
};

export default function AboutPage() {
  return (
    <>
      {/* ── Section 1: Hero ─────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-14">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/25 bg-white text-primary text-xs font-semibold shadow-sm mb-8">
            <span>✦</span>
            Наша історія
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-[1.1] max-w-3xl mb-6">
            Ми віримо, що кожен українець заслуговує знати про свої можливості
          </h1>

          <p className="text-gray-500 text-lg leading-relaxed max-w-2xl">
            Моживо — це платформа, яка зібрала гранти, стажування, обміни та
            волонтерство в одному місці. Ми зробили це, бо самі шукали ці
            можливості і знаємо, як це складно.
          </p>
        </div>
      </section>

      {/* ── Section 2: Problem we solve ─────────────────────────────── */}
      <section style={{ backgroundColor: "#F7F8FF" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: bold statement */}
            <div>
              <p className="text-2xl md:text-3xl font-black text-gray-900 leading-snug">
                Раніше потрібно було моніторити десятки Telegram-каналів,
                Facebook-груп і сайтів щодня.{" "}
                <span className="text-primary">Більшість просто здавалась.</span>
              </p>
            </div>

            {/* Right: 3 stat blocks */}
            <div className="flex flex-col gap-5">
              {[
                {
                  icon: "📡",
                  title: "Сотні джерел",
                  desc: "Ми агрегуємо можливості з десятків платформ",
                },
                {
                  icon: "⏱️",
                  title: "Економія часу",
                  desc: "Не треба шукати — можливості самі знаходять тебе",
                },
                {
                  icon: "🔒",
                  title: "Тільки перевірене",
                  desc: "Жодних сумнівних програм — тільки верифіковані організації",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
                >
                  <span className="text-2xl flex-shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <p className="font-bold text-gray-900 mb-0.5">{item.title}</p>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3: Founders ─────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
              Хто ми?
            </h2>
            <p className="text-gray-500 text-base mt-2">
              Двоє, які вирішили змінити те, що їх самих колись дратувало
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Founder 1 — Аня */}
            <div className="flex flex-col sm:flex-row gap-6 p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-32 h-32 rounded-full bg-indigo-50 flex-shrink-0 overflow-hidden ring-2 ring-indigo-100 self-start">
                <FounderImage src="/founders/anya.jpg" alt="Аня Ткаченко" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 mb-0.5">
                  Аня Ткаченко
                </p>
                <p className="text-sm font-medium text-primary mb-3">
                  Co-founder & Product
                </p>
                <p className="text-gray-500 text-sm leading-relaxed">
                  20 років, студентка-айтішниця та просто людина, яка дуже
                  любить можливості.
                </p>
                <p className="text-gray-500 text-sm leading-relaxed mt-2">
                  Брала участь у 9 міжнародних обмінах, навчалася безкоштовно
                  в Хорватії — і зовсім скоро вирушає на нове навчання у
                  Францію. Official Member of EYP Ukraine 2026.
                </p>
                <p className="text-gray-500 text-sm leading-relaxed mt-2">
                  Організувала івент «Міжнародні можливості для молоді» в КПІ,
                  який зібрав 100+ учасників. Саме тоді зрозуміла: людям
                  потрібна не лекція, а зручний інструмент. Так з&apos;явилось
                  Моживо.
                </p>
              </div>
            </div>

            {/* Founder 2 — Ліля */}
            <div className="flex flex-col sm:flex-row gap-6 p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-32 h-32 rounded-full bg-indigo-50 flex-shrink-0 overflow-hidden ring-2 ring-indigo-100 self-start">
                <FounderImage src="/founders/lilya.jpg" alt="Лілія Нежельська" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 mb-0.5">
                  Лілія Нежельська
                </p>
                <p className="text-sm font-medium text-primary mb-3">
                  Co-founder & Operations
                </p>
                <p className="text-gray-500 text-sm leading-relaxed">
                  19 років, громадська діячка та людина, яка на власному
                  досвіді переконалася, що міжнародні можливості доступні
                  кожному.
                </p>
                <p className="text-gray-500 text-sm leading-relaxed mt-2">
                  Перша українка, яка увійшла до топ-10 світового міжнародного
                  бізнес-конкурсу HCGCC&apos;2024. Працюючи над кейсами для
                  таких компаній, як Disney та OURA, вона переконалася, що
                  подібний досвід є реальним і досяжним для кожного, хто
                  готовий до змін.
                </p>
                <p className="text-gray-500 text-sm leading-relaxed mt-2">
                  Має досвід участі у понад 10+ міжнародних проєктах. Саме тому
                  ціль — допомогти іншим дізнатися про можливості, які ти
                  зможеш використати вже сьогодні.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 4: Quotes ───────────────────────────────────────── */}
      <section style={{ backgroundColor: "#F7F8FF" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
              Що для нас Моживо?
            </h2>
            <p className="text-gray-500 text-base mt-2">Особисто від засновниць</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Аня's quote */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-8 flex flex-col gap-4">
              <span
                className="text-6xl leading-none font-serif text-indigo-200 select-none"
                aria-hidden
              >
                &ldquo;
              </span>
              <p className="text-gray-700 text-base italic leading-relaxed -mt-4">
                Моживо — це те, що я хотіла мати, коли тільки починала шукати
                свою першу можливість. Це майданчик для активної молоді, що
                готова розвиватися та репрезентувати Україну на міжнародному
                рівні.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className="w-2 h-2 rounded-full bg-primary flex-shrink-0"
                  aria-hidden
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Аня Ткаченко
                  </p>
                  <p className="text-xs text-primary">Co-founder & Product</p>
                </div>
              </div>
            </div>

            {/* Ліля's quote */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-8 flex flex-col gap-4">
              <span
                className="text-6xl leading-none font-serif text-indigo-200 select-none"
                aria-hidden
              >
                &ldquo;
              </span>
              <p className="text-gray-700 text-base italic leading-relaxed -mt-4">
                Тому що вчора ти годинами шукав серед десятків каналів те, що
                тобі справді потрібно. А сьогодні «МОЖUВО» знаходить це для
                тебе.
                <br />
                <br />
                Шукай. Заповнюй. Створюй себе.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className="w-2 h-2 rounded-full bg-primary flex-shrink-0"
                  aria-hidden
                />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Лілія Нежельська
                  </p>
                  <p className="text-xs text-primary">Co-founder & Operations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 5: CTA banner ───────────────────────────────────── */}
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
              <div className="text-4xl mb-5">👋</div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
                Хочеш приєднатись до команди?
              </h2>
              <p className="text-white/80 mb-8 max-w-lg mx-auto">
                Ми відкриті до співпраці — пишіть нам
              </p>
              <Link
                href="mailto:hello@mozhyvo.com"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-accent text-foreground font-semibold hover:bg-accent-dark transition-all duration-200 shadow-lg"
              >
                Написати нам →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
