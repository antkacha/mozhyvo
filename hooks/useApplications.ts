"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

export interface Application {
  id: string;
  opportunitySlug: string;
  opportunityTitle: string;
  org: string;
  deadline: string;
  submittedAt: string;
  status: "pending" | "reviewing" | "accepted" | "rejected";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  institution: string;
  degree: string;
  graduationYear: string;
  languages: string[];
  motivation: string;
  cvUrl: string;
  portfolioUrl: string;
  customAnswers?: Record<string, string | string[]>;
}

// Map Supabase snake_case row → camelCase Application
function fromRow(row: Record<string, unknown>): Application {
  return {
    id: row.id as string,
    opportunitySlug: row.opportunity_slug as string,
    opportunityTitle: row.opportunity_title as string,
    org: row.org as string,
    deadline: row.deadline as string,
    submittedAt: row.submitted_at as string,
    status: row.status as Application["status"],
    firstName: row.first_name as string,
    lastName: row.last_name as string,
    email: row.email as string,
    phone: row.phone as string,
    country: row.country as string,
    institution: row.institution as string,
    degree: row.degree as string,
    graduationYear: row.graduation_year as string,
    languages: row.languages as string[],
    motivation: row.motivation as string,
    cvUrl: row.cv_url as string,
    portfolioUrl: row.portfolio_url as string,
    customAnswers: (row.custom_answers as Record<string, string | string[]>) || undefined,
  };
}

export function useApplications() {
  const supabase = useMemo(() => createClient(), []);
  const [applications, setApplications] = useState<Application[]>([]);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setApplications([]);
      setReady(true);
      return;
    }
    const { data } = await supabase
      .from("applications")
      .select("*")
      .eq("user_id", user.id)
      .order("submitted_at", { ascending: false });
    setApplications(data ? data.map(fromRow) : []);
    setReady(true);
  }, [supabase]);

  useEffect(() => {
    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") load();
      else if (event === "SIGNED_OUT") { setApplications([]); setReady(true); }
    });

    return () => subscription.unsubscribe();
  }, [load, supabase]);

  const submit = useCallback(
    async (app: Omit<Application, "id" | "submittedAt" | "status"> & { customAnswers?: Record<string, string | string[]> }) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }
      const { data, error } = await supabase
        .from("applications")
        .insert({
          user_id: user.id,
          opportunity_slug: app.opportunitySlug,
          opportunity_title: app.opportunityTitle,
          org: app.org,
          deadline: app.deadline,
          first_name: app.firstName,
          last_name: app.lastName,
          email: app.email,
          phone: app.phone,
          country: app.country,
          institution: app.institution,
          degree: app.degree,
          graduation_year: app.graduationYear,
          languages: app.languages,
          motivation: app.motivation,
          cv_url: app.cvUrl,
          portfolio_url: app.portfolioUrl,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      if (data) {
        const newApp = fromRow(data);
        setApplications((prev) => [newApp, ...prev]);

        // Forward to org via admin API (bypasses RLS on org_projects + org_applications)
        {
          const res = await fetch("/api/org/applications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              project_id:    app.opportunitySlug,
              project_title: app.opportunityTitle,
              first_name:    app.firstName,
              last_name:     app.lastName,
              email:         app.email,
              phone:         app.phone,
              country:       app.country,
              institution:   app.institution,
              degree:        app.degree,
              motivation:    app.motivation,
              languages:     app.languages,
              cv_url:        app.cvUrl,
              portfolio_url: app.portfolioUrl,
              custom_answers: app.customAnswers ?? {},
            }),
          });
          if (!res.ok) {
            const json = await res.json() as { error?: string };
            // Only throw if it's not a "project not found" case (static opportunities don't have org_id)
            if (res.status !== 404) throw new Error(`org_applications failed: ${json.error ?? res.status}`);
          }
        }

        return newApp;
      }
    },
    [supabase]
  );

  const hasApplied = useCallback(
    (slug: string) => applications.some((a) => a.opportunitySlug === slug),
    [applications]
  );

  return { applications, submit, hasApplied, ready };
}
