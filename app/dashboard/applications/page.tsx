"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useOrgSession } from "@/hooks/useOrgSession";
import { useOrgApplications, OrgApplication } from "@/hooks/useOrgApplications";
import { useOrgProjects } from "@/hooks/useOrgProjects";

// ── Status config ─────────────────────────────────────────────────────
const STATUSES: OrgApplication["status"][] = ["new", "reviewing", "selected", "rejected"];
const STATUS_LABEL: Record<OrgApplication["status"], string> = { new: "Нова", reviewing: "Розглядається", selected: "Відібрано", rejected: "Відхилено" };
const STATUS_CHIP: Record<OrgApplication["status"], string> = { new: "bg-blue-50 text-blue-600", reviewing: "bg-amber-50 text-amber-600", selected: "bg-green-50 text-green-700", rejected: "bg-red-50 text-red-500" };
const STATUS_ACTIVE: Record<OrgApplication["status"], string> = { new: "bg-blue-500 text-white border-blue-500", reviewing: "bg-amber-400 text-white border-amber-400", selected: "bg-green-500 text-white border-green-500", rejected: "bg-red-400 text-white border-red-400" };
const STATUS_DOT: Record<OrgApplication["status"], string> = { new: "bg-blue-500", reviewing: "bg-amber-400", selected: "bg-green-500", rejected: "bg-red-400" };

// ── Export field config ───────────────────────────────────────────────
type ExportableKey =
  | "firstName" | "lastName" | "email" | "phone" | "country"
  | "institution" | "degree" | "languages" | "motivation"
  | "cvUrl" | "portfolioUrl" | "projectTitle" | "status"
  | "internalNote" | "submittedAt";

interface ExportField { key: ExportableKey; label: string; group: string; on: boolean }

const EXPORT_FIELDS: ExportField[] = [
  { key: "firstName",    label: "Ім'я",              group: "Особисті дані", on: true  },
  { key: "lastName",     label: "Прізвище",          group: "Особисті дані", on: true  },
  { key: "email",        label: "Email",             group: "Особисті дані", on: true  },
  { key: "phone",        label: "Телефон",           group: "Особисті дані", on: false },
  { key: "country",      label: "Країна",            group: "Особисті дані", on: true  },
  { key: "institution",  label: "Заклад освіти",     group: "Освіта",        on: true  },
  { key: "degree",       label: "Ступінь",           group: "Освіта",        on: true  },
  { key: "languages",    label: "Мови",              group: "Освіта",        on: true  },
  { key: "motivation",   label: "Мотиваційний лист", group: "Заявка",        on: true  },
  { key: "cvUrl",        label: "CV (посилання)",    group: "Заявка",        on: false },
  { key: "portfolioUrl", label: "Портфоліо",         group: "Заявка",        on: false },
  { key: "projectTitle", label: "Проєкт",            group: "Адмін",         on: true  },
  { key: "status",       label: "Статус",            group: "Адмін",         on: true  },
  { key: "internalNote", label: "Внутр. нотатка",   group: "Адмін",         on: false },
  { key: "submittedAt",  label: "Дата подачі",       group: "Адмін",         on: true  },
];

const COL_WIDTH: Partial<Record<ExportableKey, number>> = {
  motivation: 80, email: 28, projectTitle: 32, institution: 26, firstName: 12, lastName: 14,
};

function getFieldValue(app: OrgApplication, key: ExportableKey): string {
  if (key === "languages") return app.languages.join("; ");
  if (key === "status")    return STATUS_LABEL[app.status];
  if (key === "submittedAt") return new Date(app.submittedAt).toLocaleDateString("uk-UA");
  const val = app[key as keyof OrgApplication];
  return typeof val === "string" ? val : "";
}

