"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Opportunity } from "@/lib/data";

export function usePublicOrgProjects() {
  const supabase = useMemo(() => createClient(), []);
  const [projects, setProjects] = useState<Opportunity[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("org_projects")
        .select("*, orgs!inner(name, status)")
        .eq("status", "published")
        .eq("orgs.status", "verified")
        .order("created_at", { ascending: false });

      if (!data) { setReady(true); return; }

      const mapped: Opportunity[] = data.map((row) => {
        const org = row.orgs as { name: string };
        return {
          slug:             row.id as string,
          type:             (row.type as Opportunity["type"]) ?? "exchange",
          typeName:         (row.type_name as string) ?? "",
          org:              org?.name ?? "",
          title:            (row.title as string) ?? "",
          shortDescription: (row.short_description as string) ?? "",
          fullDescription:  (row.full_description as string) ?? "",
          deadline:         (row.deadline as string) ?? "",
          deadlineDisplay:  (row.deadline_display as string) ?? "",
          flag:             (row.flag as string) ?? "🇺🇦",
          location:         (row.location as string) ?? "",
          country:          (row.country as string) ?? "",
          format:           (row.format as Opportunity["format"]) ?? "offline",
          languages:        (row.languages as string[]) ?? [],
          ageMin:           row.age_min as number | undefined,
          ageMax:           row.age_max as number | undefined,
          funding:          (row.funding as Opportunity["funding"]) ?? "fully-funded",
          fundingDetails:   (row.funding_details as string) ?? "",
          requirements:     (row.requirements as string[]) ?? [],
          benefits:         (row.benefits as string[]) ?? [],
          tags:             (row.tags as string[]) ?? [],
          applyUrl:         `/opportunities/${row.id}/apply`,
          duration:         (row.duration as string) ?? "",
        };
      });

      setProjects(mapped);
      setReady(true);
    }
    load();
  }, [supabase]);

  return { projects, ready };
}
