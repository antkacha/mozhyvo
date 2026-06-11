"use client";

import { useState } from "react";
import Link from "next/link";
import type { Opportunity } from "@/lib/data";
import { typeColors, fundingLabels, formatLabels } from "@/lib/data";
import { useSaved } from "@/hooks/useSaved";
import { getDaysUntilDeadline } from "@/lib/recommendations";
import { orgNameToSlug } from "@/lib/organizations";

const TABS = ["Опис", "Вимоги", "Як подати", "FAQ"] as const;
type Tab = (typeof TABS)[number];

interface Props {
  opp: Opportunity;
  related: Opportunity[];
}

function DeadlineCountdown({ deadline }: { deadline: string }) {
  const days = getDaysUntilDeadline(deadline);
  if (days < 0) return <span className="text-sm font-semibold text-muted">Завершено</span>;
  const urgent = days <= 7;
  const soon   = days <= 14;
  return (
    <div className={`rounded-xl px-4 py-3 text-center ${urgent ? "bg-red-50" : soon ? "bg-amber-50" : "bg-primary-light"}`}>
      <p className={`text-3xl font-black ${urgent ? "text-red-600" : soon ? "text-amber-600" : "text-primary"}`}>
        {days}
      </p>
      <p className={`text-xs font-semibold mt-0.5 ${urgent ? "text-red-500" : soon ? "text-amber-500" : "text-primary/70"}`}>
        {days === 1 ? "день залишився" : days < 5 ? "дні залишилось" : "днів залишилось"}
      </p>
      {urgent && <p className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-wider">⏰ Дедлайн спливає!</p>}
    </div>
  );
}

function ShareButton({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  async function handleShare() {
    if (navigator.share) {
      await navigator.share({ title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }
  return (
    <button
      onClick={handleShare}
      className="flex items-center justify-center gap-2 w-full py-2.5 px-4 border border-border rounded-xl text-sm font-medium text-foreground hover:border-primary hover:text-primary transition-all"
    >
      {copied ? (
        <>
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
          Скопійовано!
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
          Поділитися
        </>
      )}
    </button>
  );
}

export default function OpportunityClient({ opp, related }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("Опис");
  const { isSaved, toggle, ready: savedReady } = useSaved();

  const isExternal = opp.applyUrl.startsWith("http");
  const saved = isSaved(opp.slug);
  const days = getDaysUntilDeadline(opp.deadline);
  const expired = days < 0;
  const orgSlug = opp.orgSlug ?? orgNameToSlug[opp.org];

  const borderColor: Record<string, string> = {
    scholarship: "border-l-primary", internship: "border-l-blue-500",
    exchange: "border-l-green-500", volunteering: "border-l-teal-500",
    competition: "border-l-orange-500", grant: "border-l-yellow-400",
    conference: "border-l-pink-500", hackathon: "border-l-red-500",
  };

  return (
    <>
      {/* Tabs + content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Left: tabs */}
          <div className="lg:col-span-2">
            {/* Tab bar */}
            <div className="flex border-b border-border mb-8 gap-0">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all -mb-px ${
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-muted hover:text-foreground hover:border-border"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab: Опис */}
            {activeTab === "Опис" && (
              <div className="flex flex-col gap-10">
                {/* Tags */}
                {opp.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {opp.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-muted-bg text-muted px-2.5 py-1 rounded-full">#{tag}</span>
                    ))}
                  </div>
                )}
                {/* Description */}
                <section>
                  <h2 className="text-xl font-bold text-foreground mb-4">Про програму</h2>
                  <div className={`border-l-4 pl-5 ${borderColor[opp.type] ?? "border-l-primary"}`}>
                    <div className="text-base text-gray-600 leading-relaxed whitespace-pre-line break-words">
                      {opp.fullDescription}
                    </div>
                  </div>
                </section>
                {/* Benefits */}
                {opp.benefits.length > 0 && (
                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">Що включає</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {opp.benefits.map((b, i) => (
                        <div key={i} className="flex items-start gap-3 bg-primary-light rounded-xl p-4">
                          <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-black mt-0.5">✓</span>
                          <span className="text-sm text-gray-700 leading-relaxed">{b}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* Tab: Вимоги */}
            {activeTab === "Вимоги" && (
              <div className="flex flex-col gap-8">
                <section>
                  <h2 className="text-xl font-bold text-foreground mb-5">Вимоги до учасників</h2>
                  <ul className="flex flex-col gap-3">
                    {opp.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <span className="mt-0.5 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-black shadow-sm shadow-primary/25">{i + 1}</span>
                        <span className="text-gray-600 leading-relaxed pt-0.5">{req}</span>
                      </li>
                    ))}
                  </ul>
                </section>
                {/* Languages */}
                {opp.languages.length > 0 && (
                  <section>
                    <h2 className="text-xl font-bold text-foreground mb-4">Мова програми</h2>
                    <div className="flex flex-wrap gap-2">
                      {opp.languages.map((lang) => (
                        <span key={lang} className="px-4 py-2 bg-primary-light text-primary text-sm font-semibold rounded-full">{lang}</span>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* Tab: Як подати */}
            {activeTab === "Як подати" && (
              <div className="flex flex-col gap-6">
                <h2 className="text-xl font-bold text-foreground">Як подати заявку</h2>
                <div className="flex flex-col gap-4">
                  {[
                    { step: 1, title: "Зареєструйтесь або увійдіть",   desc: "Створіть акаунт на Моживо або увійдіть у свій акаунт. Це займе менше хвилини." },
                    { step: 2, title: "Заповніть профіль",              desc: "Повний профіль збільшує шанси на прийняття. Додайте освіту, мови та мотивацію." },
                    { step: 3, title: "Натисніть «Подати заявку»",       desc: "Форма заявки автоматично підтягне ваші дані з профілю." },
                    { step: 4, title: "Напишіть мотиваційний лист",     desc: "Розкажіть чому ви хочете взяти участь. Мінімум 300 символів, не більше 2000." },
                    { step: 5, title: "Підтвердіть і надішліть",        desc: "Перевірте дані та натисніть «Надіслати заявку». Ви отримаєте email з підтвердженням." },
                  ].map(({ step, title, desc }) => (
                    <div key={step} className="flex gap-5 items-start">
                      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-sm font-black shadow-sm shadow-primary/25">{step}</div>
                      <div className="pt-1">
                        <p className="font-bold text-foreground text-sm mb-1">{title}</p>
                        <p className="text-sm text-muted leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {!expired && (
                  <div className="mt-4 pt-6 border-t border-border">
                    {isExternal ? (
                      <a
                        href={opp.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-8 py-3.5 bg-primary text-white font-bold rounded-full hover:bg-primary-dark transition-all shadow-md shadow-primary/20 text-sm"
                      >
                        Подати заявку →
                      </a>
                    ) : (
                      <Link
                        href={`/opportunities/${opp.slug}/apply`}
                        className="inline-block px-8 py-3.5 bg-primary text-white font-bold rounded-full hover:bg-primary-dark transition-all shadow-md shadow-primary/20 text-sm"
                      >
                        Почати заявку →
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Tab: FAQ */}
            {activeTab === "FAQ" && (
              <div className="flex flex-col gap-4">
                <h2 className="text-xl font-bold text-foreground mb-2">Часті запитання</h2>
                {[
                  {
                    q: "Чи можна подати заявку, якщо я ще навчаюсь?",
                    a: "Так, більшість програм приймають заявки від студентів. Перевірте вимоги у вкладці «Вимоги» — там вказано, які ступені освіти підходять.",
                  },
                  {
                    q: "Коли я отримаю відповідь на заявку?",
                    a: "Терміни розгляду залежать від організації. Зазвичай рішення приймається протягом 2–8 тижнів після дедлайну. Ви отримаєте email сповіщення.",
                  },
                  {
                    q: "Чи можна редагувати заявку після подачі?",
                    a: "Після подачі заявку редагувати неможливо. Якщо у вас є питання — зв'яжіться напряму з організацією.",
                  },
                  {
                    q: "Які документи потрібні?",
                    a: "Зазвичай потрібне резюме/CV і, за потреби, додаткові матеріали. Завантажте їх на Google Drive або Dropbox і вставте посилання у форму.",
                  },
                  {
                    q: "Чи коштує подача заявки?",
                    a: "Подача заявки через Моживо безкоштовна. Деякі програми можуть мати власні вступні внески — про це буде вказано на сайті організатора.",
                  },
                ].map(({ q, a }, i) => (
                  <FAQItem key={i} question={q} answer={a} />
                ))}
              </div>
            )}
          </div>

          {/* Right: sticky sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 flex flex-col gap-4">

              {/* Deadline countdown + apply card */}
              <div className="rounded-2xl overflow-hidden border border-border shadow-sm">
                <div className={`px-6 py-5 ${days <= 7 && !expired ? "bg-red-600" : expired ? "bg-muted-bg" : "bg-primary"}`}>
                  <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${expired ? "text-muted" : "text-white/70"}`}>
                    Дедлайн подачі
                  </p>
                  <p className={`text-2xl font-black leading-tight ${expired ? "text-muted" : "text-white"}`}>
                    {opp.deadlineDisplay}
                  </p>
                  {expired && <p className="text-sm text-muted mt-1">Прийом заявок завершено</p>}
                </div>

                {!expired && (
                  <div className="bg-white px-5 py-4">
                    <DeadlineCountdown deadline={opp.deadline} />
                  </div>
                )}

                <div className="bg-white px-5 pb-5 flex flex-col gap-3">
                  {expired ? (
                    <div className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-muted-bg text-muted font-semibold rounded-xl text-sm border border-border">
                      Прийом завершено
                    </div>
                  ) : isExternal ? (
                    <a
                      href={opp.applyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center py-3 px-6 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all shadow-sm shadow-primary/20 text-sm"
                    >
                      Заповнити форму →
                    </a>
                  ) : (
                    <Link
                      href={`/opportunities/${opp.slug}/apply`}
                      className="block w-full text-center py-3 px-6 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all shadow-sm shadow-primary/20 text-sm"
                    >
                      Подати заявку →
                    </Link>
                  )}
                  <button
                    onClick={() => toggle(opp.slug)}
                    disabled={!savedReady}
                    className={`flex items-center justify-center gap-2 w-full py-2.5 px-6 border rounded-xl font-medium text-sm transition-all ${
                      saved ? "border-primary bg-primary-light text-primary" : "border-border text-foreground hover:border-primary hover:text-primary"
                    } disabled:opacity-50`}
                  >
                    <svg className="w-4 h-4 flex-shrink-0" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {saved ? "Збережено" : "Зберегти"}
                  </button>
                  <ShareButton title={opp.title} url={typeof window !== "undefined" ? window.location.href : ""} />
                </div>
              </div>

              {/* Details card */}
              <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
                <p className="text-sm font-bold text-foreground mb-4">Деталі програми</p>
                <div className="flex flex-col gap-0">
                  {/* Org row — clickable if slug exists */}
                  {opp.org && (
                    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-gray-100">
                      <span className="text-xs text-muted flex-shrink-0">Організатор</span>
                      {orgSlug ? (
                        <Link
                          href={`/organizations/${orgSlug}`}
                          className="text-xs font-semibold text-primary hover:underline text-right"
                        >
                          {opp.org}
                        </Link>
                      ) : (
                        <span className="text-xs font-semibold text-gray-800 text-right">{opp.org}</span>
                      )}
                    </div>
                  )}
                  {([
                    { label: "Тип",         value: opp.typeName },
                    { label: "Формат",      value: formatLabels[opp.format] },
                    { label: "Місце",       value: `${opp.flag} ${opp.location}` },
                    { label: "Фінансування",value: fundingLabels[opp.funding] },
                    opp.fundingDetails ? { label: "Розмір", value: opp.fundingDetails } : null,
                    opp.duration ? { label: "Тривалість", value: opp.duration } : null,
                    opp.languages.length > 0 ? { label: "Мова", value: opp.languages.join(", ") } : null,
                    (opp.ageMin || opp.ageMax) ? { label: "Вік", value: opp.ageMin && opp.ageMax ? `${opp.ageMin}–${opp.ageMax} р.` : opp.ageMax ? `до ${opp.ageMax} р.` : `від ${opp.ageMin} р.` } : null,
                  ] as ({ label: string; value: string } | null)[])
                    .filter(Boolean)
                    .map((row) => (
                      <div key={row!.label} className="flex items-start justify-between gap-3 py-2.5 border-b border-gray-100 last:border-0">
                        <span className="text-xs text-muted flex-shrink-0">{row!.label}</span>
                        <span className="text-xs font-semibold text-gray-800 text-right">{row!.value}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Related opportunities */}
        {related.length > 0 && (
          <div className="mt-16 pt-10 border-t border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-foreground">Схожі можливості</h2>
              <Link href="/opportunities" className="text-sm font-semibold text-primary hover:underline">Всі можливості →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {related.map((r) => (
                <Link key={r.slug} href={`/opportunities/${r.slug}`}
                  className="group bg-white rounded-2xl border border-border border-t-4 border-t-primary p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeColors[r.type]}`}>{r.typeName}</span>
                    {r.funding === "fully-funded" && (
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-50 text-green-700">Повне</span>
                    )}
                  </div>
                  <div>
                    {(() => { const s = orgNameToSlug[r.org]; return s ? (
                      <Link href={`/organizations/${s}`} onClick={(e) => e.stopPropagation()}
                        className="text-xs font-semibold text-muted mb-1 uppercase tracking-wide hover:text-primary transition-colors block">
                        {r.org}
                      </Link>
                    ) : (
                      <p className="text-xs font-semibold text-muted mb-1 uppercase tracking-wide">{r.org}</p>
                    ); })()}
                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">{r.title}</p>
                  </div>
                  <p className="text-xs text-muted mt-auto">{r.flag} {r.location} · {r.deadlineDisplay}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

    </>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-muted-bg/50 transition-colors"
      >
        <span className="text-sm font-semibold text-foreground">{question}</span>
        <svg className={`w-4 h-4 text-muted flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-muted leading-relaxed border-t border-border/50 pt-3">
          {answer}
        </div>
      )}
    </div>
  );
}
