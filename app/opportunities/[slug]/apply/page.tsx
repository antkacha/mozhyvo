import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { opportunities } from "@/lib/data";
import ApplyForm from "@/components/ApplyForm";

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
    title: `Подати заявку — ${opp.title} | Моживо`,
    description: `Заповни заявку на участь у програмі ${opp.title} від ${opp.org}.`,
  };
}

export default function ApplyPage({ params }: { params: { slug: string } }) {
  const opp = opportunities.find((o) => o.slug === params.slug);
  if (!opp) notFound();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      {/* Back */}
      <Link
        href={`/opportunities/${opp.slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors mb-8"
      >
        ← Повернутись до програми
      </Link>

      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-medium text-muted mb-1">{opp.org}</p>
        <h1 className="text-2xl font-extrabold text-foreground leading-tight mb-2">
          {opp.title}
        </h1>
        <div className="flex items-center gap-3 text-sm text-muted">
          <span>{opp.flag} {opp.location}</span>
          <span>·</span>
          <span>Дедлайн: {opp.deadlineDisplay}</span>
        </div>
      </div>

      <ApplyForm opp={opp} />
    </div>
  );
}
