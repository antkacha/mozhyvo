// ════════════════════════════════════════════════════════
// Shared TypeScript types for Mozhyvo
// ════════════════════════════════════════════════════════

export interface UserProfile {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  institution: string;
  degree: string;
  graduationYear: string;
  languages: string[];
  bio: string;
  avatarUrl: string;
  cvUrl: string;
  linkedinUrl: string;
  telegram: string;
  interests: string[];
  role: "user" | "admin";
  onboardingDone: boolean;
}

export const DEFAULT_PROFILE: UserProfile = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  country: "",
  city: "",
  institution: "",
  degree: "",
  graduationYear: "",
  languages: [],
  bio: "",
  avatarUrl: "",
  cvUrl: "",
  linkedinUrl: "",
  telegram: "",
  interests: [],
  role: "user",
  onboardingDone: false,
};

// Weighted profile completeness:
// Base fields (required to be useful) = 70%, extra fields = 30%
const BASE_FIELDS: (keyof UserProfile)[] = [
  "firstName", "lastName", "country", "institution", "degree", "bio", "languages",
];
const EXTRA_FIELDS: (keyof UserProfile)[] = [
  "phone", "city", "cvUrl", "linkedinUrl",
];

function isFilled(p: UserProfile, f: keyof UserProfile): boolean {
  const v = p[f];
  if (Array.isArray(v)) return v.length > 0;
  return typeof v === "string" && v.trim() !== "";
}

export function profileCompleteness(p: UserProfile): number {
  const baseScore  = BASE_FIELDS.filter((f) => isFilled(p, f)).length / BASE_FIELDS.length * 70;
  const extraScore = EXTRA_FIELDS.filter((f) => isFilled(p, f)).length / EXTRA_FIELDS.length * 30;
  return Math.round(baseScore + extraScore);
}

export interface AdminNote {
  id: string;
  adminId: string;
  targetType: "user" | "opportunity" | "application";
  targetId: string;
  note: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  userId: string;
  opportunitySlug: string;
  opportunityTitle: string;
  deadline: string;
  daysBefore: 1 | 3 | 7;
  email: string;
  sentAt: string | null;
  createdAt: string;
}

export interface NotificationSettings {
  emailNewOpportunities: boolean;
  emailReminders: boolean;
  emailStatusUpdates: boolean;
  emailWeeklyDigest: boolean;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  emailNewOpportunities: true,
  emailReminders: true,
  emailStatusUpdates: true,
  emailWeeklyDigest: false,
};

export interface BroadcastLog {
  id: string;
  adminId: string;
  subject: string;
  body: string;
  segment: "all" | "users" | "orgs";
  recipientCount: number;
  sentAt: string | null;
  scheduledAt: string | null;
  status: "draft" | "scheduled" | "sent" | "failed";
  createdAt: string;
}

export interface ActivityLogEntry {
  id: string;
  userId: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

// Admin stats returned by API / RPC
export interface AdminStats {
  totalUsers: number;
  totalApplications: number;
  totalSaved: number;
  newUsersThisWeek: number;
  newApplicationsThisWeek: number;
}
