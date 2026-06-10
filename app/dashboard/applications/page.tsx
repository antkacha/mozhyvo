"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useOrgSession } from "@/hooks/useOrgSession";
import { useOrgApplications, OrgApplication } from "@/hooks/useOrgApplications";
import { useOrgProjects } from "@/hooks/useOrgProjects";
import OrgShell from "@/components/OrgShell";

// ── Status config ─────────────────────────────────────────────────────
const STATUSES: OrgApplication["status"][] = ["new", "reviewing", "selected", "rejected"];
const STATUS_LABEL: Record<OrgApplication["status"], string> = { new: "Нова", reviewing: "Розглядається", selected: "Відібрано", rejected: "Відхилено" };
const STATUS_CHIP: Record<OrgApplication["status"], string> = { new: "bg-blue-50 text-blue-600", reviewing: "bg-amber-50 text-amber-600", selected: "bg-green-50 text-green-700", rejected: "bg-red-50 text-red-500" };
const STATUS_ACTIVE: Record<OrgApplication["status"], string> = { new: "bg-blue-500 text-white border-blue-500", reviewing: "bg-amber-400 text-white border-amber-400", selected: "bg-green-500 text-white border-green-500", rejected: "bg-red-400 text-white border-red-400" };
const STATUS_DOT: Record<OrgApplication["status"], string> = { new: "bg-blue-500", reviewing: "bg-amber-400", selected: "bg-green-500", rejected: "bg-red-400" };

