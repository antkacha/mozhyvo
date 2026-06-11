import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { orgsBySlug, orgNameToSlug } from "@/lib/organizations";
import { opportunities } from "@/lib/data";
import OpportunityCard from "@/components/OpportunityCard";

export const dynamic = "force-dynamic";

// ── Social icons ──────────────────────────────────────────────────────────────
const socialIcons: Record<string, { label: string; icon: React.ReactNode; bg: string }> = {
  telegram: {
    label: "Telegram",
    bg: "hover:bg-[#2AABEE] hover:text-white hover:border-[#2AABEE]",
    icon: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>,
  },
  instagram: {
    label: "Instagram",
    bg: "hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 hover:text-white hover:border-transparent",
    icon: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" /></svg>,
  },
  facebook: {
    label: "Facebook",
    bg: "hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]",
    icon: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>,
  },
  linkedin: {
    label: "LinkedIn",
    bg: "hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2]",
    icon: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>,
  },
  twitter: {
    label: "Twitter / X",
    bg: "hover:bg-black hover:text-white hover:border-black",
    icon: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>,
  },
  youtube: {
    label: "YouTube",
    bg: "hover:bg-[#FF0000] hover:text-white hover:border-[#FF0000]",
    icon: <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>,
  },
};

function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
      <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
      Верифіковано Моживо
    </span>
  );
}

// ── Metadata ──────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  // Static org
  const staticOrg = orgsBySlug[params.slug];
  if (staticOrg) {
    return {
      title: staticOrg.name,
      description: staticOrg.description.slice(0, 160),
      alternates: { canonical: `https://mozhyvo.ua/organizations/${staticOrg.slug}` },
    };
  }
  // Supabase org
  const supabase = createClient();
  const { data } = await supabase
    .from("orgs")
    .select("name, description")
    .eq("slug", params.slug)
    .maybeSingle();
  if (!data) return {};
  return {
    title: data.name,
    description: (data.description ?? "").slice(0, 160),
    alternates: { canonical: `https://mozhyvo.ua/organizations/${params.slug}` },
  };
}

// ── Static org page (existing design) ────────────────────────────────────────
function StaticOrgPage({ slug }: { slug: string }) {
  const org = orgsBySlug[slug]!;
  const orgOpps = opportunities.filter((o) => orgNameToSlug[o.org] === org.slug);
  const activeSocials = Object.entries(org.socials).filter(([, url]) => !!url) as [string, string][];

  return (
    <div className="page-transition">
      <div className="h-44 sm:h-52 w-full"
        style={{ background: `linear-gradient(135deg, ${org.coverFrom} 0%, ${org.coverTo} 100%)` }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="-mt-12 mb-8 flex items-end gap-5">
          <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-white text-xl sm:text-2xl font-black flex-shrink-0 border-4 border-white shadow-xl ${org.logoColor}`}>
            {org.logoInitials}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-black text-foreground leading-tight">{org.name}</h1>
              {org.verified && <VerifiedBadge />}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted-bg text-muted text-xs font-medium">{org.typeName}</span>
              <span>{org.flag} {org.country}</span>
              {org.founded && <span>Засновано {org.founded}</span>}
            </div>
          </div>
          {org.website && (
            <a href={org.website} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:border-primary hover:text-primary transition-all self-start flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              Офіційний сайт
            </a>
          )}
        </div>
        <div className="flex flex-wrap gap-6 pb-8 mb-8 border-b border-border">
          <div><p className="text-2xl font-black text-primary leading-none">{org.stats.opportunities}</p><p className="text-xs text-muted mt-1">можливостей</p></div>
          <div className="w-px bg-border" />
          <div><p className="text-2xl font-black text-primary leading-none">{org.stats.countries}</p><p className="text-xs text-muted mt-1">країн</p></div>
          {org.stats.participants && (<><div className="w-px bg-border" /><div><p className="text-2xl font-black text-primary leading-none">{org.stats.participants}</p><p className="text-xs text-muted mt-1">учасників</p></div></>)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
          <div className="lg:col-span-2 space-y-8">
            <section><h2 className="text-lg font-bold text-foreground mb-3">Про організацію</h2><p className="text-muted leading-relaxed text-sm">{org.description}</p></section>
            {org.mission && (<section><h2 className="text-lg font-bold text-foreground mb-3">Місія</h2><blockquote className="border-l-4 border-primary pl-4 text-foreground font-medium leading-relaxed italic">&ldquo;{org.mission}&rdquo;</blockquote></section>)}
            <section><h2 className="text-lg font-bold text-foreground mb-3">Напрями діяльності</h2><div className="flex flex-wrap gap-2">{org.focusAreas.map((a) => (<span key={a} className="px-3 py-1.5 rounded-full bg-primary-light text-primary text-sm font-medium">{a}</span>))}</div></section>
          </div>
          <div className="lg:col-span-1"><div className="sticky top-24 space-y-4">
            <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
              <h3 className="font-bold text-foreground text-sm">Контакти</h3>
              {org.email && (<a href={`mailto:${org.email}`} className="flex items-center gap-3 text-sm text-muted hover:text-primary transition-colors group"><div className="w-9 h-9 rounded-xl bg-muted-bg flex items-center justify-center flex-shrink-0 group-hover:bg-primary-light"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg></div><span className="truncate">{org.email}</span></a>)}
              {org.website && (<a href={org.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-muted hover:text-primary transition-colors group"><div className="w-9 h-9 rounded-xl bg-muted-bg flex items-center justify-center flex-shrink-0 group-hover:bg-primary-light"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg></div><span className="truncate">{org.website.replace(/^https?:\/\//, "")}</span></a>)}
            </div>
            {activeSocials.length > 0 && (<div className="bg-white rounded-2xl border border-border p-5"><h3 className="font-bold text-foreground text-sm mb-3">Соціальні мережі</h3><div className="flex flex-wrap gap-2">{activeSocials.map(([platform, url]) => { const s = socialIcons[platform]; if (!s) return null; return (<a key={platform} href={url} target="_blank" rel="noreferrer" aria-label={s.label} className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm font-medium text-muted transition-all ${s.bg}`}>{s.icon}{s.label}</a>); })}</div></div>)}
          </div></div>
        </div>
        {orgOpps.length > 0 && (<section className="pb-16"><h2 className="text-2xl font-black text-foreground mb-6">Активні програми</h2><div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">{orgOpps.map((opp, i) => (<OpportunityCard key={opp.slug} opp={opp} index={i} />))}</div></section>)}
      </div>
      <div className="border-t border-border"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"><Link href="/opportunities" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors font-medium"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>Всі можливості</Link></div></div>
    </div>
  );
}

