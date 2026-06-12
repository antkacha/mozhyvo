"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useApplications, Application } from "@/hooks/useApplications";

const STATUS_CONFIG: Record<
  Application["status"],
  { label: string; desc: string; color: string; bg: string; border: string; dot: string; step: number }
> = {
  pending:   { label: "На розгляді",    desc: "Ваша заявка надійшла та очікує розгляду організацією",  color: "text-blue-600",  bg: "bg-blue-50",  border: "border-blue-200", dot: "bg-blue-500",  step: 1 },
  reviewing: { label: "Розглядається",  desc: "Організація активно розглядає вашу заявку",              color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200",dot: "bg-amber-400", step: 2 },
  accepted:  { label: "Прийнято",       desc: "Вітаємо! Вашу заявку схвалено",                         color: "text-green-700", bg: "bg-green-50", border: "border-green-200",dot: "bg-green-500", step: 3 },
  rejected:  { label: "Не відібрано",   desc: "На жаль, цього разу організація обрала інших учасників", color: "text-red-500",   bg: "bg-red-50",   border: "border-red-200",  dot: "bg-red-400",   step: 3 },
};

const STEPS = [
  { step: 1, label: "Подано" },
  { step: 2, label: "Розгляд" },
  { step: 3, label: "Рішення" },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" });
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-gray-100 last:border-0">
      <span className="text-xs text-muted flex-shrink-0">{label}</span>
      <span className="text-xs font-semibold text-foreground text-right">{value || "—"}</span>
    </div>
  );
}

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { applications, ready } = useApplications();

  const app = ready ? (applications.find((a) => a.id === id) ?? null) : undefined;

  if (!ready || app === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-lg font-bold text-foreground mb-2">Заявку не знайдено</p>
          <Link href="/cabinet/applications" className="text-sm text-primary hover:underline">
            ← Повернутись до заявок
          </Link>
        </div>
      </div>
    );
  }

  const st = STATUS_CONFIG[app.status];
  const isAccepted = app.status === "accepted";
  const isRejected = app.status === "rejected";

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">

        {/* Back */}
        <Link
          href="/cabinet/applications"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors font-medium mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Мої заявки
        </Link>

        {/* Hero card */}
        <div className={`rounded-2xl border overflow-hidden mb-6 ${
          isAccepted ? "border-green-200" : isRejected ? "border-red-200" : "border-border"
        }`}>
          {/* Accent strip */}
          <div className={`h-1.5 w-full ${isAccepted ? "bg-green-500" : isRejected ? "bg-red-400" : "bg-primary"}`} />

          <div className="bg-white px-6 py-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-1.5">{app.org}</p>
                <h1 className="text-xl font-black text-foreground leading-tight mb-3">{app.opportunityTitle}</h1>
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${st.bg} ${st.color} ${st.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${st.dot}`} />
                    {st.label}
                  </span>
                  <span className="text-xs text-muted">Подано {formatDate(app.submittedAt)}</span>
                  {app.deadline && (
                    <span className="text-xs text-muted">Дедлайн: {formatDate(app.deadline)}</span>
                  )}
                </div>
              </div>

              {app.opportunitySlug && (
                <Link
                  href={`/opportunities/${app.opportunitySlug}`}
                  className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-primary border border-border hover:border-primary/40 px-3 py-2 rounded-xl transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Переглянути програму
                </Link>
              )}
            </div>
          </div>

          {/* Status progress bar */}
          <div className="bg-muted-bg/50 px-6 py-4 border-t border-border/50">
            <div className="flex items-center gap-0">
              {STEPS.map((s, i) => {
                const done = st.step > s.step;
                const current = st.step === s.step;
                return (
                  <div key={s.step} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        done ? "bg-primary text-white" :
                        current ? (isRejected ? "bg-red-400 text-white" : isAccepted ? "bg-green-500 text-white" : "bg-primary text-white") :
                        "bg-white border-2 border-border text-muted"
                      }`}>
                        {done ? (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : s.step}
                      </div>
                      <span className={`text-[11px] font-medium whitespace-nowrap ${current ? st.color : done ? "text-primary" : "text-muted"}`}>
                        {s.label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-2 mb-4 rounded-full ${done || (current && st.step > s.step) ? "bg-primary" : "bg-border"}`} />
                    )}
                  </div>
                );
              })}
            </div>
            <p className={`text-xs mt-2 ${st.color} font-medium`}>{st.desc}</p>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Main content */}
          <div className="lg:col-span-2 flex flex-col gap-5">

            {/* Motivation */}
            {app.motivation && (
              <div className="bg-white rounded-2xl border border-border p-6">
                <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary-light rounded-lg flex items-center justify-center text-sm">✍️</span>
                  Мотиваційний лист
                </h2>
                <div className="border-l-4 border-primary/20 pl-4">
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{app.motivation}</p>
                </div>
              </div>
            )}

            {/* Education */}
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary-light rounded-lg flex items-center justify-center text-sm">🎓</span>
                Освіта
              </h2>
              <div className="flex flex-col">
                <InfoRow label="Заклад" value={app.institution} />
                <InfoRow label="Ступінь" value={app.degree} />
                {app.graduationYear && <InfoRow label="Рік випуску" value={app.graduationYear} />}
              </div>

              {app.languages.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-xs text-muted mb-2">Мови</p>
                  <div className="flex flex-wrap gap-1.5">
                    {app.languages.map((l) => (
                      <span key={l} className="text-xs font-medium bg-primary-light text-primary px-2.5 py-1 rounded-lg">{l}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Documents */}
            {(app.cvUrl || app.portfolioUrl) && (
              <div className="bg-white rounded-2xl border border-border p-6">
                <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary-light rounded-lg flex items-center justify-center text-sm">📎</span>
                  Документи
                </h2>
                <div className="flex flex-col gap-2.5">
                  {app.cvUrl && (
                    <a href={app.cvUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-3 px-4 py-3 bg-muted-bg rounded-xl hover:bg-primary-light hover:text-primary transition-all group">
                      <svg className="w-4 h-4 text-muted group-hover:text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      <span className="text-sm font-medium">Резюме / CV</span>
                      <svg className="w-3.5 h-3.5 ml-auto text-muted group-hover:text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  )}
                  {app.portfolioUrl && (
                    <a href={app.portfolioUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-3 px-4 py-3 bg-muted-bg rounded-xl hover:bg-primary-light hover:text-primary transition-all group">
                      <svg className="w-4 h-4 text-muted group-hover:text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      <span className="text-sm font-medium">Портфоліо</span>
                      <svg className="w-3.5 h-3.5 ml-auto text-muted group-hover:text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Custom answers */}
            {app.customAnswers && Object.keys(app.customAnswers).length > 0 && (
              <div className="bg-white rounded-2xl border border-border p-6">
                <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-6 h-6 bg-primary-light rounded-lg flex items-center justify-center text-sm">❓</span>
                  Відповіді на питання організатора
                </h2>
                <div className="flex flex-col gap-4">
                  {Object.entries(app.customAnswers).map(([question, answer]) => (
                    <div key={question} className="border-b border-border pb-4 last:border-0 last:pb-0">
                      <p className="text-xs font-semibold text-muted mb-1.5">{question}</p>
                      <p className="text-sm text-foreground leading-relaxed">
                        {Array.isArray(answer) ? answer.join(", ") : answer || "—"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-5">

            {/* Personal info */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary-light rounded-lg flex items-center justify-center text-sm">👤</span>
                Особисті дані
              </h2>
              <div className="flex flex-col">
                <InfoRow label="Ім'я" value={`${app.firstName} ${app.lastName}`} />
                <InfoRow label="Email" value={app.email} />
                {app.phone && <InfoRow label="Телефон" value={app.phone} />}
                <InfoRow label="Країна" value={app.country} />
              </div>
            </div>

            {/* What happens next */}
            {!isAccepted && !isRejected && (
              <div className="bg-primary-light rounded-2xl border border-primary/20 p-5">
                <h2 className="text-sm font-bold text-primary mb-2">Що далі?</h2>
                <p className="text-xs text-primary/80 leading-relaxed">
                  Після розгляду заявки організація змінить її статус. Ми надішлемо сповіщення, коли буде рішення.
                </p>
              </div>
            )}

            {isAccepted && (
              <div className="bg-green-50 rounded-2xl border border-green-200 p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🎉</span>
                  <h2 className="text-sm font-bold text-green-700">Вітаємо!</h2>
                </div>
                <p className="text-xs text-green-700/80 leading-relaxed">
                  Вашу заявку прийнято. Очікуйте на зв&apos;язок від організації з подальшими інструкціями.
                </p>
              </div>
            )}

            {isRejected && (
              <div className="bg-muted-bg rounded-2xl border border-border p-5">
                <h2 className="text-sm font-bold text-foreground mb-2">Не засмучуйтесь</h2>
                <p className="text-xs text-muted leading-relaxed">
                  Конкуренція висока, але є ще багато можливостей. Продовжуйте подавати заявки!
                </p>
                <Link
                  href="/opportunities"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  Переглянути інші можливості →
                </Link>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
