"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  opportunities,
  typeNames,
  fundingLabels,
  formatLabels,
  categorySlugToType,
  type OpportunityType,
  type FundingType,
  type FormatType,
} from "@/lib/data";
import { getDaysUntilDeadline } from "@/lib/recommendations";
import OpportunityCard from "@/components/OpportunityCard";
import { SkeletonGrid } from "@/components/SkeletonCard";
import { usePublicOrgProjects } from "@/hooks/usePublicOrgProjects";

const PER_PAGE = 12;
const SORT_OPTIONS = [
  { value: "newest",   label: "Найновіші" },
  { value: "deadline", label: "За дедлайном" },
  { value: "popular",  label: "Популярні" },
] as const;
type SortValue = typeof SORT_OPTIONS[number]["value"];

const ALL_TYPES    = Object.keys(typeNames) as OpportunityType[];
const ALL_FORMATS  = ["online", "offline", "hybrid"] as FormatType[];
const ALL_FUNDINGS = ["fully-funded", "partially-funded", "self-funded"] as FundingType[];

// ── Checkbox row ────────────────────────────────────────────────────
function CheckRow({
  label, count, checked, onChange,
}: { label: string; count?: number; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group py-0.5">
      <input
        type="checkbox" checked={checked} onChange={onChange}
        className="w-4 h-4 rounded border-border accent-primary cursor-pointer flex-shrink-0"
      />
      <span className="text-sm text-muted group-hover:text-foreground transition-colors leading-tight flex-1">{label}</span>
      {count !== undefined && <span className="text-xs text-muted tabular-nums">{count}</span>}
    </label>
  );
}

