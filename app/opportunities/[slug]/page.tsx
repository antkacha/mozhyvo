import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { opportunities, typeColors, formatLabels } from "@/lib/data";
import { orgNameToSlug } from "@/lib/organizations";
import OpportunityClient from "@/components/OpportunityClient";

export function generateStaticParams() {
  return opportunities.map((o) => ({ slug: o.slug }));
}

const BASE = "https://mozhyvo.ua";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const opp = opportunities.find((o) => o.slug === params.slug);
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
      siteName:    "Моживо",
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

export default function OpportunityDetailPage({ params }: { params: { slug: string } }) {
  const opp = opportunities.find((o) => o.slug === params.slug);
  if (!opp) notFound();

  const days = (new Date(opp.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  const expiring = days <= 14 && days > 0;

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero */}
      <section className="bg-primary-light border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link href="/opportunities"
            className="inline-flex items-center gap-1.5 text-sm text-primary/70 hover:text-primary transition-colors mb-7 font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Назад до можливостей
          </Link>

          <div className="flex items-start gap-10">
            <div className="flex-1 min-w-0">
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
                {/* Verified org badge (static placeholder) */}
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 inline-flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                  Верифікована організація
                </span>
              </div>

              {orgNameToSlug[opp.org] ? (
                <Link
                  href={`/organizations/${orgNameToSlug[opp.org]}`}
                  className="text-sm font-semibold text-primary/60 uppercase tracking-widest mb-3 hover:text-primary transition-colors inline-block"
                >
                  {opp.org}
                </Link>
              ) : (
                <p className="text-sm font-semibold text-primary/60 uppercase tracking-widest mb-3">{opp.org}</p>
              )}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-foreground leading-[1.05] mb-6">{opp.title}</h1>

              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 bg-white px-4 py-2 rounded-full border border-primary/15 shadow-sm">
                  {opp.flag} {opp.location}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 bg-white px-4 py-2 rounded-full border border-primary/15 shadow-sm">
                  {formatLabels[opp.format]}
                </span>
                {opp.duration && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 bg-white px-4 py-2 rounded-full border border-primary/15 shadow-sm">
                    ⏱ {opp.duration}
                  </span>
                )}
                <span className={`inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full border shadow-sm ${
                  expiring ? "bg-red-50 text-red-600 border-red-200" : "bg-white text-gray-600 border-primary/15"
                }`}>
                  {expiring ? "⏰" : "📅"} Дедлайн: {opp.deadlineDisplay}
                </span>
              </div>
            </div>

            {opp.photo && (
              <div className="hidden lg:block flex-shrink-0 w-56 h-72 rounded-2xl overflow-hidden shadow-lg">
                <Image src={opp.photo} alt={opp.title} width={224} height={288} className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {opp.photo && (
            <div className="lg:hidden mt-6 h-52 rounded-2xl overflow-hidden shadow-md">
              <Image src={opp.photo} alt={opp.title} width={600} height={208} className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      </section>

      {/* Client: tabs + sidebar + wizard */}
      <OpportunityClient opp={opp} related={related} />
    </>
  );
}
