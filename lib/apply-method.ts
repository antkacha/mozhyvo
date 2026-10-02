// Shared by the create and edit opportunity forms so both enforce the
// same rule for the "Зовнішній сервіс" apply method.

/** Returns an error message for an invalid external apply URL, or null if it's OK. */
export function validateExternalApplyUrl(raw: string | null | undefined): string | null {
  const url = (raw ?? "").trim();
  if (!url) return "Вкажи посилання на форму";
  if (!/^https?:\/\/.+/.test(url)) return "Вкажи повне посилання (https://...)";
  return null;
}
