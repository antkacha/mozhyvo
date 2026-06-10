"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useOrgSession } from "@/hooks/useOrgSession";
import { useOrgProjects, OrgProject } from "@/hooks/useOrgProjects";
import { useOrgApplications } from "@/hooks/useOrgApplications";
import OrgShell from "@/components/OrgShell";

const PAGE_SIZE = 20;

const TYPE_INFO: Record<string, { label: string; pill: string; dot: string }> = {
  exchange:    { label: "Обмін",        pill: "bg-green-50 text-green-700",   dot: "bg-green-500" },
  grant:       { label: "Грант",        pill: "bg-yellow-50 text-yellow-700", dot: "bg-yellow-400" },
  internship:  { label: "Стажування",   pill: "bg-blue-50 text-blue-700",     dot: "bg-blue-500" },
  volunteer:   { label: "Волонтерство", pill: "bg-teal-50 text-teal-700",     dot: "bg-teal-500" },
  conference:  { label: "Конференція",  pill: "bg-pink-50 text-pink-700",     dot: "bg-pink-500" },
  competition: { label: "Конкурс",      pill: "bg-orange-50 text-orange-700", dot: "bg-orange-500" },
  hackathon:   { label: "Хакатон",      pill: "bg-red-50 text-red-700",       dot: "bg-red-500" },
  training:    { label: "Навчання",     pill: "bg-violet-50 text-violet-700", dot: "bg-violet-500" },
};

const STATUS_LABEL: Record<OrgProject["status"], string> = {
  published: "Опубліковано",
  draft: "Чернетка",
  closed: "Закрито",
};
const STATUS_PILL: Record<OrgProject["status"], string> = {
  published: "bg-green-50 text-green-700",
  draft: "bg-amber-50 text-amber-600",
  closed: "bg-muted-bg text-muted",
};
const STATUS_DOT: Record<OrgProject["status"], string> = {
  published: "bg-green-500",
  draft: "bg-amber-400",
  closed: "bg-gray-400",
};

type SortKey = "title" | "deadline" | "apps" | "created";

const SORT_OPTIONS: Array<{ value: string; key: SortKey; dir: "asc" | "desc"; label: string }> = [
  { value: "created-desc", key: "created",  dir: "desc", label: "Новіші спочатку" },
  { value: "created-asc",  key: "created",  dir: "asc",  label: "Старіші спочатку" },
  { value: "deadline-asc", key: "deadline", dir: "asc",  label: "Дедлайн: ближчий" },
  { value: "deadline-desc",key: "deadline", dir: "desc", label: "Дедлайн: дальший" },
  { value: "apps-desc",    key: "apps",     dir: "desc", label: "Заявки: більше" },
  { value: "apps-asc",     key: "apps",     dir: "asc",  label: "Заявки: менше" },
  { value: "title-asc",    key: "title",    dir: "asc",  label: "Назва А→Я" },
  { value: "title-desc",   key: "title",    dir: "desc", label: "Назва Я→А" },
];

const STATUS_TABS = [
  { val: "all" as const,       label: "Всі",          dot: "" },
  { val: "published" as const, label: "Опубліковані", dot: STATUS_DOT.published },
  { val: "draft" as const,     label: "Чернетки",     dot: STATUS_DOT.draft },
  { val: "closed" as const,    label: "Закриті",      dot: STATUS_DOT.closed },
];

