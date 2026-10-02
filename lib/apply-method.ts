// Single source of truth for how participants apply to an opportunity:
// method detection (create/edit forms, detail page, apply card, apply
// page) and the validation rules both forms enforce.

export type ApplyMethod = "form" | "external" | "email";

export const APPLY_METHODS: ApplyMethod[] = ["form", "external", "email"];

export const APPLY_INSTRUCTIONS_MAX = 300;

/**
 * The effective apply method. apply_method is stored explicitly from now
 * on; rows saved before it existed (or not yet backfilled) fall back to
 * the old inference: an http(s) external_apply_url means "external",
 * anything else means the internal form.
 */
export function getApplyMethod(p: {
  applyMethod?: string | null;
  externalApplyUrl?: string | null;
}): ApplyMethod {
  const stored = (p.applyMethod ?? "").trim() as ApplyMethod;
  if (APPLY_METHODS.includes(stored)) return stored;
  return /^https?:\/\//i.test((p.externalApplyUrl ?? "").trim()) ? "external" : "form";
}

/** Returns an error message for an invalid external apply URL, or null if it's OK. */
export function validateExternalApplyUrl(raw: string | null | undefined): string | null {
  const url = (raw ?? "").trim();
  if (!url) return "Вкажи посилання на форму";
  if (!/^https?:\/\/.+/.test(url)) return "Вкажи повне посилання (https://...)";
  return null;
}

/** Returns an error message for an invalid recipient email, or null if it's OK. */
export function validateApplyEmail(raw: string | null | undefined): string | null {
  const email = (raw ?? "").trim();
  if (!email) return "Вкажи email для заявок";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Вкажи коректний email (напр. name@org.com)";
  return null;
}

/** mailto: link with an optional subject; encodeURIComponent encodes spaces as %20, never "+". */
export function buildMailto(email: string, subject?: string | null): string {
  const s = (subject ?? "").trim();
  return `mailto:${email.trim()}${s ? `?subject=${encodeURIComponent(s)}` : ""}`;
}

/**
 * The apply fields to save for the chosen method. Every method writes all
 * of them, clearing the other methods' fields, so a project never keeps a
 * stale URL/email from a method it no longer uses. form_questions is left
 * alone (kept as-is for every method).
 */
export function applyFieldsFor(
  method: ApplyMethod,
  v: { externalApplyUrl?: string; applyEmail?: string; applyEmailSubject?: string; applyInstructions?: string },
) {
  return {
    applyMethod:       method,
    externalApplyUrl:  method === "external" ? (v.externalApplyUrl ?? "").trim() : "",
    applyEmail:        method === "email" ? (v.applyEmail ?? "").trim() : "",
    applyEmailSubject: method === "email" ? (v.applyEmailSubject ?? "").trim() : "",
    applyInstructions: method === "email" ? (v.applyInstructions ?? "").trim().slice(0, APPLY_INSTRUCTIONS_MAX) : "",
  };
}

/**
 * Apply fields for the public Opportunity shape, from a raw org_projects
 * row. Shared by the detail page and the apply page so they always agree.
 */
export function applyFieldsFromRow(row: Record<string, unknown>) {
  const externalApplyUrl = ((row.external_apply_url as string) ?? "").trim();
  const applyMethod = getApplyMethod({ applyMethod: row.apply_method as string, externalApplyUrl });
  return {
    applyMethod,
    // An "external" row with no URL (bad save) falls back to the internal
    // path rather than an empty href.
    applyUrl:          applyMethod === "external" && externalApplyUrl
      ? externalApplyUrl
      : `/opportunities/${row.id as string}/apply`,
    applyEmail:        ((row.apply_email as string) ?? "").trim() || undefined,
    applyEmailSubject: ((row.apply_email_subject as string) ?? "").trim() || undefined,
    applyInstructions: ((row.apply_instructions as string) ?? "").trim() || undefined,
  };
}
