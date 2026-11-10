import { selectColumns } from "@/lib/select-columns";

export type OrgStatus = "verified" | "pending" | "rejected" | "blocked";

/** One org as the admin Organizations page renders it (GET /api/admin/orgs/list). */
export interface AdminOrgRow {
  id: string;
  name: string;
  contact_email: string;
  country: string;
  type: string;
  status: OrgStatus;
  description: string;
  website: string;
  created_at: string;
  verified_at: string | null;
  rejection_reason: string | null;
  slug: string;
  showcase_logo_url: string | null;
  partner_hidden: boolean;
  /** Derived client-side from the embedded org_projects(count). */
  _projectCount?: number;
}

// Exactly the columns AdminOrgRow reads (typecheck fails if one is missing) —
// no logo_url / cover_image_url, which the admin list never renders.
export const ADMIN_ORG_LIST_SELECT =
  selectColumns<Omit<AdminOrgRow, "_projectCount">>()([
    "id", "name", "contact_email", "country", "type", "status", "description",
    "website", "created_at", "verified_at", "rejection_reason", "slug",
    "showcase_logo_url", "partner_hidden",
  ] as const) + ", org_projects(count)";
