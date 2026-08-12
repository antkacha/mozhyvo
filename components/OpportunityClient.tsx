"use client";

import Link from "next/link";
import type { Opportunity } from "@/lib/data";
import { typeColors, fundingLabels, formatLabels } from "@/lib/data";
import { orgNameToSlug } from "@/lib/organizations";

interface Props {
  opp: Opportunity;
  related: Opportunity[];
}

export default function OpportunityClient({ opp, related }: Props) {
  const orgSlug = opp.orgSlug ?? orgNameToSlug[opp.org];

  const borderColor: Record<string, string> = {
    scholarship: "border-l-primary", internship: "border-l-blue-500",
    exchange: "border-l-green-500", volunteering: "border-l-teal-500",
    competition: "border-l-orange-500", grant: "border-l-yellow-400",
    conference: "border-l-pink-500", hackathon: "border-l-red-500",
  };

  return (
    <>
      {/* Tabs + content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Left: single scrollable content stream */}
          <div className="lg:col-span-2 flex flex-col gap-12">

            {/* Про проект */}
            <div className="flex flex-col gap-10">
              {/* Tags */}
              {opp.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {opp.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-muted-bg text-muted px-2.5 py-1 rounded-full">#{tag}</span>
                  ))}
                </div>
              )}
              {/* Description */}
              <section>
                <h2 className="text-xl font-bold text-foreground mb-4">Про програму</h2>
                <div className={`border-l-4 pl-5 ${borderColor[opp.type] ?? "border-l-primary"}`}>
                  <div className="text-base text-gray-600 leading-relaxed whitespace-pre-line break-words">
                    {opp.fullDescription}
                  </div>
                </div>
              </section>
              {/* Benefits */}
              {opp.benefits.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold text-foreground mb-4">Що включає</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {opp.benefits.map((b, i) => (
                      <div key={i} className="flex items-start gap-3 bg-primary-light rounded-xl p-4">
                        <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-black mt-0.5">✓</span>
                        <span className="text-sm text-gray-700 leading-relaxed">{b}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Вимоги до кандидатів */}
            <div className="flex flex-col gap-8 pt-12 border-t border-border">
              <section>
                <h2 className="text-xl font-bold text-foreground mb-5">Вимоги до учасників</h2>
                <ul className="flex flex-col gap-3">
                  {opp.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <span className="mt-0.5 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-black shadow-sm shadow-primary/25">{i + 1}</span>
                      <span className="text-gray-600 leading-relaxed pt-0.5">{req}</span>
                    </li>
                  ))}
                </ul>
              </section>
              {/* Languages */}
              {opp.languages.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold text-foreground mb-4">Мова програми</h2>
                  <div className="flex flex-wrap gap-2">
                    {opp.languages.map((lang) => (
                      <span key={lang} className="px-4 py-2 bg-primary-light text-primary text-sm font-semibold rounded-full">{lang}</span>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* Right: sticky sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 flex flex-col gap-4">

              {/* Details card */}
              <div className="bg-white border border-border rounded-2xl p-5 shadow-sm">
                <p className="text-sm font-bold text-foreground mb-4">Деталі програми</p>
                <div className="flex flex-col gap-0">
                  {/* Org row — clickable if slug exists */}
                  {opp.org && (
                    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-gray-100">
                      <span className="text-xs text-muted flex-shrink-0">Організатор</span>
                      {orgSlug ? (
                        <Link
                          href={`/organizations/${orgSlug}`}
                          className="text-xs font-semibold text-primary hover:underline text-right"
                        >
                          {opp.org}
                        </Link>
                      ) : (
                        <span className="text-xs font-semibold text-gray-800 text-right">{opp.org}</span>
                      )}
                    </div>
                  )}
                  {([
                    { label: "Тип",         value: opp.typeName },
                    { label: "Формат",      value: formatLabels[opp.format] },
                    { label: "Місце",       value: `${opp.flag} ${opp.location}` },
                    { label: "Фінансування",value: fundingLabels[opp.funding] },
                    opp.duration ? { label: "Тривалість", value: opp.duration } : null,
                    opp.languages.length > 0 ? { label: "Мова", value: opp.languages.join(", ") } : null,
                    (opp.ageMin || opp.ageMax) ? { label: "Вік", value: opp.ageMin && opp.ageMax ? `${opp.ageMin}–${opp.ageMax} р.` : opp.ageMax ? `до ${opp.ageMax} р.` : `від ${opp.ageMin} р.` } : null,
                  ] as ({ label: string; value: string } | null)[])
                    .filter(Boolean)
                    .map((row) => (
                      <div key={row!.label} className="flex items-start justify-between gap-3 py-2.5 border-b border-gray-100 last:border-0">
                        <span className="text-xs text-muted flex-shrink-0">{row!.label}</span>
                        <span className="text-xs font-semibold text-gray-800 text-right">{row!.value}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* Related opportunities */}
        {related.length > 0 && (
          <div className="mt-16 pt-10 border-t border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-foreground">Схожі можливості</h2>
              <Link href="/opportunities" className="text-sm font-semibold text-primary hover:underline">Всі можливості →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {related.map((r) => (
                <Link key={r.slug} href={`/opportunities/${r.slug}`}
                  className="group bg-white rounded-2xl border border-border border-t-4 border-t-primary p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeColors[r.type]}`}>{r.typeName}</span>
                    {r.funding === "fully-funded" && (
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-50 text-green-700">Повне</span>
                    )}
                  </div>
                  <div>
                    {(() => { const s = orgNameToSlug[r.org]; return s ? (
                      <Link href={`/organizations/${s}`} onClick={(e) => e.stopPropagation()}
                        className="text-xs font-semibold text-muted mb-1 uppercase tracking-wide hover:text-primary transition-colors block">
                        {r.org}
                      </Link>
                    ) : (
                      <p className="text-xs font-semibold text-muted mb-1 uppercase tracking-wide">{r.org}</p>
                    ); })()}
                    <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">{r.title}</p>
                  </div>
                  <p className="text-xs text-muted mt-auto">{r.flag} {r.location} · {r.deadlineDisplay}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

    </>
  );
}
