// Opportunity columns an org may set on its own projects — exactly what the
// dashboard form sends (useOrgProjects toRow). Shared by create and edit so
// the two can't drift. Server-owned columns (id, org_id, views, saves,
// created_at, updated_at) are never in here. status IS here on purpose:
// verified orgs publish their own opportunities, no per-item moderation.
export const ALLOWED_PROJECT_FIELDS = new Set([
  "title", "type", "type_name", "short_description", "full_description",
  "requirements", "benefits", "tags", "deadline", "deadline_display",
  "country", "city", "location", "flag", "format", "funding", "funding_details",
  "duration", "languages", "age_min", "age_max", "status", "auto_close",
  "form_questions", "external_apply_url", "info_pack_url", "photo_url", "important_note",
  "has_fee", "fee_amount", "fee_who",
  "apply_method", "apply_email", "apply_email_subject", "apply_instructions",
]);

/** Keeps only allowlisted project fields from a request body. */
export function pickProjectFields(body: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(body).filter(([k]) => ALLOWED_PROJECT_FIELDS.has(k)));
}

// Publishing rule: any org may create and edit drafts, but only a VERIFIED org
// may move a project to "published". The org status is the active org's,
// resolved server-side (lib/active-org) — never taken from the request.
export const PUBLISH_REQUIRES_VERIFIED = "Публікувати можливості можна лише після верифікації організації";

export function canPublish(orgStatus: string | null | undefined): boolean {
  return orgStatus === "verified";
}
