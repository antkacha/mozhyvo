"use client";

import { useState, useEffect, useCallback } from "react";

export interface OrgAccess {
  id: string;
  name: string;
  isOwner: boolean;
}

export type ActiveContext = "personal" | "org";

interface ContextResponse {
  hasOrgAccess: boolean;
  org: OrgAccess | null;
  activeContext: ActiveContext;
}

/**
 * Which identity — personal candidate or org team member — the header/nav
 * currently show. Source of truth for "do I have org access at all" is
 * always a fresh orgs/org_members query (never user_metadata — that field
 * has lied about org status before). The active context itself lives in
 * a cookie (mzv_active_context) so it survives reloads; initialContext
 * comes from the server (layout.tsx read the cookie) to avoid a flash.
 */
export function useAccountContext(initialContext: ActiveContext = "personal") {
  const [activeContext, setActiveContext] = useState<ActiveContext>(initialContext);
  const [hasOrgAccess, setHasOrgAccess] = useState(false);
  const [org, setOrg] = useState<OrgAccess | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/me/context")
      .then((r) => r.json() as Promise<ContextResponse>)
      .then((data) => {
        setHasOrgAccess(data.hasOrgAccess);
        setOrg(data.org);
        setActiveContext(data.activeContext);
        setReady(true);
      })
      .catch(() => setReady(true));
  }, []);

  const switchContext = useCallback(async (context: ActiveContext) => {
    const res = await fetch("/api/me/context", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ context }),
    });
    if (!res.ok) return;
    // Full navigation, not router.push — guarantees every hook/component
    // downstream (org-scoped data, cached client state) re-evaluates
    // against the new context instead of trusting a soft transition.
    window.location.href = context === "org" ? "/dashboard" : "/cabinet";
  }, []);

  return { activeContext, hasOrgAccess, org, ready, switchContext };
}
