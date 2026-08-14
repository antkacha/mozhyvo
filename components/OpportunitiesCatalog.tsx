"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  opportunities,
  typeNames,
  fundingLabels,
  formatLabels,
  categorySlugToType,
  type Opportunity,
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
          if (days === null) return null; // items here are pre-filtered to have a real deadline
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

// Narrow a comma-separated URL value down to the members of `valid` —
// keeps a hand-edited/stale URL from injecting garbage into filter state.
function parseMultiParam<T extends string>(raw: string | null, valid: readonly T[]): T[] {
  if (!raw) return [];
  return raw.split(",").filter((v): v is T => (valid as readonly string[]).includes(v));
}

// ── Filter sidebar/drawer content ────────────────────────────────────
// Hoisted to module scope — defining this inside OpportunitiesCatalog's
// render body created a new component identity on every render (every
// keystroke, filter click, drawer toggle), so React unmounted/remounted
// the whole filter subtree each time: Section's own open/closed state
// reset, every checkbox lost DOM identity. Same bug class as the
// /org/register Layout fix earlier — everything it used from the parent
// scope is now an explicit prop instead of a closure.
function FilterPanel({
  allOpportunities, filtered, types, formats, fundings, countries, languages,
  allCountries, allLanguages, toggleType, toggleFormat, toggleFunding, toggleCountry, toggleLanguage,
}: {
  allOpportunities: Opportunity[];
  filtered: Opportunity[];
  types: OpportunityType[];
  formats: FormatType[];
  fundings: FundingType[];
  countries: string[];
  languages: string[];
  allCountries: string[];
  allLanguages: string[];
  toggleType: (t: OpportunityType) => void;
  toggleFormat: (f: FormatType) => void;
  toggleFunding: (f: FundingType) => void;
  toggleCountry: (c: string) => void;
  toggleLanguage: (l: string) => void;
}) {
  return (
    <div>
      <Section title="Тип">
        {ALL_TYPES.map((t) => (
          <CheckRow key={t} label={typeNames[t]}
            count={allOpportunities.filter((o) => o.type === t).length}
            checked={types.includes(t)}
            onChange={() => toggleType(t)} />
        ))}
      </Section>
      <Section title="Формат">
        {ALL_FORMATS.map((f) => (
          <CheckRow key={f} label={formatLabels[f]}
            count={filtered.filter((o) => o.format === f).length}
            checked={formats.includes(f)}
            onChange={() => toggleFormat(f)} />
        ))}
      </Section>
      <Section title="Фінансування">
        {ALL_FUNDINGS.map((f) => (
          <CheckRow key={f} label={fundingLabels[f]}
            checked={fundings.includes(f)}
            onChange={() => toggleFunding(f)} />
        ))}
      </Section>
      <Section title="Країна">
        <div className="max-h-44 overflow-y-auto flex flex-col gap-1.5 pr-1">
          {allCountries.map((c) => (
            <CheckRow key={c} label={c}
              count={filtered.filter((o) => o.country === c).length}
              checked={countries.includes(c)}
              onChange={() => toggleCountry(c)} />
          ))}
        </div>
      </Section>
      <Section title="Мова">
        <div className="flex flex-wrap gap-1.5">
          {allLanguages.map((l) => (
            <button
              key={l}
              onClick={() => toggleLanguage(l)}
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

// ── Main catalog component ───────────────────────────────────────────
export default function OpportunitiesCatalog() {
  const router = useRouter();
  const params = useSearchParams();
  const [loading, setLoading] = useState(true);
  const { projects: orgProjects } = usePublicOrgProjects();
  const [mobileOpen, setMobileOpen] = useState(false);

  // ── URL is the single source of truth for every piece of list state
  // below. Nothing here is useState — it's all re-derived from
  // useSearchParams() on every render, so a fresh mount (e.g. after
  // being torn down by navigating to a detail page and back) always
  // reflects exactly what the URL says, with no separate copy that can
  // drift out of sync or reset to a default.

  const qParam = params.get("q") ?? "";

  const categoryParam = params.get("category");
  const typesParam = params.get("types");
  const types = useMemo<OpportunityType[]>(() => {
    if (typesParam) return parseMultiParam(typesParam, ALL_TYPES);
    if (categoryParam && categorySlugToType[categoryParam]) return [categorySlugToType[categoryParam]];
    return [];
  }, [typesParam, categoryParam]);

  const formats = useMemo(() => parseMultiParam(params.get("format"), ALL_FORMATS), [params]);
  const fundings = useMemo(() => parseMultiParam(params.get("funding"), ALL_FUNDINGS), [params]);
  const countries = useMemo(() => (params.get("country") ?? "").split(",").filter(Boolean), [params]);
  const languages = useMemo(() => (params.get("language") ?? "").split(",").filter(Boolean), [params]);

  const rawSort = params.get("sort");
  const sort: SortValue = SORT_OPTIONS.some((o) => o.value === rawSort) ? (rawSort as SortValue) : "newest";

  const page = Math.max(1, parseInt(params.get("page") ?? "1", 10) || 1);

  // Remember the current list URL so BackToOpportunities can return to it
  // exactly, instead of guessing from document.referrer (which doesn't
  // update across a soft navigation and was wrong more often than not).
  //
  // Trigger choice: written on every mount/params change while this
  // component is on screen (option "a"), not only at the moment of
  // navigating into a detail. A precise "write only when the user is
  // actually leaving for a detail page" (option "b") would need to hook
  // OpportunityCard's click — off-limits — and there's no reliable signal
  // from inside this component alone to distinguish "unmounting because
  // navigating to a detail" from "unmounting because navigating anywhere
  // else" (effect cleanup fires the same way for both). Practically this
  // is a non-issue: the marker is already sitting in storage well before
  // any click happens, since it's kept current continuously while mounted.
  //
  // Residual staleness accepted: if the user leaves /opportunities for an
  // unrelated page (e.g. the homepage) without closing the tab, then later
  // reaches some opportunity's detail page through a different path (a
  // pasted link, a link from another page), "Назад" there would offer the
  // stale old list state instead of a bare /opportunities. Narrow window —
  // any fresh visit to /opportunities immediately overwrites it — and the
  // common path (browse list, click a card) is unaffected since the
  // marker is always current at the moment a card is actually clicked.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const qs = params.toString();
      sessionStorage.setItem("mzv_last_list_url", `/opportunities${qs ? `?${qs}` : ""}`);
    } catch {
      // Private mode / storage disabled — BackToOpportunities falls back
      // to a bare /opportunities when it can't read this back either way.
    }
  }, [params]);

  // Search input keeps a local buffer purely for typing responsiveness —
  // debounced ~300ms before it becomes the q param. The URL (qParam)
  // remains what's actually filtered on; this is re-synced FROM the URL
  // below so external changes (clear-filters, back/forward, a pasted
  // link) never leave the input showing something stale.
  const [rawSearch, setRawSearch] = useState(qParam);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setRawSearch(qParam);
  }, [qParam]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  // Writes `patch` on top of the CURRENT url params — every other key is
  // preserved untouched. null/"" deletes a key (keeps the URL clean of
  // default values, matching the old behavior of only ever setting a
  // param when it's non-default). replace, not push: filter/page changes
  // are not separate history stops — see verification (f).
  const updateParams = useCallback((patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
    }
    const qs = next.toString();
    router.replace(qs ? `/opportunities?${qs}` : "/opportunities", { scroll: false });
  }, [params, router]);

  function updateSearch(value: string) {
    setRawSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      updateParams({ q: value.trim() || null, page: null });
    }, 300);
  }
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  function toggleType(value: OpportunityType) {
    const next = types.includes(value) ? types.filter((t) => t !== value) : [...types, value];
    if (next.length === 0) { updateParams({ category: null, types: null, page: null }); return; }
    if (next.length === 1) {
      const slug = Object.entries(categorySlugToType).find(([, v]) => v === next[0])?.[0];
      if (slug) { updateParams({ category: slug, types: null, page: null }); return; }
    }
    updateParams({ category: null, types: next.join(","), page: null });
  }
  function toggleFormat(value: FormatType) {
    const next = formats.includes(value) ? formats.filter((f) => f !== value) : [...formats, value];
    updateParams({ format: next.length > 0 ? next.join(",") : null, page: null });
  }
  function toggleFunding(value: FundingType) {
    const next = fundings.includes(value) ? fundings.filter((f) => f !== value) : [...fundings, value];
    updateParams({ funding: next.length > 0 ? next.join(",") : null, page: null });
  }
  function toggleCountry(value: string) {
    const next = countries.includes(value) ? countries.filter((c) => c !== value) : [...countries, value];
    updateParams({ country: next.length > 0 ? next.join(",") : null, page: null });
  }
  function toggleLanguage(value: string) {
    const next = languages.includes(value) ? languages.filter((l) => l !== value) : [...languages, value];
    updateParams({ language: next.length > 0 ? next.join(",") : null, page: null });
  }

  function clearAll() {
    router.replace("/opportunities", { scroll: false });
  }

  function goToPage(p: number) {
    updateParams({ page: p > 1 ? String(p) : null });
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      if (qParam.trim()) {
        const q = qParam.toLowerCase();
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
      // Rolling/ASAP/no-deadline items have nothing to sort by — push them
      // to the end instead of letting NaN scramble the order.
      result = [...result].sort((a, b) => {
        const da = getDaysUntilDeadline(a.deadline);
        const db = getDaysUntilDeadline(b.deadline);
        if (da === null && db === null) return 0;
        if (da === null) return 1;
        if (db === null) return -1;
        return da - db;
      });
    } else if (sort === "popular") {
      result = [...result].sort((a) => (a.featured ? -1 : 1));
    }
    return result;
  }, [allOpportunities, types, formats, fundings, countries, languages, qParam, sort, today]);

  const urgent = useMemo(() =>
    allOpportunities.filter((o) => { const d = getDaysUntilDeadline(o.deadline); return d !== null && d >= 0 && d <= 7; }).slice(0, 8),
  [allOpportunities]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  // .slice() already preserves the same opp object references from the
  // memoized `filtered` above, so this isn't strictly required for
  // React.memo on OpportunityCard to work — memoized anyway so the array
  // itself doesn't churn on every render and nothing here depends on that
  // being an implementation detail of slice().
  const paginated = useMemo(
    () => filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    [filtered, page]
  );

  // Card entrance animation replays on filter/sort/search changes, same as
  // the old gridKey counter — but NOT on plain pagination, since the old
  // counter was only ever bumped from resetPage() (called by toggle/sort,
  // never by the page buttons). Deriving it from params-minus-page
  // reproduces that exactly without a separate piece of state.
  const gridKey = useMemo(() => {
    const p = new URLSearchParams(params.toString());
    p.delete("page");
    return p.toString();
  }, [params]);

  const activeChips: { label: string; remove: () => void }[] = [
    ...types.map((t)     => ({ label: typeNames[t],     remove: () => toggleType(t) })),
    ...formats.map((f)   => ({ label: formatLabels[f],  remove: () => toggleFormat(f) })),
    ...fundings.map((f)  => ({ label: fundingLabels[f], remove: () => toggleFunding(f) })),
    ...countries.map((c) => ({ label: c,                remove: () => toggleCountry(c) })),
    ...languages.map((l) => ({ label: `Мова: ${l}`,     remove: () => toggleLanguage(l) })),
  ];
  const activeCount = activeChips.length;

  // Shared between the desktop sidebar and mobile drawer FilterPanel
  // instances so the two call sites can't drift out of sync.
  const filterPanelProps = {
    allOpportunities, filtered, types, formats, fundings, countries, languages,
    allCountries, allLanguages, toggleType, toggleFormat, toggleFunding, toggleCountry, toggleLanguage,
  };


  if (loading) return <SkeletonGrid />;

  return (
    <div>
      <UrgentRow items={urgent} />

      {/* Search + sort */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text" value={rawSearch}
            onChange={(e) => updateSearch(e.target.value)}
            placeholder="Пошук за назвою, організацією, тегами..."
            className="w-full pl-10 pr-10 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
          />
          {rawSearch && (
            <button onClick={() => updateSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
        <select
          value={sort} onChange={(e) => updateParams({ sort: e.target.value === "newest" ? null : e.target.value, page: null })}
          className="text-sm border border-border rounded-xl px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground flex-shrink-0"
        >
          {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm font-medium hover:border-primary hover:text-primary transition-all bg-white flex-shrink-0"
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
        <aside className="hidden lg:block w-52 flex-shrink-0">
          <div className="sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-sm text-foreground">Фільтри</p>
              {activeCount > 0 && <button onClick={clearAll} className="text-xs text-primary hover:underline">Очистити</button>}
            </div>
            <FilterPanel {...filterPanelProps} />
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
                  <button onClick={() => goToPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-xl border border-border text-sm font-medium text-muted hover:border-primary hover:text-primary transition-all disabled:opacity-30 disabled:pointer-events-none"
                  >← Назад</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
                    Math.max(0, page - 3), Math.min(totalPages, page + 2)
                  ).map((p) => (
                    <button key={p}
                      onClick={() => goToPage(p)}
                      className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${p === page ? "bg-primary text-white shadow-md shadow-primary/25" : "border border-border text-muted hover:border-primary hover:text-primary"}`}
                    >{p}</button>
                  ))}
                  <button onClick={() => goToPage(Math.min(totalPages, page + 1))}
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
            <div className="flex-1 overflow-y-auto p-4"><FilterPanel {...filterPanelProps} /></div>
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