// ── Collapsible filter section ──────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-border pb-4 mb-4 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left mb-2"
      >
        <span className="text-xs font-semibold text-foreground uppercase tracking-wider">{title}</span>
        <svg className={`w-3.5 h-3.5 text-muted transition-transform ${open ? "" : "-rotate-90"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        style={{
          display: "grid",
          gridTemplateRows: open ? "1fr" : "0fr",
          transition: "grid-template-rows 0.25s ease",
        }}
      >
        <div style={{ overflow: "hidden" }}>
          <div className="flex flex-col gap-1.5">{children}</div>
        </div>
      </div>
    </div>
  );
}

// ── Urgent deadline banner ───────────────────────────────────────────
function UrgentRow({ items }: { items: typeof opportunities }) {
  if (items.length === 0) return null;
  return (
    <div className="mb-7">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-bold text-red-600">⏰ Спливає скоро</span>
        <span className="text-xs text-muted">— дедлайн до 7 днів</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-none">
        {items.map((opp) => {
          const days = getDaysUntilDeadline(opp.deadline);
          return (
            <a
              key={opp.slug}
              href={`/opportunities/${opp.slug}`}
              className="flex-shrink-0 w-60 bg-white border border-red-200 border-t-4 border-t-red-500 rounded-2xl p-4 hover:shadow-md transition-all group"
            >
              <p className="text-[11px] font-semibold text-red-600 mb-1">
                {days === 0 ? "Сьогодні!" : `${days} ${days === 1 ? "день" : "дні"} залишилось`}
              </p>
              <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">{opp.title}</p>
              <p className="text-xs text-muted mt-1 truncate">{opp.org}</p>
            </a>
          );
        })}
      </div>
    </div>
  );
}

// ── Main catalog component ───────────────────────────────────────────
export default function OpportunitiesCatalog() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(true);
  const { projects: orgProjects } = usePublicOrgProjects();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialise from URL
  const initCat    = params.get("category");
  const initTypes  = (initCat && categorySlugToType[initCat]) ? [categorySlugToType[initCat]] : [] as OpportunityType[];

  const [rawSearch, setRawSearch] = useState(params.get("q") ?? "");
  const [search,    setSearch]    = useState(params.get("q") ?? "");
  const [types,     setTypes]     = useState<OpportunityType[]>(initTypes);
  const [formats,   setFormats]   = useState<FormatType[]>([]);
  const [fundings,  setFundings]  = useState<FundingType[]>([]);
  const [countries, setCountries] = useState<string[]>(params.get("country") ? [params.get("country")!] : []);
  const [languages, setLanguages] = useState<string[]>([]);
  const [sort,      setSort]      = useState<SortValue>((params.get("sort") as SortValue) ?? "newest");
  const [page,      setPage]      = useState(parseInt(params.get("page") ?? "1") || 1);
  const [gridKey,   setGridKey]   = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  // 300ms debounce on search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setSearch(rawSearch); setPage(1); }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [rawSearch]);

  // Sync filters → URL (shallow replace)
  const syncUrl = useCallback(() => {
    const p = new URLSearchParams();
    if (search) p.set("q", search);
    if (types.length === 1) {
      const slug = Object.entries(categorySlugToType).find(([, v]) => v === types[0])?.[0];
      if (slug) p.set("category", slug);
    }
    if (sort !== "newest") p.set("sort", sort);
    if (page > 1) p.set("page", String(page));
    if (countries.length === 1) p.set("country", countries[0]);
    const qs = p.toString();
    router.replace(qs ? `/opportunities?${qs}` : "/opportunities", { scroll: false });
  }, [search, types, sort, page, countries, router]);

  useEffect(() => { syncUrl(); }, [syncUrl]);

  const resetPage = useCallback(() => { setPage(1); setGridKey((k) => k + 1); }, []);

  function toggle<T>(arr: T[], setArr: (v: T[]) => void, val: T) {
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
    resetPage();
  }

  function clearAll() {
    setRawSearch(""); setSearch("");
    setTypes([]); setFormats([]); setFundings([]);
    setCountries([]); setLanguages([]);
    setSort("newest"); setPage(1); setGridKey((k) => k + 1);
  }

  // Merge static + Supabase org projects
  const allOpportunities = useMemo(() => [...opportunities, ...orgProjects], [orgProjects]);

  // Derived filter options — computed from live data
  const allCountries = useMemo(
    () => Array.from(new Set(allOpportunities.map((o) => o.country).filter(Boolean))).sort(),
    [allOpportunities]
  );
  const allLanguages = useMemo(
    () => Array.from(new Set(allOpportunities.flatMap((o) => o.languages.map((l) => l.split(" ")[0])))).sort(),
    [allOpportunities]
  );

  // Filtered + sorted list
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const filtered = useMemo(() => {
    let result = allOpportunities.filter((o) => {
      // hide expired (only if deadline is a real date, not empty/rolling)
      if (o.deadline && o.deadline.match(/^\d{4}-\d{2}-\d{2}$/) && o.deadline < today) return false; // eslint-disable-line react-hooks/exhaustive-deps
      if (types.length > 0    && !types.includes(o.type))      return false;
      if (formats.length > 0  && !formats.includes(o.format))  return false;
      if (fundings.length > 0 && !fundings.includes(o.funding)) return false;
      if (countries.length > 0 && !countries.includes(o.country)) return false;
      if (languages.length > 0 && !languages.some((l) =>
        o.languages.some((ol) => ol.toLowerCase().startsWith(l.toLowerCase()))
      )) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          o.title.toLowerCase().includes(q) ||
          o.org.toLowerCase().includes(q) ||
          o.shortDescription.toLowerCase().includes(q) ||
          o.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });

    if (sort === "deadline") {
      result = [...result].sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    } else if (sort === "popular") {
      result = [...result].sort((a) => (a.featured ? -1 : 1));
    }
    return result;
  }, [allOpportunities, types, formats, fundings, countries, languages, search, sort]);

  const urgent = useMemo(() =>
    allOpportunities.filter((o) => { const d = getDaysUntilDeadline(o.deadline); return d >= 0 && d <= 7; }).slice(0, 8),
  [allOpportunities]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const activeChips: { label: string; remove: () => void }[] = [
    ...types.map((t)     => ({ label: typeNames[t],     remove: () => toggle(types, setTypes, t) })),
    ...formats.map((f)   => ({ label: formatLabels[f],  remove: () => toggle(formats, setFormats, f) })),
    ...fundings.map((f)  => ({ label: fundingLabels[f], remove: () => toggle(fundings, setFundings, f) })),
    ...countries.map((c) => ({ label: c,                remove: () => toggle(countries, setCountries, c) })),
    ...languages.map((l) => ({ label: `Мова: ${l}`,     remove: () => toggle(languages, setLanguages, l) })),
  ];
  const activeCount = activeChips.length;

  function FilterPanel() {
    return (
      <div>
        <Section title="Тип">
          {ALL_TYPES.map((t) => (
            <CheckRow key={t} label={typeNames[t]}
              count={allOpportunities.filter((o) => o.type === t).length}
              checked={types.includes(t)}
              onChange={() => toggle(types, setTypes, t)} />
          ))}
        </Section>
        <Section title="Формат">
          {ALL_FORMATS.map((f) => (
            <CheckRow key={f} label={formatLabels[f]}
              count={filtered.filter((o) => o.format === f).length}
              checked={formats.includes(f)}
              onChange={() => toggle(formats, setFormats, f)} />
          ))}
        </Section>
        <Section title="Фінансування">
          {ALL_FUNDINGS.map((f) => (
            <CheckRow key={f} label={fundingLabels[f]}
              checked={fundings.includes(f)}
              onChange={() => toggle(fundings, setFundings, f)} />
          ))}
        </Section>
        <Section title="Країна">
          <div className="max-h-44 overflow-y-auto flex flex-col gap-1.5 pr-1">
            {allCountries.map((c) => (
              <CheckRow key={c} label={c}
                count={filtered.filter((o) => o.country === c).length}
                checked={countries.includes(c)}
                onChange={() => toggle(countries, setCountries, c)} />
            ))}
          </div>
        </Section>
        <Section title="Мова">
          <div className="flex flex-wrap gap-1.5">
            {allLanguages.map((l) => (
              <button
                key={l}
                onClick={() => toggle(languages, setLanguages, l)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-xl border transition-all ${
                  languages.includes(l)
                    ? "bg-primary text-white border-primary"
                    : "border-border text-muted hover:border-primary/30 hover:text-foreground"
                }`}
              >{l}</button>
            ))}
          </div>
        </Section>
      </div>
    );
  }

  if (loading) return <SkeletonGrid />;

  return (
    <div>
      <UrgentRow items={urgent} />

      {/* Search + sort */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text" value={rawSearch}
            onChange={(e) => setRawSearch(e.target.value)}
            placeholder="Пошук за назвою, організацією, тегами..."
            className="w-full pl-11 pr-10 py-3 text-sm border border-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white shadow-sm"
          />
          {rawSearch && (
            <button onClick={() => { setRawSearch(""); setSearch(""); }} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
        <select
          value={sort} onChange={(e) => { setSort(e.target.value as SortValue); resetPage(); }}
          className="text-sm border border-border rounded-2xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground flex-shrink-0 shadow-sm"
        >
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden flex items-center gap-2 px-4 py-3 border border-border rounded-2xl text-sm font-medium hover:border-primary hover:text-primary transition-all bg-white flex-shrink-0 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 8h10M11 12h4" /></svg>
          Фільтри
          {activeCount > 0 && <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">{activeCount}</span>}
        </button>
      </div>

      {/* Active chips */}
      {activeChips.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-5">
          {activeChips.map((chip) => (
            <button key={chip.label} onClick={chip.remove}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 bg-primary-light text-primary rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"
            >
              {chip.label}
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          ))}
          <button onClick={clearAll} className="text-xs text-muted hover:text-red-500 transition-colors font-medium px-1">Скинути всі</button>
        </div>
      )}

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-56 flex-shrink-0">
          <div className="sticky top-24">
            <div className="bg-white rounded-2xl border border-border p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <p className="font-bold text-sm text-foreground">Фільтри</p>
                {activeCount > 0 && (
                  <button onClick={clearAll} className="text-xs text-primary hover:underline font-medium">
                    Очистити ({activeCount})
                  </button>
                )}
              </div>
              <FilterPanel />
            </div>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5 gap-3">
            <p className="text-sm text-muted">Знайдено: <span className="font-semibold text-foreground">{filtered.length}</span> можливостей</p>
            {activeCount > 0 && <button onClick={clearAll} className="text-xs text-primary hover:underline lg:hidden">Очистити ({activeCount})</button>}
          </div>

          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border p-16 text-center">
              <p className="text-5xl mb-4">🔍</p>
              <p className="font-semibold text-foreground mb-2">Нічого не знайдено</p>
              <p className="text-sm text-muted mb-5">Спробуй змінити фільтри або пошуковий запит</p>
              <button onClick={clearAll} className="text-sm font-semibold text-primary hover:underline">Очистити всі фільтри</button>
            </div>
          ) : (
            <>
              <div key={gridKey} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {paginated.map((opp, i) => <OpportunityCard key={opp.slug} opp={opp} index={i} />)}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
                  <button onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-xl border border-border text-sm font-medium text-muted hover:border-primary hover:text-primary transition-all disabled:opacity-30 disabled:pointer-events-none"
                  >← Назад</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
                    Math.max(0, page - 3), Math.min(totalPages, page + 2)
                  ).map((p) => (
                    <button key={p}
                      onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${p === page ? "bg-primary text-white shadow-md shadow-primary/25" : "border border-border text-muted hover:border-primary hover:text-primary"}`}
                    >{p}</button>
                  ))}
                  <button onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-xl border border-border text-sm font-medium text-muted hover:border-primary hover:text-primary transition-all disabled:opacity-30 disabled:pointer-events-none"
                  >Далі →</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <p className="font-semibold text-foreground">Фільтри</p>
              <div className="flex items-center gap-3">
                {activeCount > 0 && <button onClick={clearAll} className="text-xs text-primary hover:underline">Очистити</button>}
                <button onClick={() => setMobileOpen(false)} className="p-1.5 hover:bg-muted-bg rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4"><FilterPanel /></div>
            <div className="p-4 border-t border-border">
              <button onClick={() => setMobileOpen(false)}
                className="w-full py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-all"
              >Показати {filtered.length} результатів</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