function doExportCSV(apps: OrgApplication[], keys: ExportableKey[], filename = "applications") {
  const headers = keys.map((k) => EXPORT_FIELDS.find((f) => f.key === k)!.label);
  const rows = apps.map((a) => keys.map((k) => getFieldValue(a, k)));
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const el = document.createElement("a");
  el.href = url; el.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`; el.click();
  URL.revokeObjectURL(url);
}

async function doExportXLSX(apps: OrgApplication[], keys: ExportableKey[], filename = "applications") {
  const XLSX = await import("xlsx");
  const headers = keys.map((k) => EXPORT_FIELDS.find((f) => f.key === k)!.label);
  const rows = apps.map((a) => keys.map((k) => getFieldValue(a, k)));
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  ws["!cols"] = keys.map((k) => ({ wch: COL_WIDTH[k] ?? 15 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Заявки");
  XLSX.writeFile(wb, `${filename}-${new Date().toISOString().split("T")[0]}.xlsx`);
}

// ── Export modal ──────────────────────────────────────────────────────
function ExportModal({ open, apps, onClose }: { open: boolean; apps: OrgApplication[]; onClose: () => void }) {
  const [selected, setSelected] = useState<Set<ExportableKey>>(
    () => new Set(EXPORT_FIELDS.filter((f) => f.on).map((f) => f.key))
  );

  if (!open) return null;

  const groups = Array.from(new Set(EXPORT_FIELDS.map((f) => f.group)));
  const allOn = EXPORT_FIELDS.every((f) => selected.has(f.key));
  const selectedKeys = EXPORT_FIELDS.filter((f) => selected.has(f.key)).map((f) => f.key);
  const n = selected.size;
  const countLabel = `${n} ${n === 1 ? "поле" : n < 5 ? "поля" : "полів"}`;

  function toggle(key: ExportableKey) {
    setSelected((prev) => { const s = new Set(prev); if (s.has(key)) { s.delete(key); } else { s.add(key); } return s; });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col"
        style={{ maxHeight: "88vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-4 sm:pt-6 pb-4 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-foreground">Експорт заявок</h2>
            <p className="text-sm text-muted mt-0.5">
              <span className="font-semibold text-foreground">{apps.length}</span>{" "}
              {apps.length === 1 ? "заявка" : apps.length < 5 ? "заявки" : "заявок"}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-muted hover:bg-muted-bg transition-all mt-0.5 flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-border mx-6 flex-shrink-0" />

        {/* Field sections */}
        <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-6">
          {groups.map((group) => {
            const fields = EXPORT_FIELDS.filter((f) => f.group === group);
            return (
              <div key={group}>
                <p className="text-[10px] font-bold text-muted/70 uppercase tracking-[0.1em] mb-3">{group}</p>
                <div className="flex flex-wrap gap-2">
                  {fields.map((field) => {
                    const on = selected.has(field.key);
                    return (
                      <button
                        key={field.key}
                        onClick={() => toggle(field.key)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                          on
                            ? "bg-primary-light text-primary ring-1 ring-primary/20"
                            : "bg-muted-bg text-muted hover:bg-muted-bg/80 hover:text-foreground"
                        }`}
                      >
                        {on ? (
                          <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3 flex-shrink-0 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        )}
                        {field.label}
                        {field.key === "motivation" && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ${on ? "bg-primary/15 text-primary" : "bg-border text-muted"}`}>
                            ★
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 pt-4 pb-6 flex-shrink-0 border-t border-border">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <p className="text-xs text-muted">
                <span className="font-semibold text-foreground">{countLabel}</span> обрано
              </p>
              <button
                onClick={() => setSelected(allOn ? new Set() : new Set(EXPORT_FIELDS.map((f) => f.key)))}
                className="text-xs text-primary hover:underline mt-0.5"
              >
                {allOn ? "Скинути всі" : "Вибрати всі"}
              </button>
            </div>
            <button
              disabled={selected.size === 0}
              onClick={() => { doExportCSV(apps, selectedKeys); onClose(); }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:border-primary/40 hover:text-primary disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              CSV
            </button>
            <button
              disabled={selected.size === 0}
              onClick={() => { doExportXLSX(apps, selectedKeys); onClose(); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shadow-primary/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Filter state type ─────────────────────────────────────────────────
interface Filters {
  statuses: Set<OrgApplication["status"]>;
  country: string;
  institution: string;
  languages: Set<string>;
  dateFrom: string;
  dateTo: string;
}
const EMPTY_FILTERS: Filters = { statuses: new Set(), country: "", institution: "", languages: new Set(), dateFrom: "", dateTo: "" };

const PAGE_SIZE = 25;

function Pagination({ total, page, perPage, onChange }: { total: number; page: number; perPage: number; onChange: (p: number) => void }) {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  const btn = "w-8 h-8 flex items-center justify-center rounded-xl text-sm font-semibold transition-all";
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => onChange(page - 1)} disabled={page === 1} className={`${btn} border border-border text-muted hover:text-foreground hover:border-primary/30 disabled:opacity-30 disabled:cursor-not-allowed`}>‹</button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`d${i}`} className="w-8 h-8 flex items-center justify-center text-muted text-xs">…</span>
        ) : (
          <button key={p} onClick={() => onChange(p as number)} className={`${btn} ${p === page ? "bg-primary text-white" : "border border-border text-muted hover:text-foreground hover:border-primary/30"}`}>{p}</button>
        )
      )}
      <button onClick={() => onChange(page + 1)} disabled={page === totalPages} className={`${btn} border border-border text-muted hover:text-foreground hover:border-primary/30 disabled:opacity-30 disabled:cursor-not-allowed`}>›</button>
    </div>
  );
}

// ── Sort indicator ────────────────────────────────────────────────────
function SortIcon({ field, current, dir }: { field: string; current: string; dir: "asc" | "desc" }) {
  const active = field === current;
  return (
    <svg className={`w-3 h-3 ml-1 inline transition-all ${active ? "text-primary" : "text-muted/40"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {dir === "asc" || !active
        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
        : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
      }
    </svg>
  );
}

