"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

export type StandardBlock = "block_contacts" | "block_education" | "block_motivation" | "block_documents";

export interface FormQuestion {
  id: string;
  type: "text" | "textarea" | "select" | "radio" | "checkbox" | StandardBlock;
  label: string;
  description?: string;
  placeholder?: string;
  options?: string[];
  required: boolean;
}

export const STANDARD_BLOCKS: { type: StandardBlock; label: string; desc: string; icon: string }[] = [
  { type: "block_contacts",   label: "Контакти",          desc: "Телефон, країна",               icon: "📍" },
  { type: "block_education",  label: "Освіта",             desc: "Заклад, ступінь, мови",         icon: "🎓" },
  { type: "block_motivation", label: "Мотиваційний лист",  desc: "Текст від 300 символів",        icon: "✍️" },
  { type: "block_documents",  label: "CV та портфоліо",    desc: "Посилання на документи",        icon: "📎" },
];

export interface OrgProject {
  id: string;
  orgId: string;
  title: string;
  type: string;
  typeName: string;
  shortDescription: string;
  fullDescription: string;
  requirements: string[];
  benefits: string[];
  tags: string[];
  deadline: string;
  deadlineDisplay: string;
  country: string;
  city: string;
  location: string;
  flag: string;
  format: "online" | "offline" | "hybrid";
  funding: "fully-funded" | "partially-funded" | "self-funded";
  fundingDetails?: string;
  duration?: string;
  languages: string[];
  ageMin?: number;
  ageMax?: number;
  status: "draft" | "published" | "closed";
  autoClose?: boolean;
  formQuestions?: FormQuestion[];
  externalApplyUrl?: string;
  views: number;
  saves: number;
  createdAt: string;
  updatedAt: string;
}

// Kept for ApplyForm backward compat — no longer a real org ID
export const DEMO_ORG_ID = "";

function fromRow(row: Record<string, unknown>): OrgProject {
  return {
    id:               (row.id as string) ?? "",
    orgId:            (row.org_id as string) ?? "",
    title:            (row.title as string) ?? "",
    type:             (row.type as string) ?? "",
    typeName:         (row.type_name as string) ?? "",
    shortDescription: (row.short_description as string) ?? "",
    fullDescription:  (row.full_description as string) ?? "",
    requirements:     (row.requirements as string[]) ?? [],
    benefits:         (row.benefits as string[]) ?? [],
    tags:             (row.tags as string[]) ?? [],
    deadline:         (row.deadline as string) ?? "",
    deadlineDisplay:  (row.deadline_display as string) ?? "",
    country:          (row.country as string) ?? "",
    city:             (row.city as string) ?? "",
    location:         (row.location as string) ?? "",
    flag:             (row.flag as string) ?? "🇺🇦",
    format:           (row.format as OrgProject["format"]) ?? "offline",
    funding:          (row.funding as OrgProject["funding"]) ?? "fully-funded",
    fundingDetails:   (row.funding_details as string) ?? "",
    duration:         (row.duration as string) ?? "",
    languages:        (row.languages as string[]) ?? [],
    ageMin:           row.age_min as number | undefined,
    ageMax:           row.age_max as number | undefined,
    status:           (row.status as OrgProject["status"]) ?? "draft",
    autoClose:        (row.auto_close as boolean) ?? false,
    formQuestions:    (row.form_questions as FormQuestion[]) ?? [],
    externalApplyUrl: (row.external_apply_url as string) || undefined,
    views:            (row.views as number) ?? 0,
    saves:            (row.saves as number) ?? 0,
    createdAt:        (row.created_at as string) ?? "",
    updatedAt:        (row.updated_at as string) ?? "",
  };
}

function toRow(data: Partial<OrgProject>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (data.title            !== undefined) row.title             = data.title;
  if (data.type             !== undefined) row.type              = data.type;
  if (data.typeName         !== undefined) row.type_name         = data.typeName;
  if (data.shortDescription !== undefined) row.short_description = data.shortDescription;
  if (data.fullDescription  !== undefined) row.full_description  = data.fullDescription;
  if (data.requirements     !== undefined) row.requirements      = data.requirements;
  if (data.benefits         !== undefined) row.benefits          = data.benefits;
  if (data.tags             !== undefined) row.tags              = data.tags;
  if (data.deadline         !== undefined) row.deadline          = data.deadline;
  if (data.deadlineDisplay  !== undefined) row.deadline_display  = data.deadlineDisplay;
  if (data.country          !== undefined) row.country           = data.country;
  if (data.city             !== undefined) row.city              = data.city;
  if (data.location         !== undefined) row.location          = data.location;
  if (data.flag             !== undefined) row.flag              = data.flag;
  if (data.format           !== undefined) row.format            = data.format;
  if (data.funding          !== undefined) row.funding           = data.funding;
  if (data.fundingDetails   !== undefined) row.funding_details   = data.fundingDetails;
  if (data.duration         !== undefined) row.duration          = data.duration;
  if (data.languages        !== undefined) row.languages         = data.languages;
  if (data.ageMin           !== undefined) row.age_min           = data.ageMin;
  if (data.ageMax           !== undefined) row.age_max           = data.ageMax;
  if (data.status           !== undefined) row.status            = data.status;
  if (data.autoClose        !== undefined) row.auto_close        = data.autoClose;
  if (data.formQuestions    !== undefined) row.form_questions    = data.formQuestions;
  if (data.externalApplyUrl) row.external_apply_url = data.externalApplyUrl;
  return row;
}

export function useOrgProjects(orgId?: string) {
  const supabase = useMemo(() => createClient(), []);
  const [projects, setProjects] = useState<OrgProject[]>([]);
  const [ready, setReady] = useState(false);

  const reload = useCallback(async () => {
    if (!orgId) { setProjects([]); setReady(true); return; }
    const { data } = await supabase
      .from("org_projects")
      .select("*")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false });
    setProjects((data ?? []).map((r) => fromRow(r as Record<string, unknown>)));
    setReady(true);
  }, [supabase, orgId]);

  useEffect(() => { reload(); }, [reload]);

  const create = useCallback(
    async (data: Omit<OrgProject, "id" | "createdAt" | "updatedAt" | "views" | "saves">): Promise<OrgProject> => {
      if (!orgId) throw new Error("orgId required");
      const row = { ...toRow(data as Partial<OrgProject>), org_id: orgId };
      const { data: created, error } = await supabase
        .from("org_projects")
        .insert(row)
        .select()
        .single();
      if (error) throw error;
      const project = fromRow(created as Record<string, unknown>);
      setProjects((prev) => [project, ...prev]);
      return project;
    },
    [supabase, orgId]
  );

  const update = useCallback(
    async (id: string, data: Partial<OrgProject>) => {
      const { error } = await supabase
        .from("org_projects")
        .update(toRow(data))
        .eq("id", id);
      if (!error) {
        setProjects((prev) =>
          prev.map((p) => (p.id === id ? { ...p, ...data } : p))
        );
      }
    },
    [supabase]
  );

  const remove = useCallback(
    async (id: string) => {
      await supabase.from("org_projects").delete().eq("id", id);
      setProjects((prev) => prev.filter((p) => p.id !== id));
    },
    [supabase]
  );

  return { projects, ready, create, update, remove, reload };
}