// ── Export helpers ────────────────────────────────────────────────────
function exportCSV(apps: OrgApplication[], filename = "applications") {
  const headers = ["Ім'я", "Прізвище", "Email", "Телефон", "Країна", "Заклад", "Ступінь", "Мови", "Проєкт", "Статус", "Дата подачі"];
  const rows = apps.map((a) => [
    a.firstName, a.lastName, a.email, a.phone ?? "", a.country,
    a.institution, a.degree, a.languages.join("; "),
    a.projectTitle, STATUS_LABEL[a.status],
    new Date(a.submittedAt).toLocaleDateString("uk-UA"),
  ]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${filename}-${new Date().toISOString().split("T")[0]}.csv`; a.click();
  URL.revokeObjectURL(url);
}

async function exportXLSX(apps: OrgApplication[], filename = "applications") {
  const XLSX = await import("xlsx");
  const data = [
    ["Ім'я", "Прізвище", "Email", "Телефон", "Країна", "Заклад", "Ступінь", "Мови", "Проєкт", "Статус", "Дата подачі"],
    ...apps.map((a) => [
      a.firstName, a.lastName, a.email, a.phone ?? "", a.country,
      a.institution, a.degree, a.languages.join("; "),
      a.projectTitle, STATUS_LABEL[a.status],
      new Date(a.submittedAt).toLocaleDateString("uk-UA"),
    ]),
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws["!cols"] = [10, 12, 24, 14, 14, 22, 16, 20, 28, 16, 14].map((w) => ({ wch: w }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Заявки");
  XLSX.writeFile(wb, `${filename}-${new Date().toISOString().split("T")[0]}.xlsx`);
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

// ── Export dropdown ───────────────────────────────────────────────────
function ExportDropdown({ onCSV, onXLSX }: { onCSV: () => void; onXLSX: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-white text-sm font-semibold text-foreground hover:border-primary/30 hover:text-primary transition-all"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Експорт
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-border overflow-hidden z-50 min-w-[180px]">
          <button
            onClick={() => { onCSV(); setOpen(false); }}
            className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted-bg transition-colors"
          >
            <span className="text-base">📄</span>
            <div>
              <p className="font-semibold text-foreground">Експорт CSV</p>
              <p className="text-xs text-muted">Відкривається в Excel</p>
            </div>
          </button>
          <button
            onClick={() => { onXLSX(); setOpen(false); }}
            className="w-full text-left flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted-bg transition-colors border-t border-border"
          >
            <span className="text-base">📊</span>
            <div>
              <p className="font-semibold text-foreground">Експорт Excel (.xlsx)</p>
              <p className="text-xs text-muted">З форматуванням</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────
function ApplicationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const p = searchParams.get("project");
    if (p) setProjectId(p);
  }, [searchParams]);

  // Close detail when project changes
  useEffect(() => { setOpenId(null); }, [projectId]);

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

  const openApp = list.find((a) => a.id === openId) ?? null;
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
          <ExportDropdown
            onCSV={() => exportCSV(selectedCount > 0 ? getSelectedApps() : list)}
            onXLSX={() => exportXLSX(selectedCount > 0 ? getSelectedApps() : list)}
          />
        </div>
      </div>

      {/* Layout: sidebar + main + detail */}
      <div className="flex gap-5 items-start">

        {/* Project sidebar */}
        <div className="hidden sm:flex flex-col w-52 flex-shrink-0 bg-white rounded-2xl border border-border overflow-hidden sticky top-24 self-start">
          <div className="px-3 py-3 border-b border-border">
            <p className="text-[11px] font-semibold text-muted uppercase tracking-wider">Проекти</p>
          </div>
          <div className="p-2 flex flex-col gap-0.5">
            {[{ id: "all", title: "Всі заявки" }, ...projects].map((p) => {
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
        <div className={`flex-1 min-w-0 flex flex-col gap-4 ${openApp ? "hidden lg:flex" : "flex"}`}>

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
              onExport={() => exportCSV(getSelectedApps(), "selected-applications")}
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
              {list.map((app, i) => {
                const isOpen = openId === app.id;
                const isChecked = selectedIds.has(app.id);
                return (
                  <div
                    key={app.id}
                    className={`flex items-center gap-3 px-4 py-3.5 transition-all ${i < list.length - 1 ? "border-b border-border" : ""} ${isOpen ? "bg-primary-light" : isChecked ? "bg-blue-50/60" : "hover:bg-muted-bg"}`}
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
                        style={isOpen ? { background: "linear-gradient(135deg,#3B4FE8,#7C3AED)", color: "#fff" } : { background: "#EEF0FD", color: "#3B4FE8" }}
                      >
                        {app.firstName[0]}{app.lastName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isOpen ? "text-primary" : "text-foreground"}`}>{app.firstName} {app.lastName}</p>
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
              <div className="flex items-center justify-between px-4 py-2.5 bg-muted-bg/60 border-t border-border">
                <p className="text-xs text-muted">
                  {list.length} {list.length === 1 ? "заявка" : list.length < 5 ? "заявки" : "заявок"}
                  {list.length !== applications.length && ` з ${applications.length}`}
                </p>
                {selectedCount > 0 && <p className="text-xs font-semibold text-primary">Обрано: {selectedCount}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Mini detail preview when open on list page (redirect to detail instead) */}
        {openApp && (
          <div className="hidden lg:flex w-72 flex-shrink-0 bg-white rounded-2xl border border-border p-5 flex-col gap-3 sticky top-24 self-start">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto text-white font-black text-base shadow-sm"
              style={{ background: "linear-gradient(135deg,#3B4FE8,#7C3AED)" }}
            >
              {openApp.firstName[0]}{openApp.lastName[0]}
            </div>
            <div className="text-center">
              <p className="font-bold text-foreground">{openApp.firstName} {openApp.lastName}</p>
              <p className="text-xs text-muted mt-0.5">{openApp.institution}</p>
              <span className={`inline-block mt-2 text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_CHIP[openApp.status]}`}>{STATUS_LABEL[openApp.status]}</span>
            </div>
            <Link href={`/dashboard/applications/${openApp.id}`} className="w-full text-center px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all">
              Відкрити повністю →
            </Link>
            <button onClick={() => setOpenId(null)} className="w-full text-center text-xs text-muted hover:text-foreground transition-colors py-1">Закрити</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ApplicationsPage() {
  return <OrgShell><ApplicationsContent /></OrgShell>;
}
