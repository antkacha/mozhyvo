"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useOrgSession } from "@/hooks/useOrgSession";
import { useOrgApplications, OrgApplication } from "@/hooks/useOrgApplications";
import { useOrgProjects } from "@/hooks/useOrgProjects";
import OrgShell from "@/components/OrgShell";

const STATUS_LABELS: Record<OrgApplication["status"], string> = {
  new: "Нова",
  reviewing: "Розглядається",
  selected: "Відібрано",
  rejected: "Відхилено",
};
const STATUS_STYLES: Record<OrgApplication["status"], string> = {
  new: "bg-blue-100 text-blue-700",
  reviewing: "bg-yellow-100 text-yellow-700",
  selected: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
};
const ALL_STATUSES: OrgApplication["status"][] = ["new", "reviewing", "selected", "rejected"];

function ApplicationModal({ app, onClose, onUpdate }: { app: OrgApplication; onClose: () => void; onUpdate: (id: string, data: Partial<OrgApplication>) => void }) {
  const [status, setStatus] = useState<OrgApplication["status"]>(app.status);
  const [note, setNote] = useState(app.internalNote ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaving(true);
    onUpdate(app.id, { status, internalNote: note.trim() || undefined });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <div>
            <p className="font-black text-gray-900">{app.firstName} {app.lastName}</p>
            <p className="text-sm text-gray-400">{app.projectTitle}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {/* Contact info */}
          <div>
            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-3">Контактна інформація</p>
            <div className="grid grid-cols-2 gap-y-2 gap-x-6 text-sm bg-gray-50 rounded-xl p-4">
              <span className="text-gray-400">Email</span><span className="font-medium">{app.email}</span>
              {app.phone && <><span className="text-gray-400">Телефон</span><span className="font-medium">{app.phone}</span></>}
              <span className="text-gray-400">Країна</span><span className="font-medium">{app.country}</span>
              <span className="text-gray-400">Заклад</span><span className="font-medium">{app.institution}</span>
              <span className="text-gray-400">Ступінь</span><span className="font-medium">{app.degree}</span>
              <span className="text-gray-400">Мови</span><span className="font-medium">{app.languages.join(", ")}</span>
            </div>
          </div>

          {/* Documents */}
          {(app.cvUrl || app.portfolioUrl) && (
            <div>
              <p className="text-xs font-bold text-primary uppercase tracking-wider mb-3">Документи</p>
              <div className="flex gap-3 flex-wrap">
                {app.cvUrl && (
                  <a href={app.cvUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 bg-primary-light text-primary rounded-xl text-sm font-semibold hover:bg-primary/10 transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Резюме / CV
                  </a>
                )}
                {app.portfolioUrl && (
                  <a href={app.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-100 transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-3">Мотиваційний лист</p>
            <div className="bg-primary-light/50 rounded-xl p-4">
              <p className="text-sm leading-relaxed text-gray-700">{app.motivation}</p>
            </div>
          </div>

          {/* Status + Note management */}
          <div className="border border-gray-100 rounded-2xl p-5 flex flex-col gap-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Управління заявкою</p>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Статус</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ALL_STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border-2 ${
                      status === s
                        ? `${STATUS_STYLES[s]} border-current`
                        : "bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100"
                    }`}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Внутрішня нотатка</p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Нотатки для команди (не видно кандидату)..."
                className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none transition-all bg-gray-50 placeholder:text-gray-300"
              />
            </div>

            <div className="flex items-center justify-between">
              {saved && <span className="text-xs text-green-600 font-semibold">✓ Збережено</span>}
              <div className="flex items-center gap-3 ml-auto">
                <button onClick={onClose} className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all">
                  Закрити
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm shadow-primary/25 disabled:opacity-50"
                >
                  Зберегти
                </button>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-300 text-right">
            Подано: {new Date(app.submittedAt).toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>
    </div>
  );
}

function ApplicationsContent() {
  const searchParams = useSearchParams();
  const { org } = useOrgSession();
  const { applications, ready, updateApp } = useOrgApplications();
  const { projects } = useOrgProjects(org?.id);

  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<OrgApplication["status"] | "all">("all");
  const [openApp, setOpenApp] = useState<OrgApplication | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const proj = searchParams.get("project");
    if (proj) setSelectedProject(proj);
  }, [searchParams]);

  const filtered = applications.filter((a) => {
    if (selectedProject !== "all" && a.projectId !== selectedProject) return false;
    if (selectedStatus !== "all" && a.status !== selectedStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return `${a.firstName} ${a.lastName} ${a.email} ${a.country}`.toLowerCase().includes(q);
    }
    return true;
  });

  const counts: Record<string, number> = { all: applications.length };
  ALL_STATUSES.forEach((s) => {
    counts[s] = applications.filter((a) => a.status === s).length;
  });

  if (!ready) {
    return <div className="flex items-center justify-center min-h-[40vh]"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Заявки</h1>
        <p className="text-sm text-gray-500 mt-0.5">{applications.length} заявок всього</p>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Пошук за ім'ям, email..."
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>

        {/* Project filter */}
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="px-3 py-2.5 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        >
          <option value="all">Всі проекти</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.title}</option>
          ))}
        </select>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        {([["all", "Всі"] as const, ...ALL_STATUSES.map((s) => [s, STATUS_LABELS[s]] as const)]).map(([val, label]) => (
          <button
            key={val}
            onClick={() => setSelectedStatus(val as OrgApplication["status"] | "all")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all ${
              selectedStatus === val
                ? "bg-primary text-white"
                : "bg-white text-gray-600 border border-gray-200 hover:border-primary/40"
            }`}
          >
            {label}
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${selectedStatus === val ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
              {val === "all" ? counts.all : counts[val] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Applications list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <p className="text-4xl mb-3">📭</p>
          <p className="font-semibold text-gray-700">Заявок не знайдено</p>
          <p className="text-sm text-gray-400 mt-1">Спробуйте змінити фільтри</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((app) => (
            <button
              key={app.id}
              onClick={() => setOpenApp(app)}
              className="text-left bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-primary/20 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0 text-sm font-black text-primary">
                  {app.firstName[0]}{app.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-gray-900 text-sm">{app.firstName} {app.lastName}</span>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS_STYLES[app.status]}`}>
                        {STATUS_LABELS[app.status]}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(app.submittedAt).toLocaleDateString("uk-UA", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <p className="text-xs text-primary font-semibold mt-0.5">{app.projectTitle}</p>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="text-xs text-gray-400">{app.country}</span>
                    <span className="text-gray-200 text-xs">•</span>
                    <span className="text-xs text-gray-400">{app.institution}</span>
                    <span className="text-gray-200 text-xs">•</span>
                    <span className="text-xs text-gray-400">{app.degree}</span>
                  </div>
                  {app.internalNote && (
                    <div className="mt-2 flex items-start gap-1.5">
                      <svg className="w-3.5 h-3.5 text-yellow-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <p className="text-xs text-yellow-700 line-clamp-1">{app.internalNote}</p>
                    </div>
                  )}
                </div>
                <svg className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}

      {openApp && (
        <ApplicationModal
          app={openApp}
          onClose={() => setOpenApp(null)}
          onUpdate={(id, data) => {
            updateApp(id, data);
            setOpenApp((prev) => prev && prev.id === id ? { ...prev, ...data } : prev);
          }}
        />
      )}
    </div>
  );
}

export default function ApplicationsPage() {
  return <OrgShell><ApplicationsContent /></OrgShell>;
}
