"use client";

import { useState, useEffect } from "react";
import { normalizeType, type Opportunity } from "@/lib/data";

// Components that mount together (home: FeaturedSection + HomeRecommendations)
// share one in-flight request instead of each fetching the same URL. Only
// in-flight requests are shared — every later mount still fetches fresh, as
// before.
const inflight = new Map<string, Promise<Opportunity[] | null>>();

function fetchPublicProjects(url: string): Promise<Opportunity[] | null> {
  let p = inflight.get(url);
  if (!p) {
    p = loadPublicProjects(url).finally(() => inflight.delete(url));
    inflight.set(url, p);
  }
  return p;
}

async function loadPublicProjects(url: string): Promise<Opportunity[] | null> {
  const res = await fetch(url);
  if (!res.ok) return null;
  const { projects: data } = await res.json() as { projects: Record<string, unknown>[] };
  if (!data) return null;

  const mapped: Opportunity[] = data.map((row) => {
    const org = row.orgs as { id: string; name: string; slug?: string };
    return {
      slug:             row.id as string,
      type:             normalizeType(row.type as string, row.type_name as string),
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

  return mapped;
}

export function usePublicOrgProjects(options?: { includeExpired?: boolean }) {
  const includeExpired = options?.includeExpired ?? false;
  const [projects, setProjects] = useState<Opportunity[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const mapped = await fetchPublicProjects(includeExpired ? "/api/public/opportunities?includeExpired=1" : "/api/public/opportunities");
        if (mapped) setProjects(mapped);
      } finally {
        setReady(true);
      }
    }
    load();
  }, [includeExpired]);

  return { projects, ready };
}
