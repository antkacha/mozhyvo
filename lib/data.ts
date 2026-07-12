export type OpportunityType =
  | "scholarship"
  | "internship"
  | "exchange"
  | "volunteering"
  | "competition"
  | "grant"
  | "conference"
  | "hackathon";

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
  featured?: boolean;
  duration?: string;
  photo?: string;
  infoPackUrl?: string;
  projectId?: string;
}

export const typeNames: Record<OpportunityType, string> = {
  scholarship: "Стипендія",
  internship: "Стажування",
  exchange: "Обмін",
  volunteering: "Волонтерство",
  competition: "Конкурс",
  grant: "Грант",
  conference: "Конференція",
  hackathon: "Хакатон",
};

export const typeColors: Record<OpportunityType, string> = {
  scholarship: "bg-primary-light text-primary",
  internship: "bg-blue-100 text-blue-700",
  exchange: "bg-green-100 text-green-700",
  volunteering: "bg-teal-100 text-teal-700",
  competition: "bg-orange-100 text-orange-700",
  grant: "bg-yellow-100 text-yellow-700",
  conference: "bg-pink-100 text-pink-700",
  hackathon: "bg-red-100 text-red-700",
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

export const categorySlugToType: Record<string, OpportunityType> = {
  scholarships: "scholarship",
  internships: "internship",
  exchanges: "exchange",
  volunteering: "volunteering",
  competitions: "competition",
  grants: "grant",
};

export const opportunities: Opportunity[] = [];
