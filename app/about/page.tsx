import type { Metadata } from "next";
import Link from "next/link";
import FounderImage from "@/components/FounderImage";
import HeroSlider from "@/components/HeroSlider";

export const metadata: Metadata = {
  title: "Про нас — Моживо",
  description:
    "Знайомся з командою Моживо — платформою, що зібрала гранти, стажування та обміни для молоді України в одному місці.",
};

const stats = [
  {
    icon: "📡",
    num: "100+",
    title: "Сотні джерел",
    desc: "Ми агрегуємо можливості з десятків платформ",
  },
  {
    icon: "⏱️",
    num: "~5 год",
    title: "Економія часу",
    desc: "Не треба шукати — можливості самі знаходять тебе",
  },
  {
    icon: "🔒",
    num: "100%",
    title: "Тільки перевірене",
    desc: "Жодних сумнівних програм — тільки верифіковані організації",
  },
];

const founders = [
  {
    num: "01",
    name: "Аня Ткаченко",
    role: "Co-founder & Product",
    photo: "/founders/anya.jpg",
    bio: [
      "20 років, студентка-айтішниця та просто людина, яка дуже любить можливості.",
      "Брала участь у 9 міжнародних обмінах, навчалася безкоштовно в Хорватії — і зовсім скоро вирушає на нове навчання у Францію. Official Member of EYP Ukraine 2026.",
      "Організувала івент «Міжнародні можливості для молоді», який зібрав 100+ учасників. Саме тоді зрозуміла: людям потрібна не лекція, а зручний інструмент. Так з’явилось Моживо.",
    ],
  },
  {
    num: "02",
    name: "Лілія Нежельська",
    role: "Co-founder & Operations",
    photo: "/founders/lilya.jpg",
    bio: [
      "19 років, громадська діячка та людина, яка на власному досвіді переконалася, що міжнародні можливості доступні кожному.",
      "Перша українка, яка увійшла до топ-10 світового міжнародного бізнес-конкурсу HCGCC’2024. Працюючи над кейсами для таких компаній, як Disney та OURA, вона переконалася, що подібний досвід є реальним і досяжним для кожного, хто готовий до змін.",
      "Має досвід участі у понад 10+ міжнародних проєктах. Саме тому ціль — допомогти іншим дізнатися про можливості, які ти зможеш використати вже сьогодні.",
    ],
  },
];

const quotes = [
  {
    text: "Моживо — це те, що я хотіла мати, коли тільки починала шукати свою першу можливість. Це майданчик для активної молоді, що готова розвиватися та репрезентувати Україну на міжнародному рівні.",
    name: "Аня Ткаченко",
    role: "Co-founder & Product",
  },
  {
    text: "Тому що вчора ти годинами шукав серед десятків каналів те, що тобі справді потрібно. А сьогодні «Моживо» знаходить це для тебе.\n\nШукай. Заповнюй. Створюй себе.",
    name: "Лілія Нежельська",
    role: "Co-founder & Operations",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* ── Section 1: Hero ─────────────────────────────────────────── */}
      <section className="bg-white min-h-[70vh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full">
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-16">

            {/* Left: text */}
            <div className="md:w-1/2 flex flex-col gap-6">
              <div className="inline-flex items-center gap-2 self-start px-4 py-1.5 rounded-full border border-primary/25 bg-white text-primary text-xs font-semibold shadow-sm">
                <span>✦</span>
                Наша історія
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-[1.1]">
                Ми віримо, що кожен українець заслуговує знати про свої можливості
              </h1>

              <p className="text-gray-500 text-lg leading-relaxed">
                Моживо — це платформа, яка зібрала гранти, стажування, обміни та
                волонтерство в одному місці. Ми зробили це, бо самі шукали ці
                можливості і знаємо, як це складно.
              </p>
            </div>

            {/* Right: auto-sliding photo gallery (desktop only) */}
            <div className="hidden md:block md:w-1/2">
              <HeroSlider />
            </div>

          </div>
        </div>
      </section>

      {/* ── Section 2: Problem we solve ─────────────────────────────── */}
      <section style={{ backgroundColor: "#F7F8FF" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: bold statement */}
            <div>
              <p className="text-2xl md:text-3xl font-black text-gray-900 leading-snug">
                Раніше потрібно було моніторити десятки Telegram-каналів,
                Facebook-груп і сайтів щодня.{" "}
                <span className="text-primary">Більшість просто здавалась.</span>
              </p>
            </div>

            {/* Right: stat rows */}
            <div className="divide-y divide-gray-200">
              {stats.map((s) => (
                <div key={s.title} className="flex items-center gap-4 py-6 first:pt-0 last:pb-0">
                  <span className="text-2xl flex-shrink-0">{s.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900">{s.title}</p>
                    <p className="text-gray-500 text-sm mt-0.5">{s.desc}</p>
                  </div>
                  <p className="text-2xl font-black text-primary flex-shrink-0 ml-4">{s.num}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── Section 3: Founders ─────────────────────────────────────── */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-[1.05]">
              Хто ми?
            </h2>
            <p className="text-gray-500 text-base mt-3">
              Двоє, які вирішили змінити те, що їх самих колись дратувало
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {founders.map((f) => (
              <div key={f.num} className="flex flex-col sm:flex-row gap-6 p-6 rounded-2xl border border-gray-100 shadow-sm">

                {/* Photo */}
                <div className="w-32 h-32 rounded-3xl overflow-hidden flex-shrink-0 bg-indigo-50 self-start">
                  <FounderImage src={f.photo} alt={f.name} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono font-bold text-gray-300">{f.num}</span>
                    <h3 className="text-xl font-bold text-gray-900">{f.name}</h3>
                  </div>
                  <p className="text-sm font-semibold text-primary mb-3">{f.role}</p>
                  <div className="space-y-2">
                    {f.bio.map((para, i) => (
                      <p key={i} className="text-gray-500 text-sm leading-relaxed">{para}</p>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4: Quotes ───────────────────────────────────────── */}
      <section style={{ backgroundColor: "#F7F8FF" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="mb-12">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-[1.05]">
              Що для нас Моживо?
            </h2>
            <p className="text-gray-500 text-base mt-3">Особисто від засновниць</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quotes.map((q) => (
              <div
                key={q.name}
                className="bg-white rounded-3xl p-8 relative overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200"
              >
                {/* Decorative large quote mark */}
                <span
                  className="absolute -top-4 left-4 text-[110px] leading-none font-serif text-indigo-100 select-none pointer-events-none"
                  aria-hidden
                >
                  &ldquo;
                </span>

                <div className="relative">
                  <p className="text-gray-700 text-base italic leading-relaxed mt-4 whitespace-pre-line">
                    {q.text}
                  </p>
                  <div className="flex items-center gap-2 mt-6">
                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" aria-hidden />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{q.name}</p>
                      <p className="text-xs text-primary">{q.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 5: Support banner ───────────────────────────────── */}
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
              <div className="text-4xl mb-5">🩵</div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
                На розвиток Моживо
              </h2>
              <p className="text-white/80 mb-8 max-w-xl mx-auto leading-relaxed">
                Ми створили цей проєкт безкоштовно — бо хочемо, щоб кожен
                молодий українець та українка могли знайти свою можливість і
                розвиватися. Якщо ти хочеш підтримати нас — будемо щиро
                вдячні. Кожна гривня йде на розвиток платформи.
              </p>
              <Link
                href="https://send.monobank.ua/jar/2aqfexs7AP"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-accent text-foreground font-semibold hover:bg-accent-dark transition-all duration-200 shadow-lg"
              >
                🔗 Підтримати проєкт →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
