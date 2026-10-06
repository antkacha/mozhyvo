"use client";

import { useState, useEffect, useCallback } from "react";
import type { OrgAccess } from "@/lib/org-access";

export type { OrgAccess };

export type ActiveContext = "personal" | "org";

interface ContextResponse {
  hasOrgAccess: boolean;
  org: OrgAccess | null;
  orgs: OrgAccess[];
  activeOrgId: string | null;
  activeContext: ActiveContext;
}

/**
 * Which identity — personal candidate or one of the user's orgs — the
 * header/nav currently show. Source of truth for which orgs the user has is
 * always a fresh orgs/org_members query (never user_metadata — that field
 * has lied about org status before). The active context and active org live
 * in cookies (mzv_active_context, mzv_active_org) so they survive reloads;
 * initialContext comes from the server (layout.tsx read the cookie) to avoid
 * a flash.
 *
 * If the lookup fails, `error` is set and the previous state is kept — a
 * failed request must never look like "you have no orgs".
 */
export function useAccountContext(initialContext: ActiveContext = "personal") {
  const [activeContext, setActiveContext] = useState<ActiveContext>(initialContext);
  const [orgs, setOrgs] = useState<OrgAccess[]>([]);
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setError(false);
    fetch("/api/me/context")
      .then(async (r) => {
        if (!r.ok) throw new Error(`context ${r.status}`);
        return r.json() as Promise<ContextResponse>;
      })
      .then((data) => {
        setOrgs(data.orgs ?? []);
        setActiveOrgId(data.activeOrgId);
        setActiveContext(data.activeContext);
      })
      .catch(() => setError(true))
      .finally(() => setReady(true));
  }, []);

  useEffect(() => { load(); }, [load]);

  const switchContext = useCallback(async (context: ActiveContext, orgId?: string) => {
    const res = await fetch("/api/me/context", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ context, orgId }),
    });
    if (!res.ok) {
      // Access was revoked since this component mounted (e.g. an admin
      // deleted the org) — the switcher's cached org list is stale.
      // Refetch instead of leaving a dead entry in the dropdown until the
      // next full page load.
      if (res.status === 403) load();
      else setError(true);
      return;
    }
    // Full navigation, not router.push — guarantees every hook/component
    // downstream (org-scoped data, cached client state) re-evaluates
    // against the new context instead of trusting a soft transition.
    window.location.href = context === "org" ? "/dashboard" : "/cabinet";
  }, [load]);

  const org = orgs.find((o) => o.id === activeOrgId) ?? null;
  const hasOrgAccess = orgs.length > 0;

  return { activeContext, hasOrgAccess, org, orgs, activeOrgId, ready, error, retry: load, switchContext };
}
