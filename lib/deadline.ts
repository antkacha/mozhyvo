// ════════════════════════════════════════════════════════
// Deadline calendar math — the single source of truth for
// "today", "days until deadline", "soon" and "passed".
// ════════════════════════════════════════════════════════
//
// Deadlines are stored as calendar dates ('YYYY-MM-DD', or "" for
// rolling/ASAP programs). They're compared as calendar days in Kyiv time —
// the audience's timezone — never as UTC instants or the viewer's local
// time, so the result doesn't depend on the hour or on where the code runs
// (Vercel in UTC, a browser in Paris): due today = 0, tomorrow = 1,
// yesterday = -1.

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 24 * 60 * 60 * 1000;

/** "Deadline soon" window, inclusive: due today (0) through 7 days ahead. */
export const DEADLINE_SOON_DAYS = 7;

let kyivFormat: Intl.DateTimeFormat | undefined;
function getKyivFormat(): Intl.DateTimeFormat {
  if (!kyivFormat) {
    const opts: Intl.DateTimeFormatOptions = { year: "numeric", month: "2-digit", day: "2-digit" };
    try {
      kyivFormat = new Intl.DateTimeFormat("en-CA", { ...opts, timeZone: "Europe/Kyiv" });
    } catch {
      // Older browsers' tz data predates the 2022 rename and only know the
      // legacy (still-valid) alias.
      kyivFormat = new Intl.DateTimeFormat("en-CA", { ...opts, timeZone: "Europe/Kiev" });
    }
  }
  return kyivFormat;
}

/** Current calendar date in Kyiv as 'YYYY-MM-DD'. */
export function getKyivToday(now: Date = new Date()): string {
  return getKyivFormat().format(now);
}

// 'YYYY-MM-DD' → UTC-midnight ms of that calendar date, or null when the
// string isn't a real date (empty, "Набір триває", 2026-02-30, …).
function calendarDayMs(date: string): number | null {
  const m = ISO_DATE.exec(date);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const ms = Date.UTC(y, mo - 1, d);
  const check = new Date(ms);
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== mo - 1 || check.getUTCDate() !== d) return null;
  return ms;
}

/**
 * Whole calendar days from Kyiv-today to the deadline date (0 = due today,
 * negative = passed). null when there's no real date — rolling/ASAP/empty
 * deadlines have no countdown and are never "soon" or "passed".
 */
export function getDaysUntilDeadline(deadline: string, today: string = getKyivToday()): number | null {
  const d = calendarDayMs(deadline);
  const t = calendarDayMs(today);
  if (d === null || t === null) return null;
  // Both are UTC midnights, so the difference is an exact multiple of a day.
  return Math.round((d - t) / DAY_MS);
}

/** Due today through DEADLINE_SOON_DAYS days ahead. */
export function isDeadlineSoon(deadline: string, today?: string): boolean {
  const days = getDaysUntilDeadline(deadline, today);
  return days !== null && days >= 0 && days <= DEADLINE_SOON_DAYS;
}

/** Deadline date is before Kyiv-today. Due today is still open. */
export function isDeadlinePassed(deadline: string, today?: string): boolean {
  const days = getDaysUntilDeadline(deadline, today);
  return days !== null && days < 0;
}
