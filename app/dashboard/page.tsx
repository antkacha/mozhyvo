"use client";

import Link from "next/link";
import { useState } from "react";
import { useOrgSession } from "@/hooks/useOrgSession";
import { useOrgProjects } from "@/hooks/useOrgProjects";
import { useOrgApplications, OrgApplication } from "@/hooks/useOrgApplications";
import { useApplications, Application } from "@/hooks/useApplications";
import OrgShell from "@/components/OrgShell";

// ── Status config ────────────────────────────────────────────────────
const APP_STATUS_LABEL: Record<OrgApplication["status"], string> = {
  new: "Нова",
  reviewing: "Розглядається",
  selected: "Відібрано",
  rejected: "Відхилено",
};
const APP_STATUS_CLASS: Record<OrgApplication["status"], string> = {
  new: "bg-blue-50 text-blue-600",
  reviewing: "bg-amber-50 text-amber-600",
  selected: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-600",
};

// ── Org Overview ─────────────────────────────────────────────────────
function OrgOverview() {
  const { org } = useOrgSession();
  const { projects } = useOrgProjects(org?.id);
  const { applications } = useOrgApplications(org?.id);

  const published = projects.filter((p) => p.status === "published");
  const drafts = projects.filter((p) => p.status === "draft");
  const newApps = applications.filter((a) => a.status === "new");
  const selected = applications.filter((a) => a.status === "selected");
  const recent = [...applications]
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))
    .slice(0, 6);

  const stats = [
    {
      value: published.length,
      label: "Активних проектів",
      sub: `${drafts.length} чернеток`,
      accent: false,
    },
    {
      value: applications.length,
      label: "Всього заявок",
      sub: "за всі проекти",
      accent: false,
    },
    {
      value: newApps.length,
      label: "Нових заявок",
      sub: "потребують перегляду",
      accent: newApps.length > 0,
    },
    {
      value: selected.length,
      label: "Відібрано",
      sub: `з ${applications.length} заявок`,
      accent: false,
    },
  ];

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Доброго ранку" : hour < 17 ? "Доброго дня" : "Доброго вечора";

  return (
    <div className="page-transition">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <p className="text-sm text-muted mb-1">{greeting}</p>
          <h1 className="text-2xl font-black text-foreground">{org?.name}</h1>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm shadow-primary/20 flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Новий проект
        </Link>
      </div>

      {/* Verification banner */}
      {org?.status === "pending" && (
        <div className="flex items-start gap-3.5 p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-8">
          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-800">Профіль проходить верифікацію</p>
            <p className="text-xs text-amber-600 mt-0.5 leading-relaxed">
              Ми перевіряємо вашу організацію — зазвичай це займає 1–3 робочих дні. Ви вже можете створювати проекти.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`bg-white rounded-2xl border p-5 transition-all ${
              s.accent ? "border-primary/30 shadow-sm shadow-primary/10" : "border-border"
            }`}
          >
            <p className={`text-3xl font-black leading-none mb-2 ${s.accent ? "text-primary" : "text-foreground"}`}>
              {s.value}
            </p>
            <p className="text-sm font-semibold text-foreground leading-tight">{s.label}</p>
            <p className="text-xs text-muted mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent applications */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Останні заявки</h2>
            <Link href="/dashboard/applications" className="text-xs font-semibold text-primary hover:underline">
              Переглянути всі →
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <p className="text-3xl mb-3">📭</p>
              <p className="text-sm font-medium text-muted">Заявок поки немає</p>
            </div>
          ) : (
            <div>
              {recent.map((app, i) => (
                <Link
                  key={app.id}
                  href={`/dashboard/applications`}
                  className={`flex items-center gap-3.5 px-5 py-3.5 hover:bg-muted-bg transition-colors ${
                    i !== recent.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                    {app.firstName[0]}{app.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {app.firstName} {app.lastName}
                    </p>
                    <p className="text-xs text-muted truncate">{app.projectTitle}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${APP_STATUS_CLASS[app.status]}`}>
                      {APP_STATUS_LABEL[app.status]}
                    </span>
                    <span className="text-xs text-muted hidden sm:block">
                      {new Date(app.submittedAt).toLocaleDateString("uk-UA", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Active projects */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Активні проекти</h2>
            <Link href="/dashboard/projects" className="text-xs font-semibold text-primary hover:underline">
              Всі →
            </Link>
          </div>
          {published.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-muted mb-4">Немає опублікованих проектів</p>
              <Link href="/dashboard/projects/new" className="inline-flex text-xs font-semibold text-primary hover:underline">
                + Створити перший
              </Link>
            </div>
          ) : (
            <div>
              {published.slice(0, 5).map((p, i) => {
                const count = applications.filter((a) => a.projectId === p.id).length;
                const newCount = applications.filter(
                  (a) => a.projectId === p.id && a.status === "new"
                ).length;
                return (
                  <div
                    key={p.id}
                    className={`px-5 py-4 ${i !== Math.min(published.length, 5) - 1 ? "border-b border-border" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground line-clamp-1 leading-snug">{p.title}</p>
                        <p className="text-xs text-muted mt-0.5">до {p.deadlineDisplay}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-sm font-bold text-primary">{count}</p>
                        {newCount > 0 && (
                          <p className="text-[10px] text-blue-500 font-semibold">{newCount} нових</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Coordinator Dashboard ────────────────────────────────────────────
const MOCK_PROGRAMS = [
  { id: "erasmus-plus", title: "Erasmus+ Youth Exchange", org: "European Commission", deadline: "2025-06-30", deadlineDisplay: "30 черв 2025", country: "🇪🇺 Євросоюз", type: "Обмін" },
  { id: "daad-research", title: "DAAD Research Grant", org: "DAAD", deadline: "2025-09-15", deadlineDisplay: "15 вер 2025", country: "🇩🇪 Німеччина", type: "Стипендія" },
  { id: "hack4good", title: "Hack4Good 2025", org: "NGO TechForGood", deadline: "2025-07-20", deadlineDisplay: "20 лип 2025", country: "🌍 Онлайн", type: "Хакатон" },
];

const C_STATUS_LABEL: Record<Application["status"], string> = {
  pending: "Нова",
  reviewing: "Розглядається",
  accepted: "Прийнята",
  rejected: "Відхилена",
};
const C_STATUS_CLASS: Record<Application["status"], string> = {
  pending: "bg-amber-50 text-amber-600",
  reviewing: "bg-blue-50 text-blue-600",
  accepted: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-600",
};

function CoordinatorDashboard() {
  const { applications } = useApplications();
  const [tab, setTab] = useState<"programs" | "applications" | "archive">("programs");
  const [filterStatus, setFilterStatus] = useState<Application["status"] | "all">("all");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [filterProgram, setFilterProgram] = useState("all");

  const active = applications.filter((a) => a.status !== "rejected");
  const archived = applications.filter((a) => a.status === "rejected");
  const filtered = (tab === "archive" ? archived : active).filter((a) => {
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    if (filterProgram !== "all" && a.opportunitySlug !== filterProgram) return false;
    return true;
  });
  const withCounts = MOCK_PROGRAMS.map((p) => ({
    ...p,
    count: applications.filter((a) => a.opportunitySlug === p.id).length,
  }));

  return (
    <div className="page-transition max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-foreground mb-1">Панель координатора</h1>
          <p className="text-sm text-muted">Керуй програмами та заявками учасників</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm shadow-primary/20">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Додати програму
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Програм", value: MOCK_PROGRAMS.length },
          { label: "Всього заявок", value: applications.length },
          { label: "На розгляді", value: applications.filter((a) => a.status === "pending" || a.status === "reviewing").length },
          { label: "Прийнятих", value: applications.filter((a) => a.status === "accepted").length },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-border p-5">
            <p className="text-3xl font-black text-primary leading-none">{s.value}</p>
            <p className="text-xs text-muted mt-2">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-1 bg-muted-bg p-1 rounded-2xl w-fit mb-6 text-sm">
        {([ { id: "programs" as const, label: "Програми", count: MOCK_PROGRAMS.length }, { id: "applications" as const, label: "Заявки", count: active.length }, { id: "archive" as const, label: "Архів", count: archived.length } ] as const).map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl font-semibold transition-all ${tab === t.id ? "bg-white text-foreground shadow-sm" : "text-muted hover:text-foreground"}`}
          >
            {t.label}
            {t.count > 0 && <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${tab === t.id ? "bg-primary text-white" : "bg-border text-muted"}`}>{t.count}</span>}
          </button>
        ))}
      </div>

      {tab === "programs" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {withCounts.map((prog) => (
            <div key={prog.id} className="bg-white rounded-2xl border border-border p-5 flex flex-col gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all">
              <span className="text-xs font-semibold text-primary bg-primary-light px-2.5 py-1 rounded-full self-start">{prog.type}</span>
              <div>
                <p className="text-xs text-muted mb-1">{prog.org}</p>
                <p className="font-bold text-foreground text-sm leading-snug">{prog.title}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-muted mt-auto pt-3 border-t border-border">
                <span>{prog.country}</span>
                <button onClick={() => { setFilterProgram(prog.id); setTab("applications"); }} className="font-semibold text-primary hover:underline">
                  {prog.count} заявок →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(tab === "applications" || tab === "archive") && (
        <div>
          <div className="flex flex-wrap gap-3 mb-5">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as Application["status"] | "all")} className="text-sm border border-border rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option value="all">Усі статуси</option>
              <option value="pending">Нові</option>
              <option value="reviewing">Розглядаються</option>
              <option value="accepted">Прийняті</option>
              <option value="rejected">Відхилені</option>
            </select>
            <select value={filterProgram} onChange={(e) => setFilterProgram(e.target.value)} className="text-sm border border-border rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20">
              <option value="all">Всі програми</option>
              {MOCK_PROGRAMS.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-border">
              <p className="text-3xl mb-3">📭</p>
              <p className="font-semibold text-muted">Заявок ще немає</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filtered.map((app) => (
                <button key={app.id} onClick={() => setSelectedApp(app)} className="text-left bg-white rounded-2xl border border-border p-4 hover:shadow-md hover:border-primary/20 transition-all">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                        {app.firstName[0]}{app.lastName[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">{app.firstName} {app.lastName}</p>
                        <p className="text-xs text-muted truncate">{app.opportunityTitle}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${C_STATUS_CLASS[app.status]}`}>{C_STATUS_LABEL[app.status]}</span>
                      <span className="text-xs text-muted">{new Date(app.submittedAt).toLocaleDateString("uk-UA", { day: "numeric", month: "short" })}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedApp(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <div>
                <p className="font-bold text-foreground">{selectedApp.firstName} {selectedApp.lastName}</p>
                <p className="text-xs text-muted">{selectedApp.opportunityTitle}</p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="text-muted hover:text-foreground p-1.5 rounded-xl hover:bg-muted-bg transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 flex flex-col gap-5">
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Контакти</p>
                <div className="grid grid-cols-2 gap-y-2 text-sm bg-muted-bg rounded-xl p-4">
                  <span className="text-muted">Email</span><span className="font-medium">{selectedApp.email}</span>
                  <span className="text-muted">Країна</span><span className="font-medium">{selectedApp.country}</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Мотивація</p>
                <p className="text-sm leading-relaxed bg-muted-bg rounded-xl p-4">{selectedApp.motivation}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Router ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { org, ready } = useOrgSession();

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-7 h-7 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (org) {
    return <OrgShell><OrgOverview /></OrgShell>;
  }

  return <CoordinatorDashboard />;
}
