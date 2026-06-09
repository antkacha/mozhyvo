"use client";

import { useState, useEffect, useCallback } from "react";

export interface ActivityEntry {
  id: string;
  applicationId: string;
  action: "status_changed" | "note_added" | "exported" | "viewed";
  detail: string;
  author: string;
  createdAt: string;
}

const KEY = "mozhyvo_activity_log";

const now = () => new Date().toISOString();
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

const SEED: ActivityEntry[] = [
  { id: "act-001", applicationId: "oa-002", action: "status_changed", detail: "Статус змінено: Нова → Розглядається", author: "Фонд «Молодь України»", createdAt: daysAgo(2) },
  { id: "act-002", applicationId: "oa-003", action: "status_changed", detail: "Статус змінено: Нова → Розглядається", author: "Фонд «Молодь України»", createdAt: daysAgo(3) },
  { id: "act-003", applicationId: "oa-003", action: "status_changed", detail: "Статус змінено: Розглядається → Відібрано", author: "Фонд «Молодь України»", createdAt: daysAgo(1) },
  { id: "act-004", applicationId: "oa-006", action: "status_changed", detail: "Статус змінено: Нова → Відхилено", author: "Фонд «Молодь України»", createdAt: daysAgo(1) },
];

function load(): ActivityEntry[] {
  try { const s = localStorage.getItem(KEY); return s ? JSON.parse(s) : []; } catch { return []; }
}
function save(e: ActivityEntry[]) { localStorage.setItem(KEY, JSON.stringify(e)); }

export function useActivityLog(applicationId?: string) {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);

  const reload = useCallback(() => {
    let all = load();
    if (all.length === 0) { all = SEED; save(all); }
    setEntries(applicationId ? all.filter((e) => e.applicationId === applicationId) : all);
  }, [applicationId]);

  useEffect(() => { reload(); }, [reload]);

  const addEntry = useCallback(
    (entry: Omit<ActivityEntry, "id" | "createdAt">) => {
      const all = load();
      const e: ActivityEntry = { ...entry, id: `act-${Date.now()}`, createdAt: now() };
      const updated = [e, ...all];
      save(updated);
      setEntries(applicationId ? updated.filter((x) => x.applicationId === applicationId) : updated);
      return e;
    },
    [applicationId]
  );

  return { entries, addEntry, reload };
}
