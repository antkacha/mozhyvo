"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

export interface UserNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  data?: Record<string, unknown>;
  createdAt: string;
}

export function useNotifications() {
  const supabase = useMemo(() => createClient(), []);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setReady(true); return; }

    const { data } = await supabase
      .from("user_notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    setNotifications(data ? data.map((r) => ({
      id: r.id as string,
      type: r.type as string,
      title: r.title as string,
      message: r.message as string,
      read: r.read as boolean,
      data: r.data as Record<string, unknown> | undefined,
      createdAt: r.created_at as string,
    })) : []);
    setReady(true);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const markRead = useCallback(async (id: string) => {
    await supabase.from("user_notifications").update({ read: true }).eq("id", id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }, [supabase]);

  const markAllRead = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("user_notifications").update({ read: true }).eq("user_id", user.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [supabase]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, ready, markRead, markAllRead, reload: load };
}
