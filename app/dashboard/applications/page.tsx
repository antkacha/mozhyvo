"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useOrgSession } from "@/hooks/useOrgSession";
import { useOrgApplications, OrgApplication } from "@/hooks/useOrgApplications";
import { useOrgProjects } from "@/hooks/useOrgProjects";
import OrgShell from "@/components/OrgShell";

const STATUSES: OrgApplication["status"][] = ["new", "reviewing", "selected", "rejected"];

const STATUS_LABEL: Record<OrgApplication["status"], string> = {
  new: "Нова",
  reviewing: "Розглядається",
  selected: "Відібрано",
  rejected: "Відхилено",
};
const STATUS_CLASS: Record<OrgApplication["status"], string> = {
  new: "bg-blue-50 text-blue-600 border-blue-100",
  reviewing: "bg-amber-50 text-amber-600 border-amber-100",
  selected: "bg-green-50 text-green-700 border-green-100",
  rejected: "bg-red-50 text-red-600 border-red-100",
};
const STATUS_DOT: Record<OrgApplication["status"], string> = {
  new: "bg-blue-500",
  reviewing: "bg-amber-400",
  selected: "bg-green-500",
  rejected: "bg-red-400",
};

// ── Slide-over panel ─────────────────────────────────────────────────
function SlideOver({
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
    setTimeout(() => setSaved(false), 2000);
  }

  const input = "w-full px-3.5 py-2.5 rounded-xl border border-border bg-muted-bg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all focus:bg-white";

  return (
    <>
      {/* Backdrop (mobile) */}
      <div
        className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <aside className="fixed right-0 top-16 bottom-0 z-50 w-full max-w-md bg-white border-l border-border flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-primary-light flex items-center justify-center flex-shrink-0 text-sm font-bold text-primary">
              {app.firstName[0]}{app.lastName[0]}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-foreground leading-tight truncate">
                {app.firstName} {app.lastName}
              </p>
              <p className="text-xs text-muted truncate">{app.projectTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-muted hover:text-foreground hover:bg-muted-bg transition-all flex-shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 flex flex-col gap-5">

            {/* Contact info */}
            <div>
              <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-3">Контакти</p>
              <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                <span className="text-muted">Email</span>
                <a href={`mailto:${app.email}`} className="font-medium text-primary hover:underline truncate">{app.email}</a>
                {app.phone && (
                  <>
                    <span className="text-muted">Телефон</span>
                    <span className="font-medium">{app.phone}</span>
                  </>
                )}
                <span className="text-muted">Країна</span>
                <span className="font-medium">{app.country}</span>
                <span className="text-muted">Заклад</span>
                <span className="font-medium">{app.institution}</span>
                <span className="text-muted">Ступінь</span>
                <span className="font-medium">{app.degree}</span>
                <span className="text-muted">Мови</span>
                <span className="font-medium">{app.languages.join(", ")}</span>
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
                      Резюме / CV
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
              <div className="bg-muted-bg rounded-xl p-4 border-l-2 border-primary">
                <p className="text-sm leading-relaxed text-foreground">{app.motivation}</p>
              </div>
            </div>

            {/* Submitted */}
            <p className="text-xs text-muted text-right">
              Подано{" "}
              {new Date(app.submittedAt).toLocaleDateString("uk-UA", {
                day: "numeric", month: "long", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Sticky footer: status + note */}
        <div className="flex-shrink-0 border-t border-border p-5 flex flex-col gap-4 bg-white">
          <div>
            <p className="text-xs font-semibold text-muted mb-2">Статус заявки</p>
            <div className="grid grid-cols-2 gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                    status === s
                      ? `${STATUS_CLASS[s]} border-current`
                      : "border-border bg-muted-bg text-muted hover:border-border hover:text-foreground"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status === s ? STATUS_DOT[s] : "bg-muted"}`} />
                  {STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-muted mb-2">Внутрішня нотатка</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="Нотатки для команди (кандидат не бачить)..."
              className={`${input} resize-none`}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            {saved ? (
              <span className="flex items-center gap-1.5 text-xs text-green-600 font-semibold">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                Збережено
              </span>
            ) : <span />}
            <button
              onClick={save}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm shadow-primary/20 ml-auto"
            >
              Зберегти
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

// ── Main applications page ────────────────────────────────────────────
function ApplicationsContent() {
  const searchParams = useSearchParams();
  const { org } = useOrgSession();
  const { applications, ready, updateApp } = useOrgApplications();
  const { projects } = useOrgProjects(org?.id);

  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<OrgApplication["status"] | "all">("all");
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState<OrgApplication | null>(null);

  useEffect(() => {
    const p = searchParams.get("project");
    if (p) setProjectFilter(p);
  }, [searchParams]);

  const filtered = applications.filter((a) => {
    if (projectFilter !== "all" && a.projectId !== projectFilter) return false;
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return `${a.firstName} ${a.lastName} ${a.email} ${a.country} ${a.institution}`
        .toLowerCase()
        .includes(q);
    }
    return true;
  });

  const counts = {
    all: applications.length,
    new: applications.filter((a) => a.status === "new").length,
    reviewing: applications.filter((a) => a.status === "reviewing").length,
    selected: applications.filter((a) => a.status === "selected").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-7 h-7 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={`page-transition transition-all ${open ? "lg:mr-[400px]" : ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-7">
        <div>
          <h1 className="text-2xl font-black text-foreground">Заявки</h1>
          <p className="text-sm text-muted mt-0.5">{applications.length} заявок всього</p>
        </div>
      </div>

      {/* Status overview chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(statusFilter === s ? "all" : s)}
            className={`flex items-center justify-between px-4 py-3 rounded-2xl border transition-all text-left ${
              statusFilter === s
                ? `${STATUS_CLASS[s]} border-current`
                : "bg-white border-border hover:border-primary/20"
            }`}
          >
            <div>
              <p className={`text-xl font-black leading-none ${statusFilter === s ? "" : "text-foreground"}`}>
                {counts[s]}
              </p>
              <p className={`text-xs font-semibold mt-1 ${statusFilter === s ? "" : "text-muted"}`}>
                {STATUS_LABEL[s]}
              </p>
            </div>
            <span className={`w-2 h-2 rounded-full ${STATUS_DOT[s]}`} />
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Пошук за ім'ям, email..."
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {/* Project filter */}
        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="px-3.5 py-2.5 text-sm rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        >
          <option value="all">Всі проекти</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>

        {(statusFilter !== "all" || search || projectFilter !== "all") && (
          <button
            onClick={() => { setStatusFilter("all"); setSearch(""); setProjectFilter("all"); }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 text-sm rounded-xl border border-border bg-white text-muted hover:text-foreground transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Скинути
          </button>
        )}
      </div>

      {/* Results count */}
      {filtered.length !== applications.length && (
        <p className="text-xs text-muted mb-4">
          Показано {filtered.length} з {applications.length}
        </p>
      )}

      {/* Applications list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-16 text-center">
          <div className="w-12 h-12 bg-muted-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-5.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-1.414 0l-2.414-2.414A1 1 0 006.586 13H2" />
            </svg>
          </div>
          <p className="font-semibold text-foreground">Заявок не знайдено</p>
          <p className="text-sm text-muted mt-1">Спробуйте змінити фільтри</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">
          {filtered.map((app, i) => {
            const isOpen = open?.id === app.id;
            return (
              <button
                key={app.id}
                onClick={() => setOpen(isOpen ? null : app)}
                className={`w-full text-left flex items-start gap-4 px-5 py-4 transition-all hover:bg-muted-bg ${
                  isOpen ? "bg-primary-light" : ""
                } ${i !== filtered.length - 1 ? "border-b border-border" : ""}`}
              >
                {/* Avatar */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5 ${
                  isOpen ? "bg-primary text-white" : "bg-primary-light text-primary"
                }`}>
                  {app.firstName[0]}{app.lastName[0]}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">{app.firstName} {app.lastName}</span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_CLASS[app.status]}`}>
                      {STATUS_LABEL[app.status]}
                    </span>
                    {app.internalNote && (
                      <span className="flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Нотатка
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-primary font-semibold mt-0.5 truncate">{app.projectTitle}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted flex-wrap">
                    <span>{app.country}</span>
                    <span className="text-border">•</span>
                    <span className="truncate max-w-[180px]">{app.institution}</span>
                  </div>
                </div>

                {/* Date + chevron */}
                <div className="flex-shrink-0 flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-muted">
                    {new Date(app.submittedAt).toLocaleDateString("uk-UA", { day: "numeric", month: "short" })}
                  </span>
                  <svg
                    className={`w-4 h-4 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Quick link to projects */}
      {applications.length === 0 && (
        <div className="mt-4 text-center">
          <Link href="/dashboard/projects" className="text-sm font-semibold text-primary hover:underline">
            Перейти до проектів →
          </Link>
        </div>
      )}

      {/* Slide-over */}
      {open && (
        <SlideOver
          app={open}
          onClose={() => setOpen(null)}
          onUpdate={(id, data) => {
            updateApp(id, data);
            setOpen((prev) => (prev?.id === id ? { ...prev, ...data } : prev));
          }}
        />
      )}
    </div>
  );
}

export default function ApplicationsPage() {
  return <OrgShell><ApplicationsContent /></OrgShell>;
}
