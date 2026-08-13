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
  importantNote?: string;
  hasFee?: boolean;
  feeAmount?: string;
  feeWho?: "selected" | "all";
  projectId?: string;
  orgVerified?: boolean;
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

export const typeEmoji: Record<OpportunityType, string> = {
  scholarship: "🎓",
  internship: "💼",
  exchange: "🌍",
  volunteering: "🤝",
  competition: "🏆",
  grant: "🚀",
  conference: "🎙",
  hackathon: "💻",
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
