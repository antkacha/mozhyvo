import type { Opportunity } from "@/lib/data";
import type { UserProfile } from "@/lib/types";

// ════════════════════════════════════════════════════════
// Rule-based recommendation scoring
// ════════════════════════════════════════════════════════

const WEIGHTS = {
  categoryMatch:   30,   // interests include opportunity type keyword
  countryMatch:    20,   // user country == opportunity country
  degreeMatch:     25,   // degree level matches age/degree requirements
  languageMatch:   15,   // user speaks one of the opportunity languages
  deadlineSafe:    10,   // deadline > 7 days away
  verifiedOrg:      5,   // org is verified (approximated by featured flag)
  fullyFunded:     15,   // bonus for fully-funded opportunities
} as const;

const TYPE_INTEREST_MAP: Record<string, string[]> = {
  scholarship:   ["стипендія", "навчання", "освіта", "akadem"],
  internship:    ["стажування", "кар'єра", "робота", "intern"],
  exchange:      ["обмін", "exchange", "міжнародний", "travel"],
  volunteering:  ["волонтерство", "громада", "благодійність"],
  competition:   ["конкурс", "змагання", "хакатон"],
  grant:         ["грант", "проект", "підприємництво"],
  conference:    ["конференція", "школа", "навчання"],
  hackathon:     ["хакатон", "програмування", "технології", "it"],
};

function daysUntil(deadline: string): number {
  return (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
}

export function scoreOpportunity(opp: Opportunity, profile: UserProfile): number {
  let score = 0;

  // Category / interest match
  const interestWords = [
    ...profile.interests.map((i) => i.toLowerCase()),
  ];
  const typeKeywords = TYPE_INTEREST_MAP[opp.type] ?? [];
  if (interestWords.some((w) => typeKeywords.some((k) => w.includes(k) || k.includes(w)))) {
    score += WEIGHTS.categoryMatch;
  }

  // Country match
  if (
    profile.country &&
    opp.country.toLowerCase().includes(profile.country.toLowerCase())
  ) {
    score += WEIGHTS.countryMatch;
  }

  // Degree match (rough: if user has degree and opp has age range)
  const hasDegree = profile.degree && profile.degree.trim() !== "";
  if (hasDegree) {
    score += WEIGHTS.degreeMatch;
  }

  // Language match
  const userLangs = profile.languages.map((l) => l.toLowerCase().split(" ")[0]);
  const oppLangs = opp.languages.map((l) => l.toLowerCase().split(" ")[0]);
  if (userLangs.some((ul) => oppLangs.some((ol) => ol.includes(ul) || ul.includes(ol)))) {
    score += WEIGHTS.languageMatch;
  }

  // Deadline safety bonus (more than 7 days left)
  const days = daysUntil(opp.deadline);
  if (days > 7) score += WEIGHTS.deadlineSafe;

  // Verified org proxy (featured opportunities represent verified/established orgs)
  if (opp.featured) score += WEIGHTS.verifiedOrg;

  // Fully funded bonus
  if (opp.funding === "fully-funded") score += WEIGHTS.fullyFunded;

  return score;
}

export function getRecommendations(
  opportunities: Opportunity[],
  profile: UserProfile,
  limit = 6
): Opportunity[] {
  // Only include open opportunities (deadline in the future)
  const open = opportunities.filter((o) => daysUntil(o.deadline) > 0);

  return open
    .map((opp) => ({ opp, score: scoreOpportunity(opp, profile) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ opp }) => opp);
}

export function getUrgent(opportunities: Opportunity[], maxDays = 7): Opportunity[] {
  return opportunities.filter((o) => {
    const days = daysUntil(o.deadline);
    return days > 0 && days <= maxDays;
  }).sort((a, b) => daysUntil(a.deadline) - daysUntil(b.deadline));
}

export function getDaysUntilDeadline(deadline: string): number {
  return Math.ceil(daysUntil(deadline));
}
