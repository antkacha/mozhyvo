import type { Metadata } from "next";
import Link from "next/link";
import FounderImage from "@/components/FounderImage";
import HeroSlider from "@/components/HeroSlider";

export const metadata: Metadata = {
  title: "Про нас — МОЖUВО",
  description:
    "Знайомся з командою МОЖUВО — платформою, що зібрала гранти, стажування та обміни для молоді України в одному місці.",
};

const marqueeItems = ["СТИПЕНДІЇ", "СТАЖУВАННЯ", "ОБМІНИ", "ВОЛОНТЕРСТВО", "ГРАНТИ", "КОНКУРСИ"];

const stats = [
  { num: "100+", label: "джерел", desc: "Агрегуємо можливості з десятків платформ і сайтів" },
  { num: "~5 год", label: "економії на тиждень", desc: "Не треба шукати — можливості знаходять тебе" },
  { num: "100%", label: "верифіковано", desc: "Тільки перевірені організації та програми" },
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
      "Організувала івент «Міжнародні можливості для молоді», який зібрав 100+ учасників. Саме тоді зрозуміла: людям потрібна не лекція, а зручний інструмент. Так з'явилось МОЖUВО.",
    ],
  },
  {
    num: "02",
    name: "Лілія Нежельська",
    role: "Co-founder & Operations",
    photo: "/founders/lilya.jpg",
    bio: [
      "19 років, громадська діячка та людина, яка на власному досвіді переконалася, що міжнародні можливості доступні кожному.",
      "Перша українка, яка увійшла до топ-10 світового міжнародного бізнес-конкурсу HCGCC'2024. Працюючи над кейсами для таких компаній, як Disney та OURA, вона переконалася, що подібний досвід є реальним і досяжним для кожного, хто готовий до змін.",
      "Має досвід участі у понад 10 міжнародних проєктах. Саме тому ціль — допомогти іншим дізнатися про можливості, які ти зможеш використати вже сьогодні.",
    ],
  },
];

