"use client";

import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";

export function useOrgAccess(user: User | null, authLoading: boolean) {
  const [hasDashboard, setHasDashboard] = useState<boolean | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setHasDashboard(false); return; }

    fetch("/api/me/org-access")
      .then((r) => r.json() as Promise<{ hasDashboard: boolean }>)
      .then(({ hasDashboard }) => setHasDashboard(hasDashboard))
      .catch(() => setHasDashboard(false));
  }, [user, authLoading]);

  return hasDashboard;
}