// ── Filter panel ──────────────────────────────────────────────────────
function FilterPanel({
  filters,
  onChange,
  allCountries,
  allLanguages,
}: {
  filters: Filters;
  onChange: (f: Partial<Filters>) => void;
  allCountries: string[];
  allLanguages: string[];
}) {
  const input = "w-full px-3 py-2 text-sm rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";

  function toggleStatus(s: OrgApplication["status"]) {
    const next = new Set(filters.statuses);
    if (next.has(s)) { next.delete(s); } else { next.add(s); }
    onChange({ statuses: next });
  }
  function toggleLanguage(l: string) {
    const next = new Set(filters.languages);
    if (next.has(l)) { next.delete(l); } else { next.add(l); }
    onChange({ languages: next });
  }

  return (
    <div className="bg-white rounded-2xl border border-border p-5 flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Статус */}
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2.5">Статус</p>
          <div className="flex flex-wrap gap-1.5">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => toggleStatus(s)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition-all ${
                  filters.statuses.has(s)
                    ? STATUS_ACTIVE[s]
                    : "border-border text-muted hover:border-primary/30 hover:text-foreground"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${filters.statuses.has(s) ? "bg-white/70" : STATUS_DOT[s]}`} />
                {STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Країна */}
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2.5">Країна</p>
          <select value={filters.country} onChange={(e) => onChange({ country: e.target.value })} className={input}>
            <option value="">Всі країни</option>
            {allCountries.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Заклад */}
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2.5">Заклад</p>
          <input
            value={filters.institution}
            onChange={(e) => onChange({ institution: e.target.value })}
            placeholder="Назва закладу..."
            className={input}
          />
        </div>

        {/* Мова */}
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2.5">Мова</p>
          <div className="flex flex-wrap gap-1.5">
            {allLanguages.slice(0, 6).map((l) => (
              <button
                key={l}
                onClick={() => toggleLanguage(l)}
                className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition-all ${
                  filters.languages.has(l)
                    ? "bg-primary text-white border-primary"
                    : "border-border text-muted hover:border-primary/30 hover:text-foreground"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Дата від */}
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2.5">Дата подачі від</p>
          <input type="date" value={filters.dateFrom} onChange={(e) => onChange({ dateFrom: e.target.value })} className={input} />
        </div>

        {/* Дата до */}
        <div>
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2.5">Дата подачі до</p>
          <input type="date" value={filters.dateTo} onChange={(e) => onChange({ dateTo: e.target.value })} className={input} />
        </div>
      </div>
    </div>
  );
}

// ── Bulk toolbar ──────────────────────────────────────────────────────
function BulkToolbar({
  count,
  onStatusChange,
  onExport,
  onClear,
}: {
  count: number;
  onStatusChange: (s: OrgApplication["status"]) => void;
  onExport: () => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handler(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20">
      <span className="text-sm font-semibold">Обрано {count}</span>
      <div className="w-px h-4 bg-white/20" />

      {/* Status dropdown */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 text-sm font-semibold bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-xl transition-all"
        >
          Змінити статус
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {open && (
          <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl border border-border overflow-hidden z-50 min-w-[160px]">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => { onStatusChange(s); setOpen(false); }}
                className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted-bg transition-colors first:pt-3 last:pb-3"
              >
                <span className={`w-2 h-2 rounded-full ${STATUS_DOT[s]}`} />
                <span className="font-medium text-foreground">{STATUS_LABEL[s]}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={onExport}
        className="flex items-center gap-1.5 text-sm font-semibold bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-xl transition-all"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Експортувати
      </button>

      <div className="flex-1" />
      <button onClick={onClear} className="text-white/60 hover:text-white text-sm transition-colors">
        Скасувати
      </button>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────
function ApplicationsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { org } = useOrgSession();
  const { applications, ready, updateApp } = useOrgApplications(org?.id);
  const { projects } = useOrgProjects(org?.id);

  const [projectId, setProjectId] = useState("all");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortField, setSortField] = useState<"name" | "status" | "date" | "project">("date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const [exportApps, setExportApps] = useState<OrgApplication[]>([]);

  function openExport(apps: OrgApplication[]) { setExportApps(apps); setExportOpen(true); }

  useEffect(() => {
    const p = searchParams.get("project");
    if (p) setProjectId(p);
  }, [searchParams]);

  // Reset page when any filter/sort changes
  useEffect(() => { setPage(1); }, [projectId, search, filters, sortField, sortDir]);

  // Derived unique values for filter dropdowns
  const allCountries = useMemo(() => Array.from(new Set(applications.map((a) => a.country).filter(Boolean))).sort(), [applications]);
  const allLanguages = useMemo(() => {
    const set = new Set<string>();
    applications.forEach((a) => a.languages.forEach((l) => set.add(l.split(" ")[0])));
    return Array.from(set).sort();
  }, [applications]);

  // Filtered + sorted list
  const list = useMemo(() => {
    const result = applications.filter((a) => {
      if (projectId !== "all" && a.projectId !== projectId) return false;
      if (filters.statuses.size > 0 && !filters.statuses.has(a.status)) return false;
      if (filters.country && a.country !== filters.country) return false;
      if (filters.institution && !a.institution.toLowerCase().includes(filters.institution.toLowerCase())) return false;
      if (filters.languages.size > 0 && !Array.from(filters.languages).some((l) => a.languages.some((al) => al.toLowerCase().startsWith(l.toLowerCase())))) return false;
      if (filters.dateFrom && a.submittedAt < filters.dateFrom) return false;
      if (filters.dateTo && a.submittedAt > filters.dateTo + "T23:59:59") return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return `${a.firstName} ${a.lastName} ${a.email} ${a.country} ${a.institution}`.toLowerCase().includes(q);
      }
      return true;
    });

    return result.sort((a, b) => {
      let cmp = 0;
      if (sortField === "name") cmp = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`, "uk");
      else if (sortField === "status") cmp = a.status.localeCompare(b.status);
      else if (sortField === "date") cmp = a.submittedAt.localeCompare(b.submittedAt);
      else if (sortField === "project") cmp = a.projectTitle.localeCompare(b.projectTitle, "uk");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [applications, projectId, filters, search, sortField, sortDir]);

  const paginated = useMemo(() => list.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [list, page]);

  // Active filter chips
  const filterChips = useMemo(() => [
    ...Array.from(filters.statuses).map((s) => ({
      key: `status-${s}`,
      label: STATUS_LABEL[s],
      onRemove: () => { const n = new Set(filters.statuses); n.delete(s); setFilters((f) => ({ ...f, statuses: n })); },
    })),
    filters.country ? { key: "country", label: `Країна: ${filters.country}`, onRemove: () => setFilters((f) => ({ ...f, country: "" })) } : null,
    filters.institution ? { key: "inst", label: `Заклад: ${filters.institution}`, onRemove: () => setFilters((f) => ({ ...f, institution: "" })) } : null,
    ...Array.from(filters.languages).map((l) => ({
      key: `lang-${l}`,
      label: `Мова: ${l}`,
      onRemove: () => { const n = new Set(filters.languages); n.delete(l); setFilters((f) => ({ ...f, languages: n })); },
    })),
    filters.dateFrom ? { key: "from", label: `Від: ${new Date(filters.dateFrom).toLocaleDateString("uk-UA")}`, onRemove: () => setFilters((f) => ({ ...f, dateFrom: "" })) } : null,
    filters.dateTo ? { key: "to", label: `До: ${new Date(filters.dateTo).toLocaleDateString("uk-UA")}`, onRemove: () => setFilters((f) => ({ ...f, dateTo: "" })) } : null,
  ].filter(Boolean) as { key: string; label: string; onRemove: () => void }[], [filters]);

  const hasFilters = filterChips.length > 0 || search.trim() !== "";

  // Selection helpers
  const allSelected = list.length > 0 && list.every((a) => selectedIds.has(a.id));
  const someSelected = !allSelected && list.some((a) => selectedIds.has(a.id));

  function toggleAll() {
    setSelectedIds(allSelected ? new Set() : new Set(list.map((a) => a.id)));
  }
  function toggleOne(id: string) {
    setSelectedIds((prev) => { const n = new Set(prev); if (n.has(id)) { n.delete(id); } else { n.add(id); } return n; });
  }

  function applyBulkStatus(status: OrgApplication["status"]) {
    selectedIds.forEach((id) => updateApp(id, { status }));
    setSelectedIds(new Set());
  }

  function getSelectedApps() {
    return list.filter((a) => selectedIds.has(a.id));
  }

  function toggleSort(field: typeof sortField) {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  }

  function appsForProject(id: string) {
    return id === "all" ? applications : applications.filter((a) => a.projectId === id);
  }

  // Stats for current project selection
  const projectApps = projectId === "all" ? applications : applications.filter((a) => a.projectId === projectId);
  const statusCounts: Record<string, number> = { all: projectApps.length };
  STATUSES.forEach((s) => { statusCounts[s] = projectApps.filter((a) => a.status === s).length; });

  const selectedCount = selectedIds.size;

  if (!ready) {
    return <div className="flex items-center justify-center min-h-[40vh]"><div className="w-7 h-7 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="page-transition">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-foreground">Заявки</h1>
          <p className="text-sm text-muted mt-0.5">{applications.length} заявок всього</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
              filtersOpen || filterChips.length > 0
                ? "border-primary bg-primary-light text-primary"
                : "border-border bg-white text-foreground hover:border-primary/30"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Фільтри
            {filterChips.length > 0 && (
              <span className="w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {filterChips.length}
              </span>
            )}
          </button>
          <button
            onClick={() => openExport(selectedCount > 0 ? getSelectedApps() : list)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-white text-sm font-semibold text-foreground hover:border-primary/30 hover:text-primary transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Експорт
          </button>
        </div>
      </div>

      {/* Layout: sidebar + main + detail */}
      <div className="flex gap-5 items-start">

        {/* Project sidebar */}
        <div className="hidden sm:flex flex-col w-52 flex-shrink-0 bg-white rounded-2xl border border-border overflow-hidden sticky top-24 self-start max-h-[calc(100vh-6rem)]">
          <div className="px-3 py-3 border-b border-border flex-shrink-0">
            <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">Проекти</p>
            {projects.length > 5 && (
              <div className="relative">
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  value={sidebarSearch}
                  onChange={(e) => setSidebarSearch(e.target.value)}
                  placeholder="Пошук..."
                  className="w-full pl-7 pr-2 py-1.5 text-xs rounded-lg border border-border bg-muted-bg focus:outline-none focus:border-primary transition-all"
                />
              </div>
            )}
          </div>
          <div className="p-2 flex flex-col gap-0.5 overflow-y-auto flex-1 min-h-0">
            {[{ id: "all", title: "Всі заявки" }, ...projects.filter((p) => !sidebarSearch || p.title.toLowerCase().includes(sidebarSearch.toLowerCase()))].map((p) => {
              const apps = appsForProject(p.id);
              const newCount = apps.filter((a) => a.status === "new").length;
              const selected = projectId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setProjectId(p.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center justify-between gap-2 ${
                    selected ? "bg-primary-light text-primary" : "text-muted hover:bg-muted-bg hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {p.id === "all"
                        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                      }
                    </svg>
                    <span className="text-sm font-medium truncate leading-tight">{p.title}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {newCount > 0 && <span className="w-4 h-4 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{newCount}</span>}
                    <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${selected ? "bg-primary/15 text-primary" : "bg-border/60 text-muted"}`}>{apps.length}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main list + filters */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">

          {/* Mobile project selector */}
          <div className="sm:hidden">
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
              <option value="all">Всі заявки ({applications.length})</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.title} ({appsForProject(p.id).length})</option>)}
            </select>
          </div>

          {/* Filter panel */}
          {filtersOpen && (
            <FilterPanel
              filters={filters}
              onChange={(p) => setFilters((f) => ({ ...f, ...p }))}
              allCountries={allCountries}
              allLanguages={allLanguages}
            />
          )}

          {/* Active filter chips */}
          {filterChips.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {filterChips.map((chip) => (
                <button
                  key={chip.key}
                  onClick={chip.onRemove}
                  className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 bg-primary-light text-primary rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"
                >
                  {chip.label}
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ))}
              <button onClick={() => { setFilters(EMPTY_FILTERS); setSearch(""); }} className="text-xs font-semibold text-muted hover:text-red-500 transition-colors px-1">
                Скинути всі
              </button>
            </div>
          )}

          {/* Bulk toolbar OR search + status */}
          {selectedCount > 0 ? (
            <BulkToolbar
              count={selectedCount}
              onStatusChange={applyBulkStatus}
              onExport={() => openExport(getSelectedApps())}
              onClear={() => setSelectedIds(new Set())}
            />
          ) : (
            <div className="flex flex-col gap-3">
              {/* Search */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Пошук за ім'ям, email, країною..." className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
                {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>}
              </div>

              {/* Status pills */}
              <div className="flex gap-1.5 flex-wrap">
                {([["all", "Всі"] as const, ...STATUSES.map((s) => [s, STATUS_LABEL[s]] as const)]).map(([val, lbl]) => {
                  const isActive = filters.statuses.size === 0 ? val === "all" : (val !== "all" && filters.statuses.has(val as OrgApplication["status"]));
                  return (
                    <button
                      key={val}
                      onClick={() => {
                        if (val === "all") setFilters((f) => ({ ...f, statuses: new Set() }));
                        else {
                          const n = new Set(filters.statuses);
                          const sv = val as OrgApplication["status"]; if (n.has(sv)) { n.delete(sv); } else { n.add(sv); }
                          setFilters((f) => ({ ...f, statuses: n }));
                        }
                      }}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${
                        isActive ? "bg-primary text-white" : "bg-white border border-border text-muted hover:text-foreground hover:border-primary/30"
                      }`}
                    >
                      {val !== "all" && <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-white/70" : STATUS_DOT[val as OrgApplication["status"]]}`} />}
                      {lbl}
                      <span className={`px-1 rounded text-[10px] font-bold ${isActive ? "bg-white/20" : ""}`}>
                        {statusCounts[val] ?? 0}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Results info */}
          {(hasFilters || list.length !== applications.length) && (
            <p className="text-xs text-muted -mb-2">
              Показано {list.length} {list.length === applications.length ? "" : `з ${applications.length}`} заявок
            </p>
          )}

          {/* Table */}
          {list.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border p-12 text-center">
              <div className="w-12 h-12 bg-muted-bg rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-5.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-1.414 0l-2.414-2.414A1 1 0 006.586 13H2" />
                </svg>
              </div>
              <p className="font-semibold text-foreground text-sm">Заявок не знайдено</p>
              <p className="text-xs text-muted mt-1">Змініть фільтри або пошуковий запит</p>
              {hasFilters && <button onClick={() => { setFilters(EMPTY_FILTERS); setSearch(""); }} className="mt-4 text-xs font-semibold text-primary hover:underline">Скинути фільтри</button>}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-border overflow-hidden">
              {/* Table header */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-muted-bg">
                <label className="flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = someSelected; }}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 accent-primary cursor-pointer"
                  />
                </label>
                <button onClick={() => toggleSort("name")} className="flex-1 flex items-center text-[11px] font-semibold text-muted uppercase tracking-wider hover:text-foreground transition-colors text-left">
                  Кандидат <SortIcon field="name" current={sortField} dir={sortDir} />
                </button>
                <button onClick={() => toggleSort("project")} className="hidden md:flex items-center w-36 text-[11px] font-semibold text-muted uppercase tracking-wider hover:text-foreground transition-colors flex-shrink-0">
                  Проєкт <SortIcon field="project" current={sortField} dir={sortDir} />
                </button>
                <button onClick={() => toggleSort("status")} className="flex items-center w-28 text-[11px] font-semibold text-muted uppercase tracking-wider hover:text-foreground transition-colors flex-shrink-0">
                  Статус <SortIcon field="status" current={sortField} dir={sortDir} />
                </button>
                <button onClick={() => toggleSort("date")} className="hidden sm:flex items-center w-20 text-[11px] font-semibold text-muted uppercase tracking-wider hover:text-foreground transition-colors flex-shrink-0 justify-end">
                  Дата <SortIcon field="date" current={sortField} dir={sortDir} />
                </button>
              </div>

              {/* Rows */}
              {paginated.map((app, i) => {
                const isChecked = selectedIds.has(app.id);
                return (
                  <div
                    key={app.id}
                    className={`flex items-center gap-3 px-4 py-3.5 transition-all ${i < list.length - 1 ? "border-b border-border" : ""} ${isChecked ? "bg-blue-50/60" : "hover:bg-muted-bg"}`}
                  >
                    {/* Checkbox */}
                    <label className="flex-shrink-0 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleOne(app.id)}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 accent-primary cursor-pointer"
                      />
                    </label>

                    {/* Row clickable area */}
                    <button className="flex items-center gap-3 flex-1 min-w-0 text-left" onClick={() => router.push(`/dashboard/applications/${app.id}`)}>
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                        style={{ background: "#EEF0FD", color: "#3B4FE8" }}
                      >
                        {app.firstName[0]}{app.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate text-foreground group-hover:text-primary">{app.firstName} {app.lastName}</p>
                        <p className="text-xs text-muted truncate">{app.country} · {app.institution}</p>
                      </div>
                    </button>

                    {/* Project */}
                    <p className="hidden md:block text-xs text-muted truncate w-36 flex-shrink-0">{app.projectTitle}</p>

                    {/* Status */}
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full w-28 flex-shrink-0 text-center ${STATUS_CHIP[app.status]}`}>{STATUS_LABEL[app.status]}</span>

                    {/* Date */}
                    <span className="hidden sm:block text-xs text-muted w-20 text-right flex-shrink-0">
                      {new Date(app.submittedAt).toLocaleDateString("uk-UA", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                );
              })}

              {/* Footer */}
              <div className="px-4 py-2.5 bg-muted-bg/60 border-t border-border">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <p className="text-xs text-muted">
                    {list.length > PAGE_SIZE
                      ? `Показано ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, list.length)} з ${list.length}`
                      : `${list.length} ${list.length === 1 ? "заявка" : list.length < 5 ? "заявки" : "заявок"}${list.length !== applications.length ? ` з ${applications.length}` : ""}`
                    }
                  </p>
                  <div className="flex items-center gap-3">
                    {selectedCount > 0 && <p className="text-xs font-semibold text-primary">Обрано: {selectedCount}</p>}
                    <Pagination total={list.length} page={page} perPage={PAGE_SIZE} onChange={setPage} />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <ExportModal open={exportOpen} apps={exportApps} onClose={() => setExportOpen(false)} />
      </div>
    </div>
  );
}

export default function ApplicationsPage() {
  return <ApplicationsContent />;
}
