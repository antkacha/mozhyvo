"use client";

import { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  opportunities,
  typeNames,
  fundingLabels,
  formatLabels,
  categorySlugToType,
  OpportunityType,
  FundingType,
  FormatType,
} from "@/lib/data";
import OpportunityCard from "@/components/OpportunityCard";

const ALL_TYPES: OpportunityType[] = [
  "scholarship",
  "internship",
  "exchange",
  "volunteering",
  "competition",
  "grant",
  "conference",
  "hackathon",
];

const ALL_FORMATS: FormatType[] = ["online", "offline", "hybrid"];
const ALL_FUNDINGS: FundingType[] = [
  "fully-funded",
  "partially-funded",
  "self-funded",
];

const allCountries = Array.from(
  new Set(opportunities.map((o) => o.country))
).sort();

const typeCounts = ALL_TYPES.reduce(
  (acc, type) => {
    acc[type] = opportunities.filter((o) => o.type === type).length;
    return acc;
  },
  {} as Record<string, number>
);

// ── Sub-components ───────────────────────────────────────────────

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border pb-4 mb-4 last:border-0 last:pb-0 last:mb-0">
      <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
        {title}
      </p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

function CheckItem({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 rounded border-border accent-primary cursor-pointer flex-shrink-0"
      />
      <span className="text-sm text-muted group-hover:text-foreground transition-colors duration-150 leading-tight">
        {label}
      </span>
      {count !== undefined && (
        <span className="ml-auto text-xs text-muted tabular-nums">{count}</span>
      )}
    </label>
  );
}

interface FilterPanelProps {
  selectedTypes: string[];
  selectedFormats: string[];
  selectedFundings: string[];
  selectedCountries: string[];
  onToggleType: (v: string) => void;
  onToggleFormat: (v: string) => void;
  onToggleFunding: (v: string) => void;
  onToggleCountry: (v: string) => void;
}

