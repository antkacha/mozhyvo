import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { opportunities, typeColors } from "@/lib/data";
import { orgNameToSlug } from "@/lib/organizations";
import OpportunityClient from "@/components/OpportunityClient";
import OpportunityCoverImage from "@/components/OpportunityCoverImage";
import OpportunityApplyCard from "@/components/OpportunityApplyCard";
import BackToOpportunities from "@/components/BackToOpportunities";
import { getPublicOpportunity } from "@/lib/opportunity-detail";
import ViewTracker from "./ViewTracker";

export function generateStaticParams() {
  return opportunities.map((o) => ({ slug: o.slug }));
}

export const dynamicParams = true;

const BASE = "https://www.mozhyvo.com.ua";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const opp = opportunities.find((o) => o.slug === params.slug) ?? await getPublicOpportunity(params.slug);
  if (!opp) return {};
  const url = `${BASE}/opportunities/${opp.slug}`;
  return {
    title:       opp.title,
    description: opp.shortDescription,
    keywords:    [opp.typeName, opp.org, opp.country, opp.location, ...opp.tags],
    alternates:  { canonical: url },
    openGraph: {
      type:        "article",
      url,
      title:       opp.title,
      description: opp.shortDescription,
      siteName:    "МОЖUВО",
      locale:      "uk_UA",
      images: [
        {
          url:    `${BASE}/opportunities/${opp.slug}/opengraph-image`,
          width:  1200,
          height: 630,
          alt:    opp.title,
        },
      ],
    },
    twitter: {
      card:        "summary_large_image",
      title:       opp.title,
      description: opp.shortDescription,
      images:      [`${BASE}/opportunities/${opp.slug}/opengraph-image`],
    },
  };
}

// JSON-LD is embedded raw in a <script>, and JSON.stringify doesn't escape
// "</script>" — org-written fields (title, description, tags…) could close
// the tag and inject script. Escaping these as JSON \u sequences keeps the
// JSON valid and identical in value, but inert as HTML.
function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export default async function OpportunityDetailPage({ params }: { params: { slug: string } }) {
  const opp = opportunities.find((o) => o.slug === params.slug) ?? await getPublicOpportunity(params.slug);
  if (!opp) notFound();

  const related = opportunities
    .filter((o) => o.slug !== opp.slug && (o.type === opp.type || o.country === opp.country))
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: opp.title,
    description: opp.shortDescription,
    organizer: { "@type": "Organization", name: opp.org },
    location: { "@type": "Place", name: opp.location, address: { "@type": "PostalAddress", addressCountry: opp.country } },
    eventStatus: "https://schema.org/EventScheduled",
    endDate: opp.deadline,
    url: `${BASE}/opportunities/${opp.slug}`,
    image: `${BASE}/opportunities/${opp.slug}/opengraph-image`,
    offers: {
      "@type": "Offer",
      price: opp.funding === "fully-funded" ? "0" : undefined,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${BASE}/opportunities/${opp.slug}`,
    },
    keywords: opp.tags.join(", "),
  };

  return (
    <>
      {opp.projectId && <ViewTracker projectId={opp.projectId} />}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      {/* Hero */}
      <section className="bg-primary-light border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <BackToOpportunities />

          {/* Photo (left, compact) + apply card (right) — same height as the
              card on desktop via grid stretch (default items-stretch), a
              fixed 4:3 box on mobile where there's no sibling to match. */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 mb-8">
            <div className="lg:col-span-3 rounded-2xl overflow-hidden shadow-lg aspect-[4/3] lg:aspect-auto lg:min-h-[380px] lg:max-h-[480px]">
              <OpportunityCoverImage
                photo={opp.photo}
                title={opp.title}
                type={opp.type}
                className="h-full"
                sizes="(max-width: 1023px) 100vw, (max-width: 1279px) 60vw, 720px"
                priority
              />
            </div>
            <div className="lg:col-span-2">
              <OpportunityApplyCard opp={opp} />
            </div>
          </div>

          <div className="min-w-0">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${typeColors[opp.type]}`}>
                  {opp.typeName}
                </span>
                {opp.funding === "fully-funded" && (
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-green-100 text-green-700">✓ Повне фінансування</span>
                )}
                {opp.funding === "partially-funded" && (
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-700">Часткове фінансування</span>
                )}
                {(opp.orgVerified ?? !opp.projectId) ? (
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 inline-flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    Верифікована організація
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 inline-flex items-center gap-1">
                    На верифікації
                  </span>
                )}
              </div>

              {(opp.orgSlug ?? orgNameToSlug[opp.org]) ? (
                <Link
                  href={`/organizations/${opp.orgSlug ?? orgNameToSlug[opp.org]}`}
                  className="text-sm font-semibold text-primary/60 uppercase tracking-widest mb-3 hover:text-primary transition-colors inline-block"
                >
                  {opp.org}
                </Link>
              ) : (
                <p className="text-sm font-semibold text-primary/60 uppercase tracking-widest mb-3">{opp.org}</p>
              )}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground leading-[1.05]">{opp.title}</h1>
          </div>
        </div>
      </section>

      {/* Client: tabs + sidebar + wizard */}
      <OpportunityClient opp={opp} related={related} />
    </>
  );
}
