import type { ApplyMethod } from "@/lib/apply-method";

// ── Opportunity types: the ONE canonical list ──────────────────────
// Every form writes these values, and every reader (catalog, filter,
// org page, detail, apply, admin) routes the stored value through
// normalizeType() below — so rows saved before this list existed still
// land in the right category. Order here is the order shown in the
// create form and the catalog filter.
export const OPPORTUNITY_TYPES = [
  { value: "internship",   label: "Стажування",   desc: "Практика в організації" },
  { value: "grant",        label: "Грант",        desc: "Фінансова підтримка проектів" },
  { value: "scholarship",  label: "Стипендія",    desc: "Фінансування навчання чи досліджень" },
  { value: "volunteering", label: "Волонтерство", desc: "Волонтерські програми" },
  { value: "exchange",     label: "Обмін",        desc: "Молодіжний чи академічний обмін" },
  { value: "training",     label: "Тренінг",      desc: "Навчання та воркшопи" },
  { value: "conference",   label: "Конференція",  desc: "Навчальні та наукові заходи" },
  { value: "hackathon",    label: "Хакатон",      desc: "Інтенсивні проектні заходи" },
  { value: "research",     label: "Дослідження",  desc: "Наукові та дослідницькі програми" },
  { value: "competition",  label: "Конкурс",      desc: "Змагання та відбори" },
  { value: "other",        label: "Інше",         desc: "Вкажіть свій тип" },
] as const;

export type OpportunityType = typeof OPPORTUNITY_TYPES[number]["value"];

export const ALL_OPPORTUNITY_TYPES: OpportunityType[] = OPPORTUNITY_TYPES.map((t) => t.value);

// Legacy stored values → canonical. "custom" was the old name of "other".
const LEGACY_TYPES: Record<string, OpportunityType> = {
  volunteer: "volunteering",
  custom:    "other",
};

// Free-text labels under "other"/"custom" that are really one of the
// canonical categories (that's where most scholarships/research ended up
// before those options existed in the form).
const LABEL_TYPES: Record<string, OpportunityType> = {
  "стипендія":               "scholarship",
  "дослідження":             "research",
  "дослідницьке стажування": "research",
  "тренінг":                 "training",
};

function isOpportunityType(v: string): v is OpportunityType {
  return (ALL_OPPORTUNITY_TYPES as string[]).includes(v);
}

/** Map any stored type (canonical or legacy) + its label to ONE canonical type. */
export function normalizeType(type: string | null | undefined, typeName?: string | null): OpportunityType {
  const raw = (type ?? "").trim().toLowerCase();
  const label = (typeName ?? "").trim().toLowerCase();
  const base = isOpportunityType(raw) ? raw : LEGACY_TYPES[raw] ?? "other";
  if (base === "other") return LABEL_TYPES[label] ?? "other";
  // The old "Стипендія" create-form template wrote type "grant".
  if (base === "grant" && label === "стипендія") return "scholarship";
  return base;
}

// ?category=<value> is the canonical catalog URL. Plural slugs are the
// old links (homepage tiles, Telegram messages already sent, indexed
// URLs) and keep resolving.
const LEGACY_CATEGORY_SLUGS: Record<string, OpportunityType> = {
  scholarships: "scholarship",
  internships:  "internship",
  exchanges:    "exchange",
  competitions: "competition",
  grants:       "grant",
};

export function typeFromCategoryParam(param: string | null): OpportunityType | null {
  if (!param) return null;
  if (isOpportunityType(param)) return param;
  return LEGACY_CATEGORY_SLUGS[param] ?? null;
}

export type FundingType = "fully-funded" | "partially-funded" | "self-funded";
export type FormatType = "online" | "offline" | "hybrid";

export interface Opportunity {
  slug: string;
  type: OpportunityType;
  typeName: string;
  org: string;
  orgSlug?: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  deadline: string;
  deadlineDisplay: string;
  flag: string;
  location: string;
  country: string;
  format: FormatType;
  languages: string[];
  ageMin?: number;
  ageMax?: number;
  funding: FundingType;
  fundingDetails?: string;
  requirements: string[];
  benefits: string[];
  tags: string[];
  applyUrl: string;
  applyMethod?: ApplyMethod;
  applyEmail?: string;
  applyEmailSubject?: string;
  applyInstructions?: string;
  featured?: boolean;
  duration?: string;
  photo?: string;
  infoPackUrl?: string;
  importantNote?: string;
  hasFee?: boolean;
  feeAmount?: string;
  feeWho?: "selected" | "all";
  projectId?: string;
  orgVerified?: boolean;
}

export const typeNames = Object.fromEntries(
  OPPORTUNITY_TYPES.map((t) => [t.value, t.label]),
) as Record<OpportunityType, string>;

export const typeColors: Record<OpportunityType, string> = {
  scholarship: "bg-primary-light text-primary",
  internship: "bg-blue-100 text-blue-700",
  exchange: "bg-green-100 text-green-700",
  volunteering: "bg-teal-100 text-teal-700",
  competition: "bg-orange-100 text-orange-700",
  grant: "bg-yellow-100 text-yellow-700",
  conference: "bg-pink-100 text-pink-700",
  hackathon: "bg-red-100 text-red-700",
  training: "bg-indigo-100 text-indigo-700",
  research: "bg-cyan-100 text-cyan-700",
  other: "bg-slate-100 text-slate-700",
};

export const typeEmoji: Record<OpportunityType, string> = {
  scholarship: "🎓",
  internship: "💼",
  exchange: "🌍",
  volunteering: "🤝",
  competition: "🏆",
  grant: "🚀",
  conference: "🎙",
  hackathon: "💻",
  training: "📚",
  research: "🔬",
  other: "✦",
};

// Cover-photo placeholder background when an opportunity has no photo
export const typeGradient: Record<OpportunityType, string> = {
  scholarship: "linear-gradient(135deg,#3B4FE8,#7C3AED)",
  internship: "linear-gradient(135deg,#3B82F6,#06B6D4)",
  exchange: "linear-gradient(135deg,#10B981,#3B82F6)",
  volunteering: "linear-gradient(135deg,#14B8A6,#10B981)",
  competition: "linear-gradient(135deg,#F97316,#EF4444)",
  grant: "linear-gradient(135deg,#F59E0B,#F97316)",
  conference: "linear-gradient(135deg,#EC4899,#8B5CF6)",
  hackathon: "linear-gradient(135deg,#EF4444,#EC4899)",
  training: "linear-gradient(135deg,#6366F1,#3B82F6)",
  research: "linear-gradient(135deg,#0EA5E9,#6366F1)",
  other: "linear-gradient(135deg,#3B4FE8,#7C3AED)",
};

export const fundingLabels: Record<FundingType, string> = {
  "fully-funded": "Повне фінансування",
  "partially-funded": "Часткове фінансування",
  "self-funded": "Без фінансування",
};

export const formatLabels: Record<FormatType, string> = {
  online: "Онлайн",
  offline: "Офлайн",
  hybrid: "Гібрид",
};

export const opportunities: Opportunity[] = [];