function FilterPanel({
  selectedTypes,
  selectedFormats,
  selectedFundings,
  selectedCountries,
  onToggleType,
  onToggleFormat,
  onToggleFunding,
  onToggleCountry,
}: FilterPanelProps) {
  return (
    <>
      <FilterSection title="Тип можливості">
        {ALL_TYPES.map((type) => (
          <CheckItem
            key={type}
            label={typeNames[type]}
            count={typeCounts[type]}
            checked={selectedTypes.includes(type)}
            onChange={() => onToggleType(type)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Формат">
        {ALL_FORMATS.map((fmt) => (
          <CheckItem
            key={fmt}
            label={formatLabels[fmt]}
            checked={selectedFormats.includes(fmt)}
            onChange={() => onToggleFormat(fmt)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Фінансування">
        {ALL_FUNDINGS.map((fund) => (
          <CheckItem
            key={fund}
            label={fundingLabels[fund]}
            checked={selectedFundings.includes(fund)}
            onChange={() => onToggleFunding(fund)}
          />
        ))}
      </FilterSection>

      <FilterSection title="Країна">
        {allCountries.map((country) => (
          <CheckItem
            key={country}
            label={country}
            checked={selectedCountries.includes(country)}
            onChange={() => onToggleCountry(country)}
          />
        ))}
      </FilterSection>
    </>
  );
}

// ── Main catalog component ────────────────────────────────────────

const ITEMS_PER_PAGE = 12;

export default function OpportunitiesCatalog() {
  const searchParams = useSearchParams();

  const [search, setSearch] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(() => {
    const cat = searchParams.get("category");
    if (cat && categorySlugToType[cat]) return [categorySlugToType[cat]];
    return [];
  });
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedFundings, setSelectedFundings] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [page, setPage] = useState(1);

  const toggle = (
    arr: string[],
    setArr: (v: string[]) => void,
    value: string
  ) => {
    setPage(1);
    setArr(
      arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
    );
  };

  const filtered = useMemo(() => {
    let result = [...opportunities];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.org.toLowerCase().includes(q) ||
          o.shortDescription.toLowerCase().includes(q) ||
          o.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (selectedTypes.length > 0)
      result = result.filter((o) => selectedTypes.includes(o.type));
    if (selectedFormats.length > 0)
      result = result.filter((o) => selectedFormats.includes(o.format));
    if (selectedFundings.length > 0)
      result = result.filter((o) => selectedFundings.includes(o.funding));
    if (selectedCountries.length > 0)
      result = result.filter((o) => selectedCountries.includes(o.country));

    result.sort(
      (a, b) =>
        new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    );

    return result;
  }, [search, selectedTypes, selectedFormats, selectedFundings, selectedCountries]);

  const activeCount =
    selectedTypes.length +
    selectedFormats.length +
    selectedFundings.length +
    selectedCountries.length;

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const clearAll = () => {
    setSelectedTypes([]);
    setSelectedFormats([]);
    setSelectedFundings([]);
    setSelectedCountries([]);
    setSearch("");
    setPage(1);
  };

  const filterProps: FilterPanelProps = {
    selectedTypes,
    selectedFormats,
    selectedFundings,
    selectedCountries,
    onToggleType: (v) => toggle(selectedTypes, setSelectedTypes, v),
    onToggleFormat: (v) => toggle(selectedFormats, setSelectedFormats, v),
    onToggleFunding: (v) => toggle(selectedFundings, setSelectedFundings, v),
    onToggleCountry: (v) => toggle(selectedCountries, setSelectedCountries, v),
  };

  return (
    <div>
      {/* Search bar + mobile filter button */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Пошук за назвою, організацією, тегами..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white"
          />
        </div>
        <button
          onClick={() => setShowMobileFilters(true)}
          className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm font-medium hover:border-primary hover:text-primary transition-all bg-white flex-shrink-0"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4h18M7 8h10M11 12h4"
            />
          </svg>
          Фільтри
          {activeCount > 0 && (
            <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-52 flex-shrink-0">
          <div className="sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-sm text-foreground">Фільтри</p>
              {activeCount > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-primary hover:underline"
                >
                  Очистити
                </button>
              )}
            </div>
            <FilterPanel {...filterProps} />
          </div>
        </aside>

        {/* Cards area */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-muted">
              Знайдено:{" "}
              <span className="font-semibold text-foreground">
                {filtered.length}
              </span>{" "}
              можливостей
            </p>
            {activeCount > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-primary hover:underline lg:hidden"
              >
                Очистити ({activeCount})
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-5xl mb-4">🔍</p>
              <p className="font-semibold text-foreground mb-2">
                Нічого не знайдено
              </p>
              <p className="text-sm text-muted mb-5">
                Спробуй змінити фільтри або пошуковий запит
              </p>
              <button
                onClick={clearAll}
                className="text-sm font-semibold text-primary hover:underline"
              >
                Очистити всі фільтри
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {paginated.map((opp) => (
                  <OpportunityCard key={opp.slug} opp={opp} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-xl border border-border text-sm font-medium text-muted hover:border-primary hover:text-primary transition-all disabled:opacity-30 disabled:pointer-events-none"
                  >
                    ← Назад
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
                        p === page
                          ? "bg-primary text-white shadow-md shadow-primary/25"
                          : "border border-border text-muted hover:border-primary hover:text-primary"
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  <button
                    onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    disabled={page === totalPages}
                    className="px-4 py-2 rounded-xl border border-border text-sm font-medium text-muted hover:border-primary hover:text-primary transition-all disabled:opacity-30 disabled:pointer-events-none"
                  >
                    Далі →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <p className="font-semibold text-foreground">Фільтри</p>
              <div className="flex items-center gap-3">
                {activeCount > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-xs text-primary hover:underline"
                  >
                    Очистити
                  </button>
                )}
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-1.5 hover:bg-muted-bg rounded-lg transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <FilterPanel {...filterProps} />
            </div>
            <div className="p-4 border-t border-border">
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-all"
              >
                Показати {filtered.length} результатів
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
