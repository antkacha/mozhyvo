"use client";

import { useState, useEffect, useCallback } from "react";
import type { OrgProfile } from "@/lib/demo-org";

export type { OrgProfile };

const KEY = "mozhyvo_org_profile";

export function useOrgSession() {
  const [org, setOrg] = useState<OrgProfile | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      setOrg(stored ? (JSON.parse(stored) as OrgProfile) : null);
    } catch {
      setOrg(null);
    }
    setReady(true);
  }, []);

  const login = useCallback((profile: OrgProfile) => {
    localStorage.setItem(KEY, JSON.stringify(profile));
    setOrg(profile);
  }, []);

  const update = useCallback(
    (data: Partial<OrgProfile>) => {
      setOrg((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, ...data };
        localStorage.setItem(KEY, JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(KEY);
    setOrg(null);
  }, []);

  return { org, ready, login, update, logout };
}
