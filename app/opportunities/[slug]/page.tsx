import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import {
  opportunities,
  typeColors,
  fundingLabels,
  formatLabels,
} from "@/lib/data";
import SaveButton from "@/components/SaveButton";
import ApplyButton from "@/components/ApplyButton";

export function generateStaticParams() {
  return opportunities.map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const opp = opportunities.find((o) => o.slug === params.slug);
  if (!opp) return {};
  return {
    title: `${opp.title} — Моживо`,
    description: opp.shortDescription,
  };
}

const typeBorderColors: Record<string, string> = {
  scholarship: "border-l-primary",
  internship: "border-l-blue-500",
  exchange: "border-l-green-500",
  volunteering: "border-l-teal-500",
  competition: "border-l-orange-500",
  grant: "border-l-yellow-400",
  conference: "border-l-pink-500",
  hackathon: "border-l-red-500",
};

export default function OpportunityDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const opp = opportunities.find((o) => o.slug === params.slug);
  if (!opp) notFound();

  const expiring =
    (new Date(opp.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24) <=
      14 &&
    (new Date(opp.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24) >
      0;

  const related = opportunities
    .filter(
      (o) =>
        o.slug !== opp.slug &&
        (o.type === opp.type || o.country === opp.country)
    )
    .slice(0, 3);

  const ageLabel =
    opp.ageMin && opp.ageMax
      ? `${opp.ageMin}–${opp.ageMax} років`
      : opp.ageMax
      ? `до ${opp.ageMax} років`
      : opp.ageMin
      ? `від ${opp.ageMin} років`
      : null;

  return (
    <>
      {/* ── Hero header ─────────────────────────────────────────── */}
      <section className="bg-primary-light border-b border-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Breadcrumb */}
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-1.5 text-sm text-primary/70 hover:text-primary transition-colors duration-200 mb-7 font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Назад до можливостей
          </Link>

          {/* Split: text left + photo right */}
          <div className="flex items-start gap-10">
            <div className="flex-1 min-w-0">

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${typeColors[opp.type]}`}>
                  {opp.typeName}
                </span>
                {opp.funding === "fully-funded" && (
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-green-100 text-green-700">
                    ✓ Повне фінансування
                  </span>
                )}
                {opp.funding === "partially-funded" && (
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-yellow-100 text-yellow-700">
                    Часткове фінансування
                  </span>
                )}
              </div>

              {/* Org */}
              <p className="text-sm font-semibold text-primary/60 uppercase tracking-widest mb-3">
                {opp.org}
              </p>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 leading-[1.05] mb-6">
                {opp.title}
              </h1>

              {/* Info chips */}
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
                <span
                    className={`inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full border shadow-sm ${
                      expiring
                        ? "bg-red-50 text-red-600 border-red-200"
                        : "bg-white text-gray-600 border-primary/15"
                    }`}
                  >
                    {expiring ? "⏰" : "📅"} Дедлайн: {opp.deadlineDisplay}
                  </span>
                </div>
            </div>

            {/* Photo — desktop only, inside hero */}
            {opp.photo && (
              <div className="hidden lg:block flex-shrink-0 w-56 h-72 rounded-2xl overflow-hidden shadow-lg">
                <Image
                  src={opp.photo}
                  alt={opp.title}
                  width={224}
                  height={288}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Photo — mobile only, below chips */}
          {opp.photo && (
            <div className="lg:hidden mt-6 h-52 rounded-2xl overflow-hidden shadow-md">
              <Image
                src={opp.photo}
                alt={opp.title}
                width={600}
                height={208}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </section>

      {/* ── Main content ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Article */}
          <article className="lg:col-span-2 flex flex-col gap-10">

            {/* Tags */}
            {opp.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {opp.tags.map((tag) => (
                  <span key={tag} className="text-xs bg-muted-bg text-muted px-2.5 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Про програму</h2>
              <div
                className={`border-l-4 pl-5 ${typeBorderColors[opp.type] ?? "border-l-primary"}`}
              >
                <div className="text-base text-gray-600 leading-relaxed whitespace-pre-line space-y-4">
                  {opp.fullDescription}
                </div>
              </div>
            </section>

            {/* Requirements */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-5">Вимоги</h2>
              <ul className="flex flex-col gap-3">
                {opp.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <span className="mt-0.5 w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-black shadow-sm shadow-primary/25">
                      {i + 1}
                    </span>
                    <span className="text-gray-600 leading-relaxed pt-0.5">{req}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Benefits */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-5">Що включає</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {opp.benefits.map((benefit, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 bg-primary-light rounded-xl p-4"
                  >
                    <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-black mt-0.5">
                      ✓
                    </span>
                    <span className="text-sm text-gray-700 leading-relaxed">{benefit}</span>
                  </div>
                ))}
              </div>
            </section>
          </article>

          {/* ── Sidebar ── */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 flex flex-col gap-4">

              {/* Apply card */}
              <div className="rounded-2xl overflow-hidden border border-border shadow-sm">
                {/* Deadline header */}
                <div className={`px-6 py-5 ${expiring ? "bg-red-600" : "bg-primary"}`}>
                  <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">
                    Дедлайн подачі
                  </p>
                  <p className="text-white text-2xl font-black leading-tight">
                    {opp.deadlineDisplay}
                  </p>
                  {expiring && (
                    <p className="text-white/80 text-xs mt-1.5 font-medium">
                      ⏰ Скоро завершується!
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="bg-white px-6 py-5 flex flex-col gap-3">
                  <ApplyButton slug={opp.slug} />
                  <SaveButton slug={opp.slug} />
                </div>
              </div>

              {/* Info card */}
              <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
                <p className="text-sm font-bold text-gray-900 mb-4">Деталі програми</p>
                <div className="flex flex-col gap-3">
                  {[
                    { label: "Формат", value: formatLabels[opp.format] },
                    { label: "Місце", value: `${opp.flag} ${opp.location}` },
                    { label: "Фінансування", value: fundingLabels[opp.funding] },
                    opp.fundingDetails
                      ? { label: "Розмір гранту", value: opp.fundingDetails }
                      : null,
                    opp.duration
                      ? { label: "Тривалість", value: opp.duration }
                      : null,
                    opp.languages.length > 0
                      ? { label: "Мова", value: opp.languages.join(", ") }
                      : null,
                    ageLabel ? { label: "Вік учасників", value: ageLabel } : null,
                  ]
                    .filter(Boolean)
                    .map((row) => (
                      <div
                        key={row!.label}
                        className="flex items-start justify-between gap-4 py-2.5 border-b border-gray-100 last:border-0"
                      >
                        <span className="text-xs text-muted flex-shrink-0">{row!.label}</span>
                        <span className="text-xs font-semibold text-gray-800 text-right">{row!.value}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* ── Related ─────────────────────────────────────────────── */}
        {related.length > 0 && (
          <div className="mt-16 pt-10 border-t border-border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-gray-900">Схожі можливості</h2>
              <Link href="/opportunities" className="text-sm font-semibold text-primary hover:underline">
                Всі можливості →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/opportunities/${r.slug}`}
                  className="group bg-white rounded-2xl border border-border border-t-4 border-t-primary p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeColors[r.type]}`}>
                      {r.typeName}
                    </span>
                    {r.funding === "fully-funded" && (
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-50 text-green-700">
                        Повне
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted mb-1 uppercase tracking-wide">{r.org}</p>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                      {r.title}
                    </p>
                  </div>
                  <p className="text-xs text-muted mt-auto">
                    {r.flag} {r.location} · {r.deadlineDisplay}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
