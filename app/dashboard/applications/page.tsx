"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useOrgSession } from "@/hooks/useOrgSession";
import { useOrgApplications, OrgApplication } from "@/hooks/useOrgApplications";
import { useOrgProjects, OrgProject } from "@/hooks/useOrgProjects";
import OrgShell from "@/components/OrgShell";

// ── Constants ────────────────────────────────────────────────────────
const STATUSES: OrgApplication["status"][] = ["new", "reviewing", "selected", "rejected"];

const STATUS_LABEL: Record<OrgApplication["status"], string> = {
  new: "Нова",
  reviewing: "Розглядається",
  selected: "Відібрано",
  rejected: "Відхилено",
};
const STATUS_CHIP: Record<OrgApplication["status"], string> = {
  new: "bg-blue-50 text-blue-600",
  reviewing: "bg-amber-50 text-amber-600",
  selected: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-500",
};
const STATUS_ACTIVE: Record<OrgApplication["status"], string> = {
  new: "bg-blue-500 text-white border-blue-500",
  reviewing: "bg-amber-400 text-white border-amber-400",
  selected: "bg-green-500 text-white border-green-500",
  rejected: "bg-red-400 text-white border-red-400",
};
const STATUS_DOT: Record<OrgApplication["status"], string> = {
  new: "bg-blue-500",
  reviewing: "bg-amber-400",
  selected: "bg-green-500",
  rejected: "bg-red-400",
};

