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

function fromRow(row: Record<string, unknown>): Application {
  return {
    id:               row.id as string,
    opportunitySlug:  row.opportunity_slug as string,
    opportunityTitle: row.opportunity_title as string,
    org:              row.org as string,
    deadline:         row.deadline as string,
    submittedAt:      row.submitted_at as string,
    status:           row.status as Application["status"],
    firstName:        row.first_name as string,
    lastName:         row.last_name as string,
    email:            row.email as string,
    phone:            row.phone as string,
    country:          row.country as string,
    institution:      row.institution as string,
    degree:           row.degree as string,
    graduationYear:   row.graduation_year as string,
    languages:        row.languages as string[],
    motivation:       row.motivation as string,
    cvUrl:            row.cv_url as string,
    portfolioUrl:     row.portfolio_url as string,
    customAnswers:    (row.custom_answers as Record<string, string | string[]>) || undefined,
  };
}

export function useApplications() {
  const supabase = useMemo(() => createClient(), []);
  const [applications, setApplications] = useState<Application[]>([]);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setApplications([]); setReady(true); return; }
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") load();
      else if (event === "SIGNED_OUT") { setApplications([]); setReady(true); }
    });
    return () => subscription.unsubscribe();
  }, [load, supabase]);

  const submit = useCallback(
    async (
      app: Omit<Application, "id" | "submittedAt" | "status"> & {
        customAnswers?: Record<string, string | string[]>;
      }
    ) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }

      // Atomic: validates project + creates applications row + creates/resurrects org_applications.
      // Handles both fresh apply and resubmit after withdrawal in one transaction.
      const { data: newId, error } = await supabase.rpc("submit_application", {
        p_project_id: app.opportunitySlug,
        p_app_data: {
          opportunity_title: app.opportunityTitle,
          org:               app.org,
          deadline:          app.deadline,
          first_name:        app.firstName,
          last_name:         app.lastName,
          email:             app.email,
          phone:             app.phone,
          country:           app.country,
          institution:       app.institution,
          degree:            app.degree,
          graduation_year:   app.graduationYear,
          languages:         app.languages,
          motivation:        app.motivation,
          cv_url:            app.cvUrl,
          portfolio_url:     app.portfolioUrl,
          custom_answers:    app.customAnswers ?? {},
        },
      });

      if (error) {
        if (error.code === "P0003") throw new Error("Проект недоступний для подачі");
        if (error.code === "P0004") throw new Error("Ви вже подали заявку на цей проект");
        throw new Error(error.message);
      }

      // Fetch the created row to update local state and return to the caller
      const { data: row, error: fetchError } = await supabase
        .from("applications")
        .select("*")
        .eq("id", newId as string)
        .single();

      if (fetchError || !row) throw new Error("Заявку збережено, але не вдалось отримати дані");

      const newApp = fromRow(row as Record<string, unknown>);
      setApplications((prev) => [newApp, ...prev]);
      return newApp;
    },
    [supabase]
  );

  const hasApplied = useCallback(
    (slug: string) => applications.some((a) => a.opportunitySlug === slug),
    [applications]
  );

  return { applications, submit, hasApplied, ready };
}
