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

        // Normalize type values saved by the org form to lib/data.ts OpportunityType
        const TYPE_NORM: Record<string, Opportunity["type"]> = {
          volunteer:  "volunteering",
          training:   "conference",
          custom:     "grant",
        };

        const mapped: Opportunity[] = data.map((row) => {
          const org = row.orgs as { id: string; name: string; slug?: string };
          const rawType = (row.type as string) ?? "exchange";
          return {
            slug:             row.id as string,
            type:             TYPE_NORM[rawType] ?? (rawType as Opportunity["type"]),
            typeName:         (row.type_name as string) ?? "",
            org:              org?.name ?? "",
            orgSlug:          org?.slug || org?.id,
            title:            (row.title as string) ?? "",
            shortDescription: (row.short_description as string) ?? "",
            // Detail-only fields this endpoint doesn't select (see route.ts) —
            // no catalog/list consumer reads them, kept only because
            // Opportunity requires the properties to exist.
            fullDescription:  "",
            requirements:     [],
            benefits:         [],
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
            tags:             (row.tags as string[]) ?? [],
            applyUrl:         `/opportunities/${row.id}/apply`,
            duration:         (row.duration as string) ?? "",
            photo:            (row.photo_url as string) || undefined,
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