// ── Application Detail ───────────────────────────────────────────────
function AppDetail({
  app,
  onClose,
  onUpdate,
}: {
  app: OrgApplication;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<OrgApplication>) => void;
}) {
  const [status, setStatus] = useState<OrgApplication["status"]>(app.status);
  const [note, setNote] = useState(app.internalNote ?? "");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setStatus(app.status);
    setNote(app.internalNote ?? "");
    setSaved(false);
  }, [app.id, app.status, app.internalNote]);

  function save() {
    onUpdate(app.id, { status, internalNote: note.trim() || undefined });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start gap-4 p-5 border-b border-border flex-shrink-0">
        {/* Gradient avatar */}
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 text-white font-black text-base shadow-sm"
          style={{ background: "linear-gradient(135deg, #3B4FE8 0%, #7C3AED 100%)" }}
        >
          {app.firstName[0]}{app.lastName[0]}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-black text-foreground text-lg leading-tight">
            {app.firstName} {app.lastName}
          </h2>
          <p className="text-sm text-muted truncate mt-0.5">{app.country} · {app.institution}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-muted hover:text-foreground hover:bg-muted-bg transition-all flex-shrink-0 mt-0.5"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">

        {/* Status selector */}
        <div className="px-5 py-4 border-b border-border">
          <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-3">Статус заявки</p>
          <div className="flex gap-2 flex-wrap">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  status === s
                    ? STATUS_ACTIVE[s]
                    : "border-border bg-white text-muted hover:border-primary/30 hover:text-foreground"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${status === s ? "bg-white/80" : STATUS_DOT[s]}`} />
                {STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 flex flex-col gap-5">
          {/* Contact info */}
          <div>
            <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-3">Контакти</p>
            <div className="bg-muted-bg rounded-xl overflow-hidden">
              {[
                ["Email", <a key="e" href={`mailto:${app.email}`} className="text-primary hover:underline font-medium text-sm">{app.email}</a>],
                app.phone ? ["Телефон", <span key="p" className="font-medium text-sm">{app.phone}</span>] : null,
                ["Країна", <span key="c" className="font-medium text-sm">{app.country}</span>],
                ["Заклад", <span key="i" className="font-medium text-sm">{app.institution}</span>],
                ["Ступінь", <span key="d" className="font-medium text-sm">{app.degree}</span>],
                ["Мови", <span key="l" className="font-medium text-sm">{app.languages.join(", ")}</span>],
              ]
                .filter(Boolean)
                .map((row, i, arr) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between gap-4 px-4 py-2.5 ${i < arr.length - 1 ? "border-b border-border/50" : ""}`}
                  >
                    <span className="text-xs text-muted flex-shrink-0 w-16">{(row as [string, React.ReactNode])[0]}</span>
                    <span className="text-right min-w-0 truncate">{(row as [string, React.ReactNode])[1]}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* Documents */}
          {(app.cvUrl || app.portfolioUrl) && (
            <div>
              <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-3">Документи</p>
              <div className="flex gap-2 flex-wrap">
                {app.cvUrl && (
                  <a
                    href={app.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3.5 py-2 bg-primary-light text-primary text-xs font-semibold rounded-xl hover:bg-primary/10 transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    CV / Резюме
                  </a>
                )}
                {app.portfolioUrl && (
                  <a
                    href={app.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3.5 py-2 bg-muted-bg text-foreground text-xs font-semibold rounded-xl hover:bg-border transition-all"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Портфоліо
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Motivation */}
          <div>
            <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-3">Мотиваційний лист</p>
            <div className="border-l-2 border-primary pl-4">
              <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">{app.motivation}</p>
            </div>
          </div>

          {/* Internal note */}
          <div>
            <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-3">Внутрішня нотатка</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Нотатки для команди (кандидат не бачить)..."
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-muted-bg focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none placeholder:text-muted/40"
            />
          </div>

          <p className="text-xs text-muted/60 text-right">
            Подано{" "}
            {new Date(app.submittedAt).toLocaleDateString("uk-UA", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Sticky footer */}
      <div className="flex-shrink-0 px-5 py-4 border-t border-border bg-white flex items-center justify-between gap-3">
        {saved ? (
          <span className="flex items-center gap-1.5 text-xs text-green-600 font-semibold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Збережено
          </span>
        ) : (
          <span className="text-xs text-muted">Зміни ще не збережено</span>
        )}
        <button
          onClick={save}
          className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm shadow-primary/20"
        >
          Зберегти
        </button>
      </div>
    </div>
  );
}

// ── Project sidebar item ─────────────────────────────────────────────
function ProjectItem({
  project,
  apps,
  selected,
  onClick,
}: {
  project: OrgProject | { id: "all"; title: string };
  apps: OrgApplication[];
  selected: boolean;
  onClick: () => void;
}) {
  const newCount = apps.filter((a) => a.status === "new").length;
  const isAll = project.id === "all";

  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between gap-2 ${
        selected
          ? "bg-primary-light text-primary"
          : "text-muted hover:bg-muted-bg hover:text-foreground"
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {isAll ? (
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        ) : (
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
          </svg>
        )}
        <span className="text-sm font-medium truncate leading-tight">{project.title}</span>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {newCount > 0 && (
          <span className="w-4 h-4 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {newCount}
          </span>
        )}
        <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${
          selected ? "bg-primary/15 text-primary" : "bg-border/60 text-muted"
        }`}>
          {apps.length}
        </span>
      </div>
    </button>
  );
}

// ── Application row ───────────────────────────────────────────────────
function AppRow({
  app,
  selected,
  onClick,
  showProject,
}: {
  app: OrgApplication;
  selected: boolean;
  onClick: () => void;
  showProject: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-center gap-3.5 px-4 py-3.5 transition-all border-b border-border last:border-0 ${
        selected ? "bg-primary-light" : "hover:bg-muted-bg"
      }`}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
        style={
          selected
            ? { background: "linear-gradient(135deg, #3B4FE8 0%, #7C3AED 100%)", color: "#fff" }
            : { background: "#EEF0FD", color: "#3B4FE8" }
        }
      >
        {app.firstName[0]}{app.lastName[0]}
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-semibold ${selected ? "text-primary" : "text-foreground"}`}>
            {app.firstName} {app.lastName}
          </span>
          {app.internalNote && (
            <svg className="w-3 h-3 text-amber-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted truncate">
          <span>{app.country}</span>
          {showProject && (
            <>
              <span className="text-border">·</span>
              <span className="truncate">{app.projectTitle}</span>
            </>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_CHIP[app.status]}`}>
          {STATUS_LABEL[app.status]}
        </span>
        <span className="text-[11px] text-muted">
          {new Date(app.submittedAt).toLocaleDateString("uk-UA", { day: "numeric", month: "short" })}
        </span>
      </div>
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────────
function ApplicationsContent() {
  const searchParams = useSearchParams();
  const { org } = useOrgSession();
  const { applications, ready, updateApp } = useOrgApplications();
  const { projects } = useOrgProjects(org?.id);

  const [projectId, setProjectId] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<OrgApplication["status"] | "all">("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<OrgApplication | null>(null);

  // Apply ?project= param from URL
  useEffect(() => {
    const p = searchParams.get("project");
    if (p) setProjectId(p);
  }, [searchParams]);

  // Close detail if it no longer matches filters
  useEffect(() => {
    if (selected) setSelected(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, statusFilter, search]);

  // Apps per project (for sidebar counts)
  function appsForProject(id: string) {
    return id === "all" ? applications : applications.filter((a) => a.projectId === id);
  }

  // Filtered + searched list
  const list = applications.filter((a) => {
    if (projectId !== "all" && a.projectId !== projectId) return false;
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return `${a.firstName} ${a.lastName} ${a.email} ${a.country} ${a.institution}`.toLowerCase().includes(q);
    }
    return true;
  });

  // Status counts within current project selection
  const allForProject = projectId === "all" ? applications : applications.filter((a) => a.projectId === projectId);
  const statusCounts: Record<string, number> = { all: allForProject.length };
  STATUSES.forEach((s) => { statusCounts[s] = allForProject.filter((a) => a.status === s).length; });

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-7 h-7 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const currentProject = projects.find((p) => p.id === projectId);

  return (
    <div className="page-transition">
      {/* Page header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground">Заявки</h1>
          <p className="text-sm text-muted mt-0.5">{applications.length} заявок всього</p>
        </div>
      </div>

      {/* Three-column grid: projects | list | detail */}
      <div className="flex gap-5 items-start">

        {/* ── Left: project sidebar ── */}
        <div className="hidden sm:flex flex-col w-52 flex-shrink-0 bg-white rounded-2xl border border-border overflow-hidden sticky top-24 self-start">
          <div className="px-3 py-3 border-b border-border">
            <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">Проекти</p>
          </div>
          <div className="p-2 flex flex-col gap-0.5">
            <ProjectItem
              project={{ id: "all", title: "Всі заявки" }}
              apps={applications}
              selected={projectId === "all"}
              onClick={() => setProjectId("all")}
            />
            {projects.map((p) => (
              <ProjectItem
                key={p.id}
                project={p}
                apps={appsForProject(p.id)}
                selected={projectId === p.id}
                onClick={() => setProjectId(p.id)}
              />
            ))}
          </div>
        </div>

        {/* ── Center: application list ── */}
        <div className={`flex-1 min-w-0 flex flex-col gap-4 ${selected ? "hidden lg:flex" : "flex"}`}>

          {/* Mobile: project selector */}
          <div className="sm:hidden">
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            >
              <option value="all">Всі заявки ({applications.length})</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({appsForProject(p.id).length})
                </option>
              ))}
            </select>
          </div>

          {/* Project header */}
          {currentProject && (
            <div className="flex items-center gap-3 py-1">
              <div>
                <p className="font-semibold text-foreground">{currentProject.title}</p>
                <p className="text-xs text-muted">{currentProject.flag} {currentProject.location} · до {currentProject.deadlineDisplay}</p>
              </div>
            </div>
          )}

          {/* Search + status filter */}
          <div className="flex flex-col gap-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Пошук за ім'ям, email, країною..."
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Status filter pills */}
            <div className="flex gap-1.5 flex-wrap">
              {([["all", "Всі"] as const, ...STATUSES.map((s) => [s, STATUS_LABEL[s]] as const)]).map(([val, lbl]) => (
                <button
                  key={val}
                  onClick={() => setStatusFilter(val as OrgApplication["status"] | "all")}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${
                    statusFilter === val
                      ? "bg-primary text-white"
                      : "bg-white border border-border text-muted hover:text-foreground hover:border-primary/30"
                  }`}
                >
                  {val !== "all" && (
                    <span className={`w-1.5 h-1.5 rounded-full ${statusFilter === val ? "bg-white/60" : STATUS_DOT[val as OrgApplication["status"]]}`} />
                  )}
                  {lbl}
                  <span className={`px-1 rounded-full text-[10px] font-bold ${statusFilter === val ? "bg-white/20" : ""}`}>
                    {statusCounts[val] ?? 0}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Applications */}
          {list.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border p-12 text-center">
              <div className="w-12 h-12 bg-muted-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-5.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-1.414 0l-2.414-2.414A1 1 0 006.586 13H2" />
                </svg>
              </div>
              <p className="font-semibold text-foreground text-sm">Заявок не знайдено</p>
              <p className="text-xs text-muted mt-1">Спробуйте змінити пошук або фільтри</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              {/* Table header */}
              <div className="flex items-center gap-3.5 px-4 py-2.5 border-b border-border bg-muted-bg">
                <div className="w-8 flex-shrink-0" />
                <span className="flex-1 text-[11px] font-semibold text-muted uppercase tracking-wider">Кандидат</span>
                <span className="flex-shrink-0 text-[11px] font-semibold text-muted uppercase tracking-wider text-right">Статус / Дата</span>
              </div>
              {list.map((app) => (
                <AppRow
                  key={app.id}
                  app={app}
                  selected={selected?.id === app.id}
                  showProject={projectId === "all"}
                  onClick={() => setSelected(selected?.id === app.id ? null : app)}
                />
              ))}
              <div className="px-4 py-2.5 bg-muted-bg/50 border-t border-border">
                <p className="text-xs text-muted">
                  {list.length} {list.length === 1 ? "заявка" : list.length < 5 ? "заявки" : "заявок"}
                  {list.length !== applications.length && ` з ${applications.length}`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Right: detail panel ── */}
        {selected && (
          <div className="w-full lg:w-96 flex-shrink-0 bg-white rounded-2xl border border-border overflow-hidden flex flex-col sticky top-24 self-start" style={{ maxHeight: "calc(100vh - 120px)" }}>
            <AppDetail
              app={selected}
              onClose={() => setSelected(null)}
              onUpdate={(id, data) => {
                updateApp(id, data);
                setSelected((prev) => (prev?.id === id ? { ...prev, ...data } : prev));
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function ApplicationsPage() {
  return <OrgShell><ApplicationsContent /></OrgShell>;
}
