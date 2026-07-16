"use client";

import { useState, useEffect, useCallback } from "react";

export interface ActivityEntry {
  id: string;
  application_id: string; // TEXT "app-<uuid>"
  org_id: string;
  actor_id: string | null;
  actor_name: string;
  action: "status_changed" | "note_added";
  detail: string;
  created_at: string;
}

export function useActivityLog(applicationId?: string) {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!applicationId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/org/activity?applicationId=${encodeURIComponent(applicationId)}`);
      if (!res.ok) throw new Error(await res.text());
      const { entries: data } = await res.json() as { entries: ActivityEntry[] };
      setEntries(data);
    } catch {
      setError("Не вдалось завантажити журнал");
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => { reload(); }, [reload]);

  return { entries, loading, error, reload };
}
