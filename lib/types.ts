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

export function profileCompleteness(p: UserProfile): number {
  const fields: (keyof UserProfile)[] = [
    "firstName", "lastName", "phone", "country", "city",
    "institution", "degree", "bio", "cvUrl", "languages",
  ];
  const filled = fields.filter((f) => {
    const v = p[f];
    if (Array.isArray(v)) return v.length > 0;
    return typeof v === "string" && v.trim() !== "";
  }).length;
  return Math.round((filled / fields.length) * 100);
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