function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  return (
    <svg className={`w-3 h-3 ml-1 inline transition-all ${active ? "text-primary" : "text-muted/30"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {!active || dir === "asc"
        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
        : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
      }
    </svg>
  );
}

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

const selectStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2.5'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat" as const,
  backgroundPosition: "right 12px center",
};

function ProjectsContent() {
  const { org } = useOrgSession();
  const { projects, update, remove } = useOrgProjects(org?.id);
  const { applications } = useOrgApplications(org?.id);

  const [statusFilter, setStatusFilter] = useState<OrgProject["status"] | "all">("all");
  const [typeFilter, setTypeFilter]     = useState("all");
  const [search, setSearch]             = useState("");
  const [sortKey, setSortKey]           = useState<SortKey>("created");
  const [sortDir, setSortDir]           = useState<"asc" | "desc">("desc");
  const [page, setPage]                 = useState(1);
  const [deleteId, setDeleteId]         = useState<string | null>(null);

  const allTypes = useMemo(() => Array.from(new Set(projects.map((p) => p.type))), [projects]);

  const counts = useMemo(() => ({
    all:       projects.length,
    published: projects.filter((p) => p.status === "published").length,
    draft:     projects.filter((p) => p.status === "draft").length,
    closed:    projects.filter((p) => p.status === "closed").length,
  }), [projects]);

  const appCountMap = useMemo(() => {
    const app: Record<string, number> = {};
    const newApps: Record<string, number> = {};
    applications.forEach((a) => {
      app[a.projectId] = (app[a.projectId] ?? 0) + 1;
      if (a.status === "new") newApps[a.projectId] = (newApps[a.projectId] ?? 0) + 1;
    });
    return { app, new: newApps };
  }, [applications]);

  const filtered = useMemo(() => {
    let result = [...projects];
    if (statusFilter !== "all") result = result.filter((p) => p.status === statusFilter);
    if (typeFilter !== "all") result = result.filter((p) => p.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(q) || p.shortDescription.toLowerCase().includes(q));
    }
    result.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "title")    cmp = a.title.localeCompare(b.title, "uk");
      else if (sortKey === "deadline") cmp = (a.deadline || "9999").localeCompare(b.deadline || "9999");
      else if (sortKey === "apps") cmp = (appCountMap.app[a.id] ?? 0) - (appCountMap.app[b.id] ?? 0);
      else cmp = a.createdAt.localeCompare(b.createdAt);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return result;
  }, [projects, statusFilter, typeFilter, search, sortKey, sortDir, appCountMap]);

  const paginated = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);

  function reset() { setPage(1); }

  function handleSortSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const opt = SORT_OPTIONS.find((o) => o.value === e.target.value);
    if (opt) { setSortKey(opt.key); setSortDir(opt.dir); reset(); }
  }

  function toggleSortCol(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir(key === "deadline" ? "asc" : "desc"); }
    reset();
  }

  return (
    <div className="page-transition">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground">Проекти</h1>
          <p className="text-sm text-muted mt-0.5">
            {counts.all === 0 ? "Ще немає проектів" : `${counts.all} ${counts.all === 1 ? "проект" : counts.all < 5 ? "проекти" : "проектів"}`}
          </p>
        </div>
        <Link href="/dashboard/projects/new" className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm shadow-primary/20 flex-shrink-0">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Новий проект
        </Link>
      </div>

      {/* Search + controls */}
      <div className="flex flex-col sm:flex-row gap-2.5 mb-5">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); reset(); }}
            placeholder="Пошук за назвою або описом..."
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          {search && (
            <button onClick={() => { setSearch(""); reset(); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {allTypes.length > 1 && (
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); reset(); }} className="px-3.5 py-2.5 text-sm rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium appearance-none pr-8 cursor-pointer min-w-[140px]" style={selectStyle}>
            <option value="all">Всі типи</option>
            {allTypes.map((t) => <option key={t} value={t}>{TYPE_INFO[t]?.label ?? t}</option>)}
          </select>
        )}

        <select value={`${sortKey}-${sortDir}`} onChange={handleSortSelect} className="px-3.5 py-2.5 text-sm rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium appearance-none pr-8 cursor-pointer min-w-[170px]" style={selectStyle}>
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-muted-bg p-1 rounded-2xl w-fit mb-5 text-sm overflow-x-auto">
        {STATUS_TABS.map(({ val, label, dot }) => (
          <button
            key={val}
            onClick={() => { setStatusFilter(val); reset(); }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold transition-all whitespace-nowrap ${statusFilter === val ? "bg-white text-foreground shadow-sm" : "text-muted hover:text-foreground"}`}
          >
            {dot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />}
            {label}
            <span className={`text-[11px] font-bold px-1.5 h-4 rounded-full flex items-center justify-center ${statusFilter === val ? "bg-primary text-white" : "bg-border text-muted"}`}>
              {counts[val]}
            </span>
          </button>
        ))}
      </div>

      {/* Results hint */}
      {(search || typeFilter !== "all") && filtered.length !== projects.length && (
        <p className="text-xs text-muted mb-3">Знайдено {filtered.length} з {projects.length}</p>
      )}

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-16 text-center">
          <div className="w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
            </svg>
          </div>
          {projects.length === 0 ? (
            <>
              <p className="font-semibold text-foreground mb-1">Проектів ще немає</p>
              <p className="text-sm text-muted mb-6">Створіть перший проект та залучайте учасників</p>
              <Link href="/dashboard/projects/new" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all">
                Створити проект
              </Link>
            </>
          ) : (
            <>
              <p className="font-semibold text-foreground mb-1">Нічого не знайдено</p>
              <p className="text-sm text-muted mb-4">Змініть фільтри або пошуковий запит</p>
              <button onClick={() => { setSearch(""); setTypeFilter("all"); setStatusFilter("all"); reset(); }} className="text-sm font-semibold text-primary hover:underline">
                Скинути фільтри
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-border overflow-hidden">

          {/* Column header — desktop */}
          <div className="hidden md:flex items-center gap-3 px-5 py-3 border-b border-border bg-muted-bg/50 text-[11px] font-semibold text-muted uppercase tracking-wider">
            <button onClick={() => toggleSortCol("title")} className="flex-1 flex items-center hover:text-foreground transition-colors text-left">
              Проект <SortIcon active={sortKey === "title"} dir={sortDir} />
            </button>
            <div className="w-24 flex-shrink-0">Тип</div>
            <button onClick={() => toggleSortCol("deadline")} className="w-28 flex-shrink-0 flex items-center hover:text-foreground transition-colors">
              Дедлайн <SortIcon active={sortKey === "deadline"} dir={sortDir} />
            </button>
            <button onClick={() => toggleSortCol("apps")} className="w-16 flex-shrink-0 flex items-center justify-end hover:text-foreground transition-colors">
              Заявки <SortIcon active={sortKey === "apps"} dir={sortDir} />
            </button>
            <div className="w-[100px] flex-shrink-0 text-right">Дії</div>
          </div>

          {/* Rows */}
          {paginated.map((p, i) => {
            const appCount = appCountMap.app[p.id] ?? 0;
            const newCount = appCountMap.new[p.id] ?? 0;
            const typeInfo = TYPE_INFO[p.type];
            const daysLeft = p.deadline ? Math.ceil((new Date(p.deadline).getTime() - Date.now()) / 86400000) : null;
            const deadlinePast = daysLeft !== null && daysLeft < 0;
            const deadlineSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3 && p.status === "published";

            return (
              <div
                key={p.id}
                className={`group flex flex-col md:flex md:flex-row md:items-center gap-2 md:gap-3 px-5 py-4 transition-colors hover:bg-muted-bg/30 ${i < paginated.length - 1 ? "border-b border-border" : ""}`}
              >
                {/* Title */}
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${typeInfo?.dot ?? "bg-muted"}`} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <Link href={`/dashboard/projects/${p.id}`} className="font-semibold text-sm text-foreground hover:text-primary transition-colors">
                        {p.title}
                      </Link>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_PILL[p.status]}`}>
                        {STATUS_LABEL[p.status]}
                      </span>
                    </div>
                    <p className="text-xs text-muted truncate">{p.flag} {p.location}{p.shortDescription ? ` · ${p.shortDescription}` : ""}</p>
                  </div>
                </div>

                {/* Type */}
                <div className="w-full md:w-24 flex-shrink-0">
                  <span className={`inline-flex text-[11px] font-semibold px-2 py-1 rounded-lg ${typeInfo?.pill ?? "bg-muted-bg text-muted"}`}>
                    {p.typeName}
                  </span>
                </div>

                {/* Deadline */}
                <div className="w-full md:w-28 flex-shrink-0">
                  {p.deadline ? (
                    <span className={`text-xs font-medium ${deadlinePast ? "text-muted line-through" : deadlineSoon ? "text-amber-600 font-semibold" : "text-foreground"}`}>
                      {deadlineSoon && "⚡ "}{p.deadlineDisplay}
                      {deadlineSoon && daysLeft !== null && <span className="ml-1 text-[10px] text-amber-400">({daysLeft}д)</span>}
                    </span>
                  ) : (
                    <span className="text-xs text-muted">—</span>
                  )}
                </div>

                {/* Apps */}
                <div className="w-full md:w-16 flex-shrink-0 md:flex md:items-center md:justify-end">
                  <Link href={`/dashboard/applications?project=${p.id}`} className="inline-flex items-center gap-1.5 hover:opacity-70 transition-opacity">
                    <span className="text-base font-black text-primary leading-none">{appCount}</span>
                    {newCount > 0 && (
                      <span className="w-4 h-4 bg-blue-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                        {newCount}
                      </span>
                    )}
                  </Link>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 w-full md:w-[100px] flex-shrink-0 md:justify-end md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => update(p.id, { status: p.status === "published" ? "draft" : "published" })}
                    title={p.status === "published" ? "Зняти з публікації" : "Опублікувати"}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${p.status === "published" ? "text-amber-500 hover:bg-amber-50" : "text-green-600 hover:bg-green-50"}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {p.status === "published" ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      ) : (
                        <>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </>
                      )}
                    </svg>
                  </button>

                  <Link href={`/dashboard/projects/${p.id}`} title="Редагувати" className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-primary hover:bg-primary-light transition-all">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Link>

                  <button onClick={() => setDeleteId(p.id)} title="Видалити" className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-red-500 hover:bg-red-50 transition-all">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}

          {/* Footer */}
          <div className="px-5 py-2.5 bg-muted-bg/40 border-t border-border flex items-center justify-between gap-4 flex-wrap">
            <p className="text-xs text-muted">
              {filtered.length > PAGE_SIZE
                ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} з ${filtered.length}`
                : `${filtered.length} ${filtered.length === 1 ? "проект" : filtered.length < 5 ? "проекти" : "проектів"}`}
            </p>
            <Pagination total={filtered.length} page={page} perPage={PAGE_SIZE} onChange={setPage} />
          </div>
        </div>
      )}

      {/* Delete modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-7">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-foreground text-center mb-2">Видалити проект?</h3>
            <p className="text-sm text-muted text-center mb-6 leading-relaxed">
              Цю дію не можна скасувати. Заявки на цей проект залишаться в системі.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted-bg transition-all">
                Скасувати
              </button>
              <button onClick={() => { remove(deleteId); setDeleteId(null); }} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-all">
                Видалити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  return <OrgShell><ProjectsContent /></OrgShell>;
}
