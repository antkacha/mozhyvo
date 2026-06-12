"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import { useApplications } from "@/hooks/useApplications";
import StatusBadge from "@/components/StatusBadge";
import type { Application } from "@/hooks/useApplications";

export default function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { applications, ready } = useApplications();
  const [app, setApp] = useState<Application | null>(null);

  useEffect(() => {
    if (ready) {
      const found = applications.find((a) => a.id === id);
      setApp(found ?? null);
    }
  }, [ready, applications, id]);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (ready && !app) return notFound();

  return (
    <div className="min-h-screen bg-[#f0f2f5] pb-16">
      {/* Back */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <Link
          href="/cabinet/applications"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Мої заявки
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 flex flex-col gap-4">
        {/* Header card */}
        <div className="rounded-2xl overflow-hidden shadow-sm border border-primary/10">
          <div className="h-2 bg-primary w-full" />
          <div className="bg-white px-8 py-7">
            <p className="text-xs font-semibold text-primary uppercase tracking-widest mb-2">{app!.org}</p>
            <h1 className="text-2xl font-black text-foreground leading-tight mb-4">{app!.opportunityTitle}</h1>
            <div className="flex flex-wrap items-center gap-4">
              <StatusBadge status={app!.status} />
              <span className="text-sm text-muted">
                Подано: <span className="font-semibold text-foreground">
                  {new Date(app!.submittedAt).toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              </span>
              {app!.deadline && (
                <span className="text-sm text-muted">
                  Дедлайн: <span className="font-semibold text-foreground">
                    {new Date(app!.deadline).toLocaleDateString("uk-UA", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Personal info */}
        <div className="bg-white rounded-2xl shadow-sm border border-border px-8 py-6">
          <h2 className="text-xs font-semibold text-primary uppercase tracking-wider mb-4">Особисті дані</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Ім'я",    value: `${app!.firstName} ${app!.lastName}` },
              { label: "Email",   value: app!.email },
              { label: "Телефон",  value: app!.phone || "—" },
              { label: "Країна",  value: app!.country },
            ].map(({ label, value }) => (
              <div key={label} className="bg-muted-bg rounded-xl px-4 py-3">
                <p className="text-[11px] text-muted mb-0.5">{label}</p>
                <p className="font-semibold text-foreground text-sm break-all">{value || "—"}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="bg-white rounded-2xl shadow-sm border border-border px-8 py-6">
          <h2 className="text-xs font-semibold text-primary uppercase tracking-wider mb-4">Освіта та мови</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Заклад",       value: app!.institution },
              { label: "Ступінь",      value: app!.degree },
              { label: "Рік випуску",  value: app!.graduationYear || "—" },
              { label: "Мови",         value: app!.languages.join(", ") || "—" },
            ].map(({ label, value }) => (
              <div key={label} className="bg-muted-bg rounded-xl px-4 py-3">
                <p className="text-[11px] text-muted mb-0.5">{label}</p>
                <p className="font-semibold text-foreground text-sm">{value || "—"}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Motivation */}
        {app!.motivation && (
          <div className="bg-white rounded-2xl shadow-sm border border-border px-8 py-6">
            <h2 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Мотиваційний лист</h2>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{app!.motivation}</p>
          </div>
        )}

        {/* Documents */}
        {(app!.cvUrl || app!.portfolioUrl) && (
          <div className="bg-white rounded-2xl shadow-sm border border-border px-8 py-6">
            <h2 className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Документи</h2>
            <div className="flex flex-col gap-3">
              {app!.cvUrl && (
                <a href={app!.cvUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 px-4 py-3 bg-muted-bg rounded-xl text-sm font-medium text-primary hover:bg-primary-light transition-colors">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Резюме / CV
                </a>
              )}
              {app!.portfolioUrl && (
                <a href={app!.portfolioUrl} target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 px-4 py-3 bg-muted-bg rounded-xl text-sm font-medium text-primary hover:bg-primary-light transition-colors">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Портфоліо
                </a>
              )}
            </div>
          </div>
        )}

        {/* Back to opportunity */}
        {app!.opportunitySlug && (
          <div className="text-center py-2">
            <Link
              href={`/opportunities/${app!.opportunitySlug}`}
              className="text-sm text-muted hover:text-primary transition-colors"
            >
              Переглянути програму →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
