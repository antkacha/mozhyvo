"use client";

import Link from "next/link";
import { useState } from "react";
import { useOrgSession } from "@/hooks/useOrgSession";
import { useOrgProjects } from "@/hooks/useOrgProjects";
import { useOrgApplications } from "@/hooks/useOrgApplications";
import { useApplications, Application } from "@/hooks/useApplications";
import OrgShell from "@/components/OrgShell";

// ── Org Overview ───────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  reviewing: "bg-yellow-100 text-yellow-700",
  selected: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
};
const STATUS_LABELS: Record<string, string> = {
  new: "Нова",
  reviewing: "Розглядається",
  selected: "Відібрано",
  rejected: "Відхилено",
};

function OrgOverview() {
  const { org } = useOrgSession();
  const { projects } = useOrgProjects(org?.id);
  const { applications } = useOrgApplications();

  const published = projects.filter((p) => p.status === "published");
  const drafts = projects.filter((p) => p.status === "draft");
  const newApps = applications.filter((a) => a.status === "new");
  const selected = applications.filter((a) => a.status === "selected");
  const recent = [...applications].sort((a, b) => b.submittedAt.localeCompare(a.submittedAt)).slice(0, 5);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Огляд</h1>
          <p className="text-sm text-gray-500 mt-0.5">Вітаємо, {org?.name}</p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-all shadow-sm shadow-primary/25"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Новий проект
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Всього проектів", value: projects.length, sub: `${published.length} опубліковано`, color: "text-primary" },
          { label: "Чернетки", value: drafts.length, sub: "очікують публікації", color: "text-gray-500" },
          { label: "Нові заявки", value: newApps.length, sub: "потребують перегляду", color: "text-blue-600" },
          { label: "Відібрано", value: selected.length, sub: `з ${applications.length} заявок`, color: "text-green-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className={`text-3xl font-black leading-none ${s.color}`}>{s.value}</p>
            <p className="text-sm font-semibold text-gray-800 mt-2">{s.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent applications */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Останні заявки</h2>
            <Link href="/dashboard/applications" className="text-xs font-semibold text-primary hover:underline">
              Всі заявки →
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">Заявок ще немає</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recent.map((app) => (
                <div key={app.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0 text-xs font-black text-primary">
                      {app.firstName[0]}{app.lastName[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {app.firstName} {app.lastName}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{app.projectTitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[app.status]}`}>
                      {STATUS_LABELS[app.status]}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(app.submittedAt).toLocaleDateString("uk-UA", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Published projects */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between p-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900">Активні проекти</h2>
            <Link href="/dashboard/projects" className="text-xs font-semibold text-primary hover:underline">
              Всі →
            </Link>
          </div>
          {published.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-400 text-sm mb-3">Немає опублікованих проектів</p>
              <Link href="/dashboard/projects/new" className="text-xs font-semibold text-primary hover:underline">
                + Додати перший
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {published.slice(0, 4).map((p) => {
                const appCount = applications.filter((a) => a.projectId === p.id).length;
                return (
                  <div key={p.id} className="px-5 py-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-1">{p.title}</p>
                      <span className="text-xs font-bold text-primary bg-primary-light px-2 py-0.5 rounded-full flex-shrink-0">
                        {appCount}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Дедлайн: {p.deadlineDisplay}</p>
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

// ── Coordinator Dashboard (unchanged) ─────────────────────────────
const MOCK_PROGRAMS = [
  { id: "erasmus-plus", title: "Erasmus+ Youth Exchange", org: "European Commission", deadline: "2025-06-30", deadlineDisplay: "30 черв 2025", country: "🇪🇺 Євросоюз", type: "Обмін" },
  { id: "daad-research", title: "DAAD Research Grant", org: "DAAD", deadline: "2025-09-15", deadlineDisplay: "15 вер 2025", country: "🇩🇪 Німеччина", type: "Стипендія" },
  { id: "hack4good", title: "Hack4Good 2025", org: "NGO TechForGood", deadline: "2025-07-20", deadlineDisplay: "20 лип 2025", country: "🌍 Онлайн", type: "Хакатон" },
];

const C_STATUS_LABELS: Record<Application["status"], string> = { pending: "Нова", reviewing: "Розглядається", accepted: "Прийнята", rejected: "Відхилена" };
const C_STATUS_STYLES: Record<Application["status"], string> = { pending: "bg-yellow-100 text-yellow-700", reviewing: "bg-blue-100 text-blue-700", accepted: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-600" };

function CoordinatorDashboard() {
  const { applications } = useApplications();
  const [tab, setTab] = useState<"programs" | "applications" | "archive">("programs");
  const [filterStatus, setFilterStatus] = useState<Application["status"] | "all">("all");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [filterProgram, setFilterProgram] = useState<string>("all");

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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground mb-1">Панель координатора</h1>
          <p className="text-sm text-muted">Керуй програмами та заявками учасників</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-all">
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
          <div key={s.label} className="bg-white rounded-2xl border border-border p-5 text-center shadow-sm">
            <p className="text-3xl font-extrabold text-primary">{s.value}</p>
            <p className="text-xs text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-1 bg-muted-bg p-1.5 rounded-2xl w-fit mb-8">
        {[
          { id: "programs" as const, label: "Мої програми", count: MOCK_PROGRAMS.length },
          { id: "applications" as const, label: "Заявки", count: active.length },
          { id: "archive" as const, label: "Архів", count: archived.length },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t.id ? "bg-white text-foreground shadow-sm" : "text-muted hover:text-foreground"}`}
          >
            {t.label}
            {t.count > 0 && <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${tab === t.id ? "bg-primary text-white" : "bg-border text-muted"}`}>{t.count}</span>}
          </button>
        ))}
      </div>
      {tab === "programs" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {withCounts.map((prog) => (
            <div key={prog.id} className="bg-white rounded-2xl border border-border p-6 shadow-sm flex flex-col gap-4 hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs font-semibold text-primary bg-primary-light px-2.5 py-1 rounded-full">{prog.type}</span>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">{prog.org}</p>
                <p className="font-bold text-foreground text-sm">{prog.title}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-muted">
                <span>{prog.country}</span><span>до {prog.deadlineDisplay}</span>
              </div>
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="font-bold text-foreground">{prog.count}</span>
                  <span className="text-muted">заявок</span>
                </div>
                <button onClick={() => { setFilterProgram(prog.id); setTab("applications"); }} className="text-xs font-semibold text-primary hover:underline">Переглянути →</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {(tab === "applications" || tab === "archive") && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-3">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as Application["status"] | "all")} className="text-sm border border-border rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="all">Усі статуси</option>
              <option value="pending">Нові</option>
              <option value="reviewing">Розглядаються</option>
              <option value="accepted">Прийняті</option>
              <option value="rejected">Відхилені</option>
            </select>
            <select value={filterProgram} onChange={(e) => setFilterProgram(e.target.value)} className="text-sm border border-border rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="all">Усі програми</option>
              {MOCK_PROGRAMS.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted"><div className="text-4xl mb-3">📭</div><p className="font-semibold">Заявок ще немає</p></div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((app) => (
                <button key={app.id} onClick={() => setSelectedApp(app)} className="text-left bg-white rounded-2xl border border-border p-5 hover:shadow-md hover:border-primary/30 transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm">{app.firstName} {app.lastName}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${C_STATUS_STYLES[app.status]}`}>{C_STATUS_LABELS[app.status]}</span>
                      </div>
                      <p className="text-xs text-muted">{app.opportunityTitle}</p>
                    </div>
                    <p className="text-xs text-muted flex-shrink-0">{new Date(app.submittedAt).toLocaleDateString("uk-UA", { day: "numeric", month: "short" })}</p>
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
              <div><p className="font-bold">{selectedApp.firstName} {selectedApp.lastName}</p><p className="text-xs text-muted">{selectedApp.opportunityTitle}</p></div>
              <button onClick={() => setSelectedApp(null)} className="text-muted hover:text-foreground p-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 flex flex-col gap-5">
              <div><p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Контакти</p>
                <div className="grid grid-cols-2 gap-y-1.5 text-sm"><span className="text-muted">Email</span><span className="font-medium">{selectedApp.email}</span><span className="text-muted">Країна</span><span className="font-medium">{selectedApp.country}</span></div>
              </div>
              <div><p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Мотивація</p><p className="text-sm leading-relaxed bg-muted-bg rounded-xl p-4">{selectedApp.motivation}</p></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Router ─────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { org, ready } = useOrgSession();

  if (!ready) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;
  }

  if (org) {
    return <OrgShell><OrgOverview /></OrgShell>;
  }

  return <CoordinatorDashboard />;
}
