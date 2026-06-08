import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-border last:border-0">
      <span className="text-xs text-muted flex-shrink-0">{label}</span>
      <span className="text-xs font-medium text-foreground text-right">{value}</span>
    </div>
  );
}

export default function OpportunityDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const opp = opportunities.find((o) => o.slug === params.slug);
  if (!opp) notFound();

  const isExpiringSoon = () => {
    const diff =
      (new Date(opp.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff <= 14 && diff > 0;
  };

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back */}
      <Link
        href="/opportunities"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors duration-200 mb-8"
      >
        ← Назад до можливостей
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* ── Main content ── */}
        <article className="lg:col-span-2">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeColors[opp.type]}`}
            >
              {opp.typeName}
            </span>
            {opp.funding === "fully-funded" && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                Повне фінансування
              </span>
            )}
          </div>

          <p className="text-sm font-medium text-muted mb-2">{opp.org}</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground leading-tight mb-5">
            {opp.title}
          </h1>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-8">
            {opp.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs bg-muted-bg text-muted px-2.5 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Description */}
          <section className="mb-8">
            <h2 className="text-lg font-bold text-foreground mb-3">
              Про програму
            </h2>
            <div className="text-sm text-muted leading-relaxed whitespace-pre-line space-y-3">
              {opp.fullDescription}
            </div>
          </section>

          {/* Requirements */}
          <section className="mb-8">
            <h2 className="text-lg font-bold text-foreground mb-4">Вимоги</h2>
            <ul className="flex flex-col gap-3">
              {opp.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-muted">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-primary-light text-primary flex items-center justify-center flex-shrink-0 text-xs font-bold">
                    {i + 1}
                  </span>
                  {req}
                </li>
              ))}
            </ul>
          </section>

          {/* Benefits */}
          <section>
            <h2 className="text-lg font-bold text-foreground mb-4">
              Що включає
            </h2>
            <ul className="flex flex-col gap-2.5">
              {opp.benefits.map((benefit, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-muted">
                  <span className="mt-0.5 text-primary font-bold">✓</span>
                  {benefit}
                </li>
              ))}
            </ul>
          </section>
        </article>

        {/* ── Sidebar ── */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 flex flex-col gap-4">
            {/* Apply card */}
            <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
              <div
                className={`text-center mb-5 p-3 rounded-xl ${
                  isExpiringSoon() ? "bg-red-50" : "bg-muted-bg"
                }`}
              >
                <p className="text-xs text-muted mb-1">Дедлайн подачі</p>
                <p
                  className={`text-xl font-bold ${
                    isExpiringSoon() ? "text-red-600" : "text-foreground"
                  }`}
                >
                  {opp.deadlineDisplay}
                </p>
                {isExpiringSoon() && (
                  <p className="text-xs text-red-500 mt-1">
                    ⏰ Скоро завершується!
                  </p>
                )}
              </div>

              <div className="mb-3">
                <ApplyButton slug={opp.slug} />
              </div>
              <SaveButton slug={opp.slug} />
            </div>

            {/* Info card */}
            <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
              <p className="text-sm font-semibold text-foreground mb-3">
                Деталі програми
              </p>
              <div>
                <InfoRow
                  label="Формат"
                  value={formatLabels[opp.format]}
                />
                <InfoRow
                  label="Місце"
                  value={`${opp.flag} ${opp.location}`}
                />
                <InfoRow
                  label="Фінансування"
                  value={fundingLabels[opp.funding]}
                />
                {opp.fundingDetails && (
                  <InfoRow label="Розмір гранту" value={opp.fundingDetails} />
                )}
                {opp.duration && (
                  <InfoRow label="Тривалість" value={opp.duration} />
                )}
                {opp.languages.length > 0 && (
                  <InfoRow label="Мова" value={opp.languages.join(", ")} />
                )}
                {ageLabel && (
                  <InfoRow label="Вік учасників" value={ageLabel} />
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Related opportunities */}
      {related.length > 0 && (
        <div className="mt-16 pt-10 border-t border-border">
          <h2 className="text-xl font-bold text-foreground mb-6">
            Схожі можливості
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/opportunities/${r.slug}`}
                className="group bg-white rounded-2xl border border-border p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-3"
              >
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full self-start ${typeColors[r.type]}`}
                >
                  {r.typeName}
                </span>
                <div>
                  <p className="text-xs text-muted mb-1">{r.org}</p>
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {r.title}
                  </p>
                </div>
                <p className="text-xs text-muted mt-auto">
                  {r.flag} {r.location} · Дедлайн: {r.deadlineDisplay}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
