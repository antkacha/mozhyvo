"use client";

import Link from "next/link";
import { useState } from "react";
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

export default function CabinetApplicationsPage() {
  const { applications, ready } = useApplications();
  const [filter, setFilter] = useState<"all" | Application["status"]>("all");

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
            <Link key={app.id} href={`/cabinet/applications/${app.id}`}
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
                <svg className="w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
