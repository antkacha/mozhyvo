import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createAdminClient } from "@/lib/supabase/admin";
import { orgsBySlug } from "@/lib/organizations";
import { isDeadlinePassed } from "@/lib/deadline";
import ArchiveGrid, { ArchiveGridView, type ArchiveProject as Project } from "./ArchiveGrid";

// ISR like the org page (revalidateOrg() also refreshes this path). The
// ?type= filter is applied client-side in ArchiveGrid, so the HTML is the same
// for every visitor and every query string.
export const revalidate = 300;

// No pages are built ahead of time (the build never touches the DB): each
// org page is rendered on its first request and then cached — on-demand ISR.
// Without generateStaticParams Next 14 treats a [slug] route as fully dynamic
// and never caches its HTML, even with `revalidate` set.
export function generateStaticParams() {
  return [];
}

export default async function OrgArchivePage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  // Static orgs have no DB archive
  if (orgsBySlug[slug]) notFound();

  const admin = createAdminClient();
  const { data: org, error: orgError } = await admin
    .from("orgs")
    .select("id, name, slug, logo_url, brand_color, status")
    .eq("slug", slug)
    .eq("status", "verified")
    .maybeSingle();

  // DB/network failure → throw (never cached), not a cached 404. notFound()
  // only when the query succeeded and no verified org matched.
  if (orgError) throw new Error(`orgs ${slug}: ${orgError.message}`);
  if (!org) notFound();

  const { data: allProjects, error: projectsError } = await admin
    .from("org_projects")
    .select("id, title, type, type_name, country, flag, deadline, deadline_display, funding, short_description, photo_url")
    .eq("org_id", org.id)
    .eq("status", "published")
    .order("deadline", { ascending: false });
  if (projectsError) throw new Error(`org_projects org ${org.id}: ${projectsError.message}`);

  const archived = ((allProjects ?? []) as Project[]).filter(
    (p) => isDeadlinePassed(p.deadline ?? ""),
  );

  const orgName = org.name as string;
  const brandColor = (org.brand_color as string) ?? "#3B4FE8";
  const orgInitials = orgName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="page-transition min-h-screen bg-background">
      {/* Top nav bar */}
      <div className="bg-white border-b border-border sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href={`/organizations/${slug}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {orgName}
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Page header */}
        <div className="flex items-center gap-4 mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center text-white font-black overflow-hidden border border-border shadow-sm"
            style={{ background: org.logo_url ? undefined : brandColor }}
          >
            {org.logo_url ? (
              <Image
                src={org.logo_url as string}
                alt={orgName}
                width={56}
                height={56}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-lg">{orgInitials}</span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">Архів програм</h1>
            <p className="text-sm text-muted mt-0.5">
              {orgName} · {archived.length} завершених{" "}
              {archived.length === 1 ? "програма" : archived.length < 5 ? "програми" : "програм"}
            </p>
          </div>
        </div>

        <Suspense fallback={<ArchiveGridView slug={slug} archived={archived} typeFilter="" />}>
          <ArchiveGrid slug={slug} archived={archived} />
        </Suspense>
      </div>
    </div>
  );
}