const quotes = [
  {
    text: "МОЖUВО — це те, що я хотіла мати, коли тільки починала шукати свою першу можливість. Це майданчик для активної молоді, що готова розвиватися та репрезентувати Україну на міжнародному рівні.",
    name: "Аня Ткаченко",
    role: "Co-founder & Product",
  },
  {
    text: "Вчора ти годинами шукав серед десятків каналів те, що тобі справді потрібно. А сьогодні «МОЖUВО» знаходить це для тебе.\n\nШукай. Заповнюй. Створюй себе.",
    name: "Лілія Нежельська",
    role: "Co-founder & Operations",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* ── Hero — white ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white border-b border-gray-100">
        {/* Soft glow */}
        <div
          aria-hidden
          className="absolute -top-20 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(59,79,232,0.05) 0%, transparent 65%)" }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/25 bg-white text-primary text-xs font-semibold shadow-sm mb-8">
                <span>✦</span>
                Наша історія
              </div>

              <h1 className="text-5xl md:text-6xl font-black text-gray-900 leading-[1.0] mb-6">
                Ми віримо, що кожен{" "}
                <span className="text-primary">українець</span>{" "}
                заслуговує знати про свої можливості
              </h1>

              <p className="text-gray-500 text-lg leading-relaxed max-w-lg mb-10">
                МОЖUВО — це платформа, яка зібрала гранти, стажування, обміни та
                волонтерство в одному місці. Ми зробили це, бо самі шукали ці
                можливості і знаємо, як це складно.
              </p>

              {/* Stats inline */}
              <div className="flex items-stretch gap-8">
                {stats.map((s, i) => (
                  <div key={s.num} className="flex items-stretch gap-8">
                    {i > 0 && <div className="w-px bg-gray-100" />}
                    <div>
                      <p className="text-3xl font-black text-primary leading-none">{s.num}</p>
                      <p className="text-sm text-gray-500 mt-1.5">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: photo gallery */}
            <div className="hidden lg:block">
              <HeroSlider />
            </div>

          </div>
        </div>
      </section>

      {/* ── Marquee ──────────────────────────────────────────────────── */}
      <div className="bg-primary py-4 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap w-max">
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center flex-none">
              {marqueeItems.map((item) => (
                <span key={`${i}-${item}`} className="inline-flex items-center gap-6 text-xs font-bold tracking-[0.2em] text-white/55 px-6">
                  {item}
                  <span className="text-white/30 font-black">·</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Problem section — white ───────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

            {/* Left: bold statement */}
            <div>
              <p className="text-primary/50 text-xs font-bold tracking-widest uppercase mb-6">Проблема</p>
              <p className="text-4xl md:text-5xl font-black text-gray-900 leading-[1.05]">
                Раніше потрібно було моніторити десятки каналів щодня.{" "}
                <span className="text-primary">Більшість просто здавалась.</span>
              </p>
              <p className="text-gray-500 text-lg leading-relaxed mt-6">
                Telegram-канали, Facebook-групи, сайти організацій — інформація була розкидана скрізь. Ми самі через це пройшли і вирішили зробити щось із цим.
              </p>
            </div>

            {/* Right: stats with dividers */}
            <div className="divide-y divide-gray-100">
              {stats.map((s, idx) => (
                <div key={s.num} className="relative flex items-center gap-6 py-7 first:pt-0 last:pb-0">
                  {/* Background number */}
                  <span className="absolute -top-1 right-0 text-[64px] font-black text-gray-50 leading-none select-none">
                    0{idx + 1}
                  </span>
                  <p className="text-4xl font-black text-primary leading-none flex-shrink-0 w-28 whitespace-nowrap">{s.num}</p>
                  <div className="relative z-10">
                    <p className="font-black text-gray-900 text-base">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ── Blue statement strip ──────────────────────────────────────── */}
      <section className="bg-primary py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-2xl md:text-3xl font-black text-white/80 leading-snug">
            ✦ МОЖUВО — це не просто агрегатор. Це{" "}
            <span className="text-white">інструмент,</span>{" "}
            який дає молодим українцям реальний доступ до можливостей світового рівня.
          </p>
        </div>
      </section>

      {/* ── Founders — #F7F8FF ───────────────────────────────────────── */}
      <section style={{ backgroundColor: "#F7F8FF" }} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <h2 className="text-5xl md:text-6xl font-black text-gray-900 leading-[1.0] mb-3">
            Хто{" "}
            <span className="text-primary">ми?</span>
          </h2>
          <p className="text-gray-500 text-lg mb-12">
            Двоє, які вирішили змінити те, що їх самих колись дратувало
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {founders.map((f) => (
              <div key={f.num} className="relative bg-white rounded-3xl p-8 border border-gray-100 shadow-sm overflow-hidden">
                {/* Background number */}
                <span className="absolute -bottom-3 -right-2 text-[90px] font-black text-gray-50 leading-none select-none">
                  {f.num}
                </span>

                {/* Photo + name row */}
                <div className="flex items-center gap-5 mb-6 relative z-10">
                  <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-primary-light">
                    <FounderImage src={f.photo} alt={f.name} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900">{f.name}</h3>
                    <p className="text-sm font-semibold text-primary mt-0.5">{f.role}</p>
                  </div>
                </div>

                {/* Bio */}
                <div className="space-y-3 relative z-10">
                  {f.bio.map((para, i) => (
                    <p key={i} className="text-gray-500 text-sm leading-relaxed flex gap-2">
                      {i === 0 && <span className="text-primary font-black flex-shrink-0 mt-0.5">✦</span>}
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quotes — white ───────────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <h2 className="text-5xl md:text-6xl font-black text-gray-900 leading-[1.0] mb-3">
            Що для нас{" "}
            <span className="text-primary">МОЖUВО?</span>
          </h2>
          <p className="text-gray-500 text-lg mb-12">Особисто від засновниць</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quotes.map((q) => (
              <div
                key={q.name}
                className="relative bg-gray-50 rounded-3xl p-8 border border-gray-100 overflow-hidden hover:-translate-y-1 hover:shadow-md transition-all duration-200"
              >
                {/* Decorative quote */}
                <span
                  className="absolute -top-4 -left-2 text-[120px] leading-none font-serif text-gray-200 select-none pointer-events-none"
                  aria-hidden
                >
                  &ldquo;
                </span>

                <div className="relative z-10">
                  <p className="text-gray-700 text-base leading-relaxed whitespace-pre-line mb-8">
                    {q.text}
                  </p>
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-[3px] bg-primary rounded-full flex-shrink-0" aria-hidden />
                    <div>
                      <p className="text-sm font-black text-gray-900">{q.name}</p>
                      <p className="text-xs text-primary font-semibold">{q.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Support CTA — blue ───────────────────────────────────────── */}
      <section className="bg-primary py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
            <div>
              <p className="text-white/50 text-xs font-bold tracking-widest uppercase mb-5">Підтримка</p>
              <h2 className="text-5xl md:text-6xl font-black text-white leading-[1.0] mb-6">
                На розвиток{" "}
                <span className="relative inline-block">
                  МОЖUВО
                  <span className="absolute -bottom-1 left-0 right-0 h-[4px] bg-white/50 rounded-full" />
                </span>
              </h2>
              <p className="text-white/60 text-lg leading-relaxed max-w-md">
                Ми створили цей проєкт безкоштовно — бо хочемо, щоб кожен молодий
                українець міг знайти свою можливість. Кожна гривня йде на розвиток платформи.
              </p>
            </div>
            <Link
              href="https://send.monobank.ua/jar/2aqfexs7AP"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 px-8 py-4 rounded-2xl bg-white text-primary font-bold text-base hover:bg-primary-light transition-all shadow-xl hover:-translate-y-0.5"
            >
              🔗 Підтримати проєкт →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
