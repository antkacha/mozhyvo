"use client";

import { useState } from "react";
import Link from "next/link";
import { useApplications } from "@/hooks/useApplications";
import StatusBadge from "@/components/StatusBadge";
import type { Application } from "@/hooks/useApplications";

const STATUS_FILTERS = [
  { value: "all",       label: "Усі" },
  { value: "pending",   label: "Очікує" },
  { value: "reviewing", label: "Розглядається" },
  { value: "accepted",  label: "Прийнято" },
  { value: "rejected",  label: "Відхилено" },
] as const;

function AppDetailModal({ app, onClose }: { app: Application; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-xl sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <div>
            <p className="text-xs text-muted">{app.org}</p>
            <h2 className="text-base font-bold text-foreground line-clamp-1">{app.opportunityTitle}</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted-bg text-muted">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="px-6 py-6 space-y-5">
          <div className="flex items-center justify-between">
            <StatusBadge status={app.status} />
            <p className="text-xs text-muted">Подано: {new Date(app.submittedAt).toLocaleDateString("uk-UA")}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { label: "Ім'я", value: `${app.firstName} ${app.lastName}` },
              { label: "Email",  value: app.email },
              { label: "Країна", value: app.country },
              { label: "Заклад", value: app.institution },
              { label: "Ступінь",value: app.degree },
              { label: "Мови",   value: app.languages.join(", ") || "—" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-muted-bg rounded-xl px-4 py-3">
                <p className="text-[11px] text-muted mb-0.5">{label}</p>
                <p className="font-semibold text-foreground text-sm">{value || "—"}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Мотиваційний лист</p>
            <div className="bg-muted-bg rounded-2xl p-4 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
              {app.motivation || "—"}
            </div>
          </div>
          {(app.cvUrl || app.portfolioUrl) && (
            <div className="flex flex-col gap-2">
              {app.cvUrl && (
                <a href={app.cvUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  Резюме / CV
                </a>
              )}
              {app.portfolioUrl && (
                <a href={app.portfolioUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 text-sm font-medium text-primary hover:underline">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                  Портфоліо
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CabinetApplicationsPage() {
  const { applications, ready } = useApplications();
  const [filter, setFilter] = useState<"all" | Application["status"]>("all");
  const [selected, setSelected] = useState<Application | null>(null);

  const filtered = filter === "all" ? applications : applications.filter((a) => a.status === filter);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground">Мої заявки</h1>
          <p className="text-sm text-muted mt-0.5">{ready ? `${applications.length} заявок усього` : "Завантаження..."}</p>
        </div>
        <Link href="/opportunities"
          className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-dark transition-all">
          + Нова заявка
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-muted-bg rounded-2xl p-1 mb-6 flex-wrap">
        {STATUS_FILTERS.map(({ value, label }) => {
          const count = value === "all" ? applications.length : applications.filter((a) => a.status === value).length;
          return (
            <button key={value} onClick={() => setFilter(value as typeof filter)}
              className={`flex-1 min-w-fit px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                filter === value ? "bg-white text-foreground shadow-sm" : "text-muted hover:text-foreground"
              }`}>
              {label} {count > 0 && <span className={`ml-1 ${filter === value ? "text-primary" : "text-muted"}`}>({count})</span>}
            </button>
          );
        })}
      </div>

      {/* List */}
      {!ready ? (
        <div className="space-y-3">
          {Array.from({length: 5}).map((_, i) => (
            <div key={i} className="h-20 bg-muted-bg rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-border rounded-2xl">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm font-semibold text-foreground mb-1">Заявок немає</p>
          <p className="text-xs text-muted mb-5">{filter !== "all" ? "Спробуй змінити фільтр" : "Подай першу заявку!"}</p>
          <Link href="/opportunities" className="text-xs font-semibold text-primary hover:underline">Переглянути можливості →</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((app) => (
            <button key={app.id} onClick={() => setSelected(app)}
              className="w-full bg-white border border-border rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-primary/30 hover:shadow-sm transition-all text-left group">
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">{app.opportunityTitle}</p>
                <p className="text-xs text-muted mt-0.5">
                  {app.org} · Дедлайн:{" "}
                  {app.deadline ? new Date(app.deadline).toLocaleDateString("uk-UA", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <StatusBadge status={app.status} size="sm" />
                <span className="text-xs text-muted hidden sm:block">{new Date(app.submittedAt).toLocaleDateString("uk-UA")}</span>
                <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected && <AppDetailModal app={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
