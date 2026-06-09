export const DEMO_ORG_EMAIL = "org@mozhyvo.org";
export const DEMO_ORG_PASSWORD = "Demo2025!";

export interface OrgProfile {
  id: string;
  name: string;
  type: string;
  country: string;
  city: string;
  website: string;
  contactEmail: string;
  description: string;
  logo: string | null;
  status: "pending" | "verified" | "rejected";
  createdAt: string;
}

export const DEMO_ORG_PROFILE: OrgProfile = {
  id: "demo-org-001",
  name: "Фонд «Молодь України»",
  type: "НГО / Громадська організація",
  country: "Україна",
  city: "Київ",
  website: "https://molod-ua.org",
  contactEmail: "org@mozhyvo.org",
  description:
    "Ми підтримуємо молодих українців у пошуку можливостей для навчання, розвитку та реалізації свого потенціалу. Організовуємо обміни, тренінги та конкурси для молоді від 16 до 30 років.",
  logo: null,
  status: "pending",
  createdAt: "2025-05-10",
};
