"use client";

import { useState, useEffect } from "react";
import type { Opportunity } from "@/lib/data";

export function usePublicOrgProjects() {
  const [projects, setProjects] = useState<Opportunity[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/public/opportunities");
        if (!res.ok) { setReady(true); return; }
        const { projects: data } = await res.json() as { projects: Record<string, unknown>[] };
        if (!data) { setReady(true); return; }

        const mapped: Opportunity[] = data.map((row) => {
          const org = row.orgs as { id: string; name: string; slug?: string };
          return {
            slug:             row.id as string,
            type:             (row.type as Opportunity["type"]) ?? "exchange",
            typeName:         (row.type_name as string) ?? "",
            org:              org?.name ?? "",
            orgSlug:          org?.slug || org?.id,
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
            applyUrl:         (row.external_apply_url as string) || `/opportunities/${row.id}/apply`,
            duration:         (row.duration as string) ?? "",
          };
        });

        setProjects(mapped);
      } finally {
        setReady(true);
      }
    }
    load();
  }, []);

  return { projects, ready };
}
