"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface OrgApplication {
  id: string;
  projectId: string;
  projectTitle: string;
  applicantUserId?: string;
  avatarUrl?: string;
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

function fromRow(row: Record<string, unknown>): OrgApplication {
  return {
    id:              (row.id as string) ?? "",
    projectId:       (row.project_id as string) ?? "",
    projectTitle:    (row.project_title as string) ?? "",
    applicantUserId: (row.applicant_user_id as string) ?? undefined,
    avatarUrl:       (row.avatar_url as string) || undefined,
    firstName:       (row.first_name as string) ?? "",
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
  const [applications, setApplications] = useState<OrgApplication[]>([]);
  const [ready, setReady] = useState(false);

  const appsRef = useRef<OrgApplication[]>([]);
  useEffect(() => { appsRef.current = applications; }, [applications]);

  const reload = useCallback(async () => {
    if (!orgId) { setApplications([]); setReady(true); return; }

    const url = `/api/org/applications${projectId ? `?projectId=${projectId}` : ""}`;
    const res = await fetch(url);
    if (!res.ok) { setReady(true); return; }

    const { applications: data } = await res.json() as { applications: Record<string, unknown>[] };
    setApplications((data ?? []).map(fromRow));
    setReady(true);
  }, [orgId, projectId]);

  useEffect(() => { reload(); }, [reload]);

  const updateApp = useCallback(
    async (id: string, data: Partial<OrgApplication>) => {
      const current = appsRef.current.find((a) => a.id === id);
      const row: Record<string, unknown> = {};
      if (data.status       !== undefined) row.status        = data.status;
      if (data.internalNote !== undefined) row.internal_note = data.internalNote;

      const res = await fetch(`/api/org/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(row),
      });

      if (!res.ok) {
        const json = await res.json() as { error?: string };
        throw new Error(json.error ?? "Update failed");
      }

      setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, ...data } : a)));

      if (data.status !== undefined && current) {
        fetch("/api/org/sync-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orgAppId:     id,
            orgStatus:    data.status,
            projectId:    current.projectId,
            email:        current.email,
            projectTitle: current.projectTitle,
          }),
        }).then((r) => {
          if (!r.ok) console.error("[status-sync] failed:", r.status);
        });
      }
    },
    []
  );

  return { applications, ready, updateApp, reload };
}
