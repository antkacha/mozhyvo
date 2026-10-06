// Minimal fixed-window rate limiter, in memory.
//
// LIMITATION: state lives in the serverless instance's memory. On Vercel each
// warm instance keeps its own counters and a cold start resets them, so this
// only slows down bursts that land on the same instance — it is NOT a global
// limit. Routes using it also rely on a data-level guard (e.g. "only email
// when the status actually changed", "don't re-mail an existing subscriber").
// Replace with a shared store (e.g. Upstash Redis) for real global limits.

type Window = { start: number; count: number };
const windows = new Map<string, Window>();
const MAX_KEYS = 10_000;

/** Returns true if the call is allowed, false if `key` exceeded `limit` within `windowMs`. */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const w = windows.get(key);
  if (!w || now - w.start >= windowMs) {
    if (windows.size >= MAX_KEYS) {
      windows.forEach((v, k) => { if (now - v.start >= windowMs) windows.delete(k); });
      if (windows.size >= MAX_KEYS) windows.clear();
    }
    windows.set(key, { start: now, count: 1 });
    return true;
  }
  w.count++;
  return w.count <= limit;
}

/** Best-effort client IP (Vercel sets x-forwarded-for / x-real-ip). */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}