// ── Supabase org page ─────────────────────────────────────────────────────────
type SupabaseOrg = {
  id: string; slug: string | null; name: string; type: string; country: string; city: string;
  website: string | null; contact_email: string | null; description: string | null;
  mission: string | null; logo_url: string | null; cover_image_url: string | null;
  cover_video_url: string | null; brand_color: string; focus_areas: string[];
  socials: Record<string, string>; status: string; founded: string | null;
};

type SupabaseProject = {
  id: string; title: string; type: string; country: string; flag: string;
  deadline: string | null; funding: string | null; status: string;
  short_description: string | null;
};

function DynamicOrgPage({ org, projects }: { org: SupabaseOrg; projects: SupabaseProject[] }) {
  const verified = org.status === "verified";
  const activeSocials = Object.entries(org.socials ?? {}).filter(([, v]) => !!v) as [string, string][];
  const activeProjects = projects.filter((p) => p.status === "published");

  const coverStyle = org.cover_image_url
    ? { backgroundImage: `url(${org.cover_image_url})`, backgroundSize: "cover", backgroundPosition: "center" }
    : { background: `linear-gradient(135deg, ${org.brand_color} 0%, ${org.brand_color}cc 100%)` };

  const initials = org.name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  return (
    <div className="page-transition">
      {/* Cover */}
      <div className="h-44 sm:h-52 w-full relative overflow-hidden" style={coverStyle}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Logo row */}
        <div className="-mt-12 mb-8 flex items-end gap-5 relative z-10">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex-shrink-0 border-4 border-white shadow-xl overflow-hidden bg-white"
            style={{ background: org.logo_url ? undefined : org.brand_color }}>
            {org.logo_url ? (
              <Image src={org.logo_url} alt={org.name} width={96} height={96} className="w-full h-full object-cover" />
            ) : (
              <span className="w-full h-full flex items-center justify-center text-white text-2xl font-black">{initials}</span>
            )}
          </div>
        </div>

        {/* Name + meta */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-black text-foreground leading-tight">{org.name}</h1>
              {verified && <VerifiedBadge />}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
              {org.type && <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-muted-bg text-muted text-xs font-medium">{org.type}</span>}
              {org.country && <span>🌍 {org.country}{org.city ? `, ${org.city}` : ""}</span>}
              {org.founded && <span>Засновано {org.founded}</span>}
            </div>
          </div>
          {org.website && (
            <a href={org.website} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:border-primary hover:text-primary transition-all self-start flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              Офіційний сайт
            </a>
          )}
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-6 pb-8 mb-8 border-b border-border">
          <div><p className="text-2xl font-black text-primary leading-none">{activeProjects.length}</p><p className="text-xs text-muted mt-1">можливостей</p></div>
          {verified && (<><div className="w-px bg-border" /><div><p className="text-2xl font-black text-blue-600 leading-none">✓</p><p className="text-xs text-muted mt-1">верифіковано</p></div></>)}
        </div>

        {/* Content + sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
          <div className="lg:col-span-2 space-y-8">
            {org.description && (
              <section>
                <h2 className="text-lg font-bold text-foreground mb-3">Про організацію</h2>
                <p className="text-muted leading-relaxed text-sm whitespace-pre-line">{org.description}</p>
              </section>
            )}
            {org.mission && (
              <section>
                <h2 className="text-lg font-bold text-foreground mb-3">Місія</h2>
                <blockquote className="border-l-4 border-primary pl-4 text-foreground font-medium leading-relaxed italic">
                  &ldquo;{org.mission}&rdquo;
                </blockquote>
              </section>
            )}
            {(org.focus_areas ?? []).length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-foreground mb-3">Напрями діяльності</h2>
                <div className="flex flex-wrap gap-2">
                  {org.focus_areas.map((a) => (
                    <span key={a} className="px-3 py-1.5 rounded-full bg-primary-light text-primary text-sm font-medium">{a}</span>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
                <h3 className="font-bold text-foreground text-sm">Контакти</h3>
                {org.contact_email && (
                  <a href={`mailto:${org.contact_email}`} className="flex items-center gap-3 text-sm text-muted hover:text-primary transition-colors group">
                    <div className="w-9 h-9 rounded-xl bg-muted-bg flex items-center justify-center flex-shrink-0 group-hover:bg-primary-light">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                    </div>
                    <span className="truncate">{org.contact_email}</span>
                  </a>
                )}
                {org.website && (
                  <a href={org.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-sm text-muted hover:text-primary transition-colors group">
                    <div className="w-9 h-9 rounded-xl bg-muted-bg flex items-center justify-center flex-shrink-0 group-hover:bg-primary-light">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>
                    </div>
                    <span className="truncate">{org.website.replace(/^https?:\/\//, "")}</span>
                  </a>
                )}
              </div>

              {activeSocials.length > 0 && (
                <div className="bg-white rounded-2xl border border-border p-5">
                  <h3 className="font-bold text-foreground text-sm mb-3">Соціальні мережі</h3>
                  <div className="flex flex-wrap gap-2">
                    {activeSocials.map(([platform, url]) => {
                      const s = socialIcons[platform];
                      if (!s) return null;
                      return (
                        <a key={platform} href={url} target="_blank" rel="noreferrer" aria-label={s.label}
                          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm font-medium text-muted transition-all ${s.bg}`}>
                          {s.icon}{s.label}
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {verified && (
                <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-800">Верифіковано командою Моживо</p>
                      <p className="text-xs text-blue-600 mt-0.5 leading-relaxed">Організація пройшла перевірку автентичності та відповідності стандартам платформи.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Projects */}
        {activeProjects.length > 0 ? (
          <section className="pb-16">
            <h2 className="text-2xl font-black text-foreground mb-6">
              Активні програми
              <span className="ml-2 text-base font-normal text-muted">({activeProjects.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {activeProjects.map((p) => (
                <Link key={p.id} href={`/opportunities/${p.id}`}
                  className="bg-white rounded-2xl border border-border p-5 hover:shadow-md hover:border-primary/30 transition-all group">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-light text-primary">{p.type}</span>
                    {p.deadline && <span className="text-xs text-muted">{p.deadline}</span>}
                  </div>
                  <h3 className="font-bold text-foreground text-sm leading-snug mb-2 group-hover:text-primary transition-colors">{p.title}</h3>
                  {p.short_description && <p className="text-xs text-muted leading-relaxed line-clamp-2">{p.short_description}</p>}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                    <span className="text-xs text-muted">{p.flag} {p.country}</span>
                    {p.funding && <><span className="text-border">·</span><span className="text-xs text-muted">{p.funding}</span></>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <section className="pb-16">
            <div className="bg-muted-bg rounded-2xl p-10 text-center">
              <p className="text-3xl mb-3">📭</p>
              <p className="font-semibold text-foreground">Наразі немає активних програм</p>
              <p className="text-sm text-muted mt-1">Слідкуй за оновленнями — нові можливості з&apos;являться незабаром</p>
            </div>
          </section>
        )}
      </div>

      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/opportunities" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Всі можливості
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Route handler ─────────────────────────────────────────────────────────────
export default async function OrgProfilePage({ params }: { params: { slug: string } }) {
  const { slug } = params;

  // 1. Try static org
  if (orgsBySlug[slug]) return <StaticOrgPage slug={slug} />;

  // 2. Try Supabase org by slug
  const supabase = createClient();
  let { data: org } = await supabase
    .from("orgs")
    .select("*")
    .eq("slug", slug)
    .eq("status", "verified")
    .maybeSingle();

  // 3. Fallback: try by UUID id (only if slug looks like a UUID)
  if (!org && /^[0-9a-f-]{36}$/i.test(slug)) {
    const { data } = await supabase
      .from("orgs")
      .select("*")
      .eq("id", slug)
      .eq("status", "verified")
      .maybeSingle();
    org = data;
  }

  if (!org) notFound();

  // 3. Fetch org's published projects
  const { data: projects } = await supabase
    .from("org_projects")
    .select("id, title, type, country, flag, deadline, funding, status, short_description")
    .eq("org_id", org.id)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  return <DynamicOrgPage org={org as SupabaseOrg} projects={(projects ?? []) as SupabaseProject[]} />;
}
