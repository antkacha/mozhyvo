// Columns of `orgs` the org dashboard reads (GET /api/me/org →
// hooks/useOrgSession fromRow). Shared by the route and the hook so the hook's
// row type is exactly what the route selects: reading any other column in
// fromRow is a type error.
//
// logo_url and cover_image_url (base64 data URLs until Phase 3B) are included
// because the dashboard renders them: logo_url in the OrgShell sidebar avatar
// and the profile editor (preview + upload), cover_image_url in the profile
// editor's cover preview/picker.
export const ORG_PROFILE_COLUMNS = [
  "id", "slug", "name", "type", "country", "city", "website", "phone",
  "contact_email", "description", "mission", "founded",
  "logo_url", "showcase_logo_url", "cover_image_url", "cover_video_url",
  "brand_color", "focus_areas", "socials", "status",
] as const;

export const ORG_PROFILE_SELECT = ORG_PROFILE_COLUMNS.join(", ");

export type OrgProfileRow = { [K in (typeof ORG_PROFILE_COLUMNS)[number]]?: unknown };
