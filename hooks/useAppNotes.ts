"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface AppNote {
  id: string;
  application_id: string; // TEXT "app-<uuid>"
  org_id: string;
  author_id: string | null;
  author_name: string;
  content: string;
  created_at: string;
}

export function useAppNotes(applicationId?: string) {
  const [notes, setNotes] = useState<AppNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    createClient().auth.getUser().then(({ data }) => {
      setCurrentUserId(data.user?.id ?? null);
    });
  }, []);

  const reload = useCallback(async () => {
    if (!applicationId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/org/notes?applicationId=${encodeURIComponent(applicationId)}`);
      if (!res.ok) throw new Error(await res.text());
      const { notes: data } = await res.json() as { notes: AppNote[] };
      setNotes(data);
    } catch {
      setError("Не вдалось завантажити нотатки");
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => { reload(); }, [reload]);

  const addNote = useCallback(async (content: string): Promise<AppNote> => {
    if (!applicationId || !content.trim()) throw new Error("Missing data");
    const res = await fetch("/api/org/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId, content: content.trim() }),
    });
    if (!res.ok) {
      const { error } = await res.json() as { error: string };
      throw new Error(error ?? "Failed to add note");
    }
    const { note } = await res.json() as { note: AppNote };
    setNotes((prev) => [note, ...prev]);
    return note;
  }, [applicationId]);

  const deleteNote = useCallback(async (id: string) => {
    const res = await fetch(`/api/org/notes/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const { error } = await res.json() as { error: string };
      throw new Error(error ?? "Failed to delete note");
    }
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notes, loading, error, addNote, deleteNote, reload, currentUserId };
}
