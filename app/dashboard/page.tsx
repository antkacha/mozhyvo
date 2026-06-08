"use client";

import { useState } from "react";
import { useApplications, Application } from "@/hooks/useApplications";

// Mock coordinator programs
const MOCK_PROGRAMS = [
  {
    id: "erasmus-plus",
    title: "Erasmus+ Youth Exchange",
    org: "European Commission",
    deadline: "2025-06-30",
    deadlineDisplay: "30 червня 2025",
    country: "🇪🇺 Євросоюз",
    type: "Обмін",
  },
  {
    id: "daad-research",
    title: "DAAD Research Grant",
    org: "DAAD — Akademischer Austauschdienst",
    deadline: "2025-09-15",
    deadlineDisplay: "15 вересня 2025",
    country: "🇩🇪 Німеччина",
    type: "Стипендія",
  },
  {
    id: "hack4good",
    title: "Hack4Good 2025",
    org: "NGO TechForGood",
    deadline: "2025-07-20",
    deadlineDisplay: "20 липня 2025",
    country: "🌍 Онлайн",
    type: "Хакатон",
  },
];

const STATUS_LABELS: Record<Application["status"], string> = {
  pending: "Нова",
  reviewing: "Розглядається",
  accepted: "Прийнята",
  rejected: "Відхилена",
};

const STATUS_STYLES: Record<Application["status"], string> = {
  pending: "bg-yellow-100 text-yellow-700",
  reviewing: "bg-blue-100 text-blue-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
};

type Tab = "programs" | "applications" | "archive";

