"use client";

import { useState, useEffect, useCallback } from "react";

export interface AppNote {
  id: string;
  applicationId: string;
  content: string;
  authorName: string;
  createdAt: string;
}

const KEY = "mozhyvo_app_notes";
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000).toISOString();

const SEED: AppNote[] = [
  { id: "note-001", applicationId: "oa-002", content: "Сильний кандидат. Перевірити рекомендаційного листа.", authorName: "Фонд «Молодь України»", createdAt: daysAgo(2) },
  { id: "note-002", applicationId: "oa-003", content: "Відмінний профіль. Підтвердити участь.", authorName: "Фонд «Молодь України»", createdAt: daysAgo(1) },
  { id: "note-003", applicationId: "oa-006", content: "Проект цікавий, але не відповідає цільовій аудиторії (молодь 16–30 р.). Порадити інший грант.", authorName: "Фонд «Молодь України»", createdAt: daysAgo(1) },
];

function load(): AppNote[] {
  try { const s = localStorage.getItem(KEY); return s ? JSON.parse(s) : []; } catch { return []; }
}
function save(n: AppNote[]) { localStorage.setItem(KEY, JSON.stringify(n)); }

export function useAppNotes(applicationId?: string) {
  const [notes, setNotes] = useState<AppNote[]>([]);

  const reload = useCallback(() => {
    let all = load();
    if (all.length === 0) { all = SEED; save(all); }
    setNotes(applicationId ? all.filter((n) => n.applicationId === applicationId) : all);
  }, [applicationId]);

  useEffect(() => { reload(); }, [reload]);

  const addNote = useCallback(
    (content: string, authorName: string): AppNote | undefined => {
      if (!applicationId || !content.trim()) return undefined;
      const all = load();
      const note: AppNote = {
        id: `note-${Date.now()}`,
        applicationId,
        content: content.trim(),
        authorName,
        createdAt: new Date().toISOString(),
      };
      const updated = [note, ...all];
      save(updated);
      setNotes(updated.filter((n) => n.applicationId === applicationId));
      return note;
    },
    [applicationId]
  );

  const deleteNote = useCallback(
    (id: string) => {
      const updated = load().filter((n) => n.id !== id);
      save(updated);
      setNotes(applicationId ? updated.filter((n) => n.applicationId === applicationId) : updated);
    },
    [applicationId]
  );

  return { notes, addNote, deleteNote, reload };
}
