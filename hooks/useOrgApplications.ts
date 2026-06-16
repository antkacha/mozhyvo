"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

export interface OrgApplication {
  id: string;
  projectId: string;
  projectTitle: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country: string;
  institution: string;
  degree: string;
  motivation: string;
  languages: string[];
  cvUrl?: string;
  portfolioUrl?: string;
  customAnswers?: Record<string, string | string[]>;
  status: "new" | "reviewing" | "selected" | "rejected";
  internalNote?: string;
  submittedAt: string;
}

// Maps org status → user-facing status in applications table
const USER_STATUS: Record<OrgApplication["status"], string> = {
  new:       "pending",
  reviewing: "reviewing",
  selected:  "accepted",
  rejected:  "rejected",
};

function fromRow(row: Record<string, unknown>): OrgApplication {
  return {
    id:            (row.id as string) ?? "",
    projectId:     (row.project_id as string) ?? "",
    projectTitle:  (row.project_title as string) ?? "",
    firstName:     (row.first_name as string) ?? "",
    lastName:      (row.last_name as string) ?? "",
    email:         (row.email as string) ?? "",
    phone:         (row.phone as string) ?? "",
    country:       (row.country as string) ?? "",
    institution:   (row.institution as string) ?? "",
    degree:        (row.degree as string) ?? "",
    motivation:    (row.motivation as string) ?? "",
    languages:     (row.languages as string[]) ?? [],
    cvUrl:         (row.cv_url as string) ?? "",
    portfolioUrl:  (row.portfolio_url as string) ?? "",
    customAnswers: (row.custom_answers as Record<string, string | string[]>) ?? {},
    status:        (row.status as OrgApplication["status"]) ?? "new",
    internalNote:  (row.internal_note as string) ?? "",
    submittedAt:   (row.submitted_at as string) ?? "",
  };
}

export function useOrgApplications(orgId?: string, projectId?: string) {
  const supabase = useMemo(() => createClient(), []);
  const [applications, setApplications] = useState<OrgApplication[]>([]);
  const [ready, setReady] = useState(false);

  // Keep a ref so updateApp can read latest apps without dep array issues
  const appsRef = useRef<OrgApplication[]>([]);
  useEffect(() => { appsRef.current = applications; }, [applications]);

  const reload = useCallback(async () => {
    if (!orgId) { setApplications([]); setReady(true); return; }
    let query = supabase
      .from("org_applications")
      .select("*")
      .eq("org_id", orgId)
      .order("submitted_at", { ascending: false });
    if (projectId) query = query.eq("project_id", projectId);
    const { data } = await query;
    const mapped = (data ?? []).map((r) => fromRow(r as Record<string, unknown>));
    setApplications(mapped);
    setReady(true);
  }, [supabase, orgId, projectId]);

  useEffect(() => { reload(); }, [reload]);

  const updateApp = useCallback(
    async (id: string, data: Partial<OrgApplication>) => {
      const current = appsRef.current.find((a) => a.id === id);
      const row: Record<string, unknown> = {};
      if (data.status       !== undefined) row.status        = data.status;
      if (data.internalNote !== undefined) row.internal_note = data.internalNote;

      const { error } = await supabase
        .from("org_applications")
        .update(row)
        .eq("id", id);

      if (!error) {
        setApplications((prev) =>
          prev.map((a) => (a.id === id ? { ...a, ...data } : a))
        );

        // Sync status change to user's applications table via admin API (bypasses RLS)
        if (data.status !== undefined && current) {
          fetch("/api/org/sync-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orgAppId:  id,
              orgStatus: data.status,
              projectId: current.projectId,
              email:     current.email,
            }),
          }).then((r) => {
            if (!r.ok) console.error("[status-sync] failed:", r.status);
          });
        }
      } else {
        throw new Error(error.message);
      }
    },
    [supabase]
  );

  return { applications, ready, updateApp, reload };
}