export default function DashboardPage() {
  const { applications } = useApplications();
  const [tab, setTab] = useState<Tab>("programs");
  const [filterStatus, setFilterStatus] = useState<Application["status"] | "all">("all");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [filterProgram, setFilterProgram] = useState<string>("all");

  const activeApplications = applications.filter(
    (a) => a.status !== "rejected"
  );
  const archivedApplications = applications.filter(
    (a) => a.status === "rejected"
  );

  const filteredApps = (tab === "archive" ? archivedApplications : activeApplications).filter((a) => {
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    if (filterProgram !== "all" && a.opportunitySlug !== filterProgram) return false;
    return true;
  });

  const programsWithCounts = MOCK_PROGRAMS.map((p) => ({
    ...p,
    count: applications.filter((a) => a.opportunitySlug === p.id).length,
  }));

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "programs", label: "Мої програми", count: MOCK_PROGRAMS.length },
    { id: "applications", label: "Заявки", count: activeApplications.length },
    { id: "archive", label: "Архів", count: archivedApplications.length },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground mb-1">
            Панель координатора
          </h1>
          <p className="text-sm text-muted">
            Керуй програмами та заявками учасників
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Додати програму
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Програм", value: MOCK_PROGRAMS.length },
          { label: "Всього заявок", value: applications.length },
          { label: "На розгляді", value: applications.filter((a) => a.status === "pending" || a.status === "reviewing").length },
          { label: "Прийнятих", value: applications.filter((a) => a.status === "accepted").length },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-border p-5 text-center shadow-sm">
            <p className="text-3xl font-extrabold text-primary">{s.value}</p>
            <p className="text-xs text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted-bg p-1.5 rounded-2xl w-fit mb-8">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === t.id
                ? "bg-white text-foreground shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${tab === t.id ? "bg-primary text-white" : "bg-border text-muted"}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Programs tab */}
      {tab === "programs" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {programsWithCounts.map((prog) => (
            <div
              key={prog.id}
              className="bg-white rounded-2xl border border-border p-6 shadow-sm flex flex-col gap-4 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-xs font-semibold text-primary bg-primary-light px-2.5 py-1 rounded-full">
                    {prog.type}
                  </span>
                </div>
                <button className="text-muted hover:text-foreground transition-colors p-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">{prog.org}</p>
                <p className="font-bold text-foreground text-sm leading-snug">{prog.title}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-muted">
                <span>{prog.country}</span>
                <span>до {prog.deadlineDisplay}</span>
              </div>
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="font-bold text-foreground">{prog.count}</span>
                  <span className="text-muted">заявок</span>
                </div>
                <button
                  onClick={() => {
                    setFilterProgram(prog.id);
                    setTab("applications");
                  }}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Переглянути →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Applications / Archive tabs */}
      {(tab === "applications" || tab === "archive") && (
        <div className="flex flex-col gap-5">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as Application["status"] | "all")}
              className="text-sm border border-border rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            >
              <option value="all">Усі статуси</option>
              <option value="pending">Нові</option>
              <option value="reviewing">Розглядаються</option>
              <option value="accepted">Прийняті</option>
              <option value="rejected">Відхилені</option>
            </select>
            <select
              value={filterProgram}
              onChange={(e) => setFilterProgram(e.target.value)}
              className="text-sm border border-border rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            >
              <option value="all">Усі програми</option>
              {MOCK_PROGRAMS.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
            {(filterStatus !== "all" || filterProgram !== "all") && (
              <button
                onClick={() => { setFilterStatus("all"); setFilterProgram("all"); }}
                className="text-xs text-muted hover:text-primary transition-colors font-medium"
              >
                Скинути фільтри ×
              </button>
            )}
          </div>

          {filteredApps.length === 0 ? (
            <div className="text-center py-16 text-muted">
              <div className="text-4xl mb-3">📭</div>
              <p className="font-semibold text-foreground mb-1">Заявок ще немає</p>
              <p className="text-sm">Тут з&apos;являться заявки учасників після подачі</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredApps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className="text-left bg-white rounded-2xl border border-border p-5 hover:shadow-md hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <p className="font-semibold text-foreground text-sm">
                          {app.firstName} {app.lastName}
                        </p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[app.status]}`}>
                          {STATUS_LABELS[app.status]}
                        </span>
                      </div>
                      <p className="text-xs text-muted truncate mb-1">{app.email}</p>
                      <p className="text-xs text-muted">{app.opportunityTitle}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-muted">
                        {new Date(app.submittedAt).toLocaleDateString("uk-UA", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                      <p className="text-xs text-muted mt-1">{app.country}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Application detail modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedApp(null)}>
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <div>
                <p className="font-bold text-foreground">{selectedApp.firstName} {selectedApp.lastName}</p>
                <p className="text-xs text-muted">{selectedApp.opportunityTitle}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[selectedApp.status]}`}>
                  {STATUS_LABELS[selectedApp.status]}
                </span>
                <button onClick={() => setSelectedApp(null)} className="text-muted hover:text-foreground transition-colors p-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 flex flex-col gap-5">
              {/* Contact */}
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Контакти</p>
                <div className="grid grid-cols-2 gap-y-1.5 text-sm">
                  <span className="text-muted">Email</span><span className="text-foreground font-medium">{selectedApp.email}</span>
                  <span className="text-muted">Телефон</span><span className="text-foreground font-medium">{selectedApp.phone || "—"}</span>
                  <span className="text-muted">Країна</span><span className="text-foreground font-medium">{selectedApp.country}</span>
                </div>
              </div>
              {/* Education */}
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Освіта</p>
                <div className="grid grid-cols-2 gap-y-1.5 text-sm">
                  <span className="text-muted">Заклад</span><span className="text-foreground font-medium">{selectedApp.institution}</span>
                  <span className="text-muted">Ступінь</span><span className="text-foreground font-medium">{selectedApp.degree}</span>
                  <span className="text-muted">Мови</span><span className="text-foreground font-medium">{selectedApp.languages.join(", ")}</span>
                </div>
              </div>
              {/* Motivation */}
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Мотиваційний лист</p>
                <p className="text-sm text-foreground leading-relaxed bg-muted-bg rounded-xl p-4">{selectedApp.motivation}</p>
              </div>
              {/* Links */}
              {(selectedApp.cvUrl || selectedApp.portfolioUrl) && (
                <div className="flex gap-3">
                  {selectedApp.cvUrl && (
                    <a href={selectedApp.cvUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/20 bg-primary-light px-3 py-2 rounded-xl hover:bg-primary/10 transition-all">
                      📄 CV
                    </a>
                  )}
                  {selectedApp.portfolioUrl && (
                    <a href={selectedApp.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/20 bg-primary-light px-3 py-2 rounded-xl hover:bg-primary/10 transition-all">
                      🔗 Портфоліо
                    </a>
                  )}
                </div>
              )}
              {/* Submitted */}
              <p className="text-xs text-muted border-t border-border pt-3">
                Подано: {new Date(selectedApp.submittedAt).toLocaleString("uk-UA")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
