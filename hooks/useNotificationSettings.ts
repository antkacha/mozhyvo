"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

export interface NotificationSettings {
  newApplication: boolean;
  dailyDigest: boolean;
  digestEmail: string;
}

const DEFAULT: NotificationSettings = {
  newApplication: true,
  dailyDigest: false,
  digestEmail: "",
};

export function useNotificationSettings() {
  const supabase = useMemo(() => createClient(), []);
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const saved = user.user_metadata?.org_notif_settings as NotificationSettings | undefined;
      setSettings({
        ...DEFAULT,
        ...saved,
        digestEmail: saved?.digestEmail ?? user.email ?? "",
      });
    });
  }, [supabase]);

  const update = useCallback(async (data: Partial<NotificationSettings>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const updated: NotificationSettings = {
      ...settings,
      ...data,
    };
    setSettings(updated);
    setSaving(true);
    await supabase.auth.updateUser({
      data: { org_notif_settings: updated },
    });
    setSaving(false);
  }, [supabase, settings]);

  return { settings, saving, update };
}
