"use client";

import { useState, useEffect, useCallback } from "react";

export interface NotificationSettings {
  newApplication: boolean;
  dailyDigest: boolean;
  digestEmail: string;
}

const KEY = "mozhyvo_notification_settings";

const DEFAULT: NotificationSettings = {
  newApplication: true,
  dailyDigest: false,
  digestEmail: "org@mozhyvo.org",
};

function load(): NotificationSettings {
  try { const s = localStorage.getItem(KEY); return s ? { ...DEFAULT, ...JSON.parse(s) } : DEFAULT; }
  catch { return DEFAULT; }
}

export function useNotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT);

  useEffect(() => { setSettings(load()); }, []);

  const update = useCallback((data: Partial<NotificationSettings>) => {
    const updated = { ...load(), ...data };
    localStorage.setItem(KEY, JSON.stringify(updated));
    setSettings(updated);
  }, []);

  return { settings, update };
}
