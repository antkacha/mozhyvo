"use client";

import Link from "next/link";
import { useOrgSession } from "@/hooks/useOrgSession";
import { useOrgProjects } from "@/hooks/useOrgProjects";
import { useOrgApplications, OrgApplication } from "@/hooks/useOrgApplications";

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

// ── Router ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  return <OrgOverview />;
}
