"use client";

import Link from "next/link";
import { useState } from "react";
import { useOrgSession } from "@/hooks/useOrgSession";
import { useOrgProjects, OrgProject } from "@/hooks/useOrgProjects";
import { useOrgApplications } from "@/hooks/useOrgApplications";
import OrgShell from "@/components/OrgShell";

const TYPE_BORDER: Record<string, string> = {
  exchange: "border-t-green-500",
  grant: "border-t-yellow-400",
  internship: "border-t-blue-500",
  volunteer: "border-t-teal-500",
  conference: "border-t-pink-500",
  competition: "border-t-orange-500",
  hackathon: "border-t-red-500",
  training: "border-t-violet-500",
};

const STATUS_LABEL: Record<OrgProject["status"], string> = {
  published: "Опубліковано",
  draft: "Чернетка",
  closed: "Закрито",
};
const STATUS_CLASS: Record<OrgProject["status"], string> = {
  published: "bg-green-50 text-green-700",
  draft: "bg-amber-50 text-amber-600",
  closed: "bg-muted-bg text-muted",
};

function ProjectsContent() {
  const { org } = useOrgSession();
  const { projects, update, remove } = useOrgProjects(org?.id);
  const { applications } = useOrgApplications();
  const [filter, setFilter] = useState<OrgProject["status"] | "all">("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = filter === "all" ? projects : projects.filter((p) => p.status === filter);

  const counts = {
    all: projects.length,
    published: projects.filter((p) => p.status === "published").length,
    draft: projects.filter((p) => p.status === "draft").length,
    closed: projects.filter((p) => p.status === "closed").length,
  };

  return (
    <div className="page-transition">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-foreground">Проекти</h1>
          <p className="text-sm text-muted mt-0.5">{counts.all} проектів</p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm shadow-primary/20 flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Новий проект
        </Link>
      </div>

      {/* Status filter */}
      <div className="flex gap-1 bg-muted-bg p-1 rounded-2xl w-fit mb-7 text-sm">
        {([
          ["all", "Всі", counts.all],
          ["published", "Опубліковані", counts.published],
          ["draft", "Чернетки", counts.draft],
          ["closed", "Закриті", counts.closed],
        ] as const).map(([val, label, count]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold transition-all ${
              filter === val ? "bg-white text-foreground shadow-sm" : "text-muted hover:text-foreground"
            }`}
          >
            {label}
            <span className={`text-[11px] font-bold px-1.5 h-4 rounded-full flex items-center justify-center ${
              filter === val ? "bg-primary text-white" : "bg-border text-muted"
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-16 text-center">
          <div className="w-14 h-14 bg-primary-light rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
            </svg>
          </div>
          <p className="font-semibold text-foreground mb-1">Проектів ще немає</p>
          <p className="text-sm text-muted mb-6">Створіть перший проект та залучайте учасників</p>
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all"
          >
            Створити проект
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((p) => {
            const appCount = applications.filter((a) => a.projectId === p.id).length;
            const newCount = applications.filter((a) => a.projectId === p.id && a.status === "new").length;
            const borderColor = TYPE_BORDER[p.type] ?? "border-t-border";

            return (
              <div
                key={p.id}
                className={`bg-white rounded-2xl border border-border border-t-4 ${borderColor} shadow-sm hover:shadow-md transition-all`}
              >
                <div className="p-5">
                  {/* Top row: badges + stats */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_CLASS[p.status]}`}>
                        {STATUS_LABEL[p.status]}
                      </span>
                      <span className="text-xs text-muted bg-muted-bg px-2.5 py-1 rounded-full">{p.typeName}</span>
                      <span className="text-xs text-muted bg-muted-bg px-2.5 py-1 rounded-full">{p.flag} {p.location}</span>
                    </div>

                    {/* App count */}
                    <Link
                      href={`/dashboard/applications?project=${p.id}`}
                      className="flex items-center gap-1.5 flex-shrink-0 group"
                    >
                      <div className="text-right">
                        <p className="text-lg font-black text-primary leading-none">{appCount}</p>
                        <p className="text-[10px] text-muted group-hover:text-primary transition-colors">заявок</p>
                      </div>
                      {newCount > 0 && (
                        <span className="w-5 h-5 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {newCount}
                        </span>
                      )}
                    </Link>
                  </div>

                  {/* Title + description */}
                  <h3 className="font-bold text-foreground text-base leading-snug mb-1">{p.title}</h3>
                  <p className="text-sm text-muted line-clamp-1 mb-4">{p.shortDescription}</p>

                  {/* Bottom row */}
                  <div className="flex items-center justify-between pt-4 border-t border-border gap-3 flex-wrap">
                    <div className="flex items-center gap-4 text-xs text-muted">
                      <span>
                        <span className="text-foreground font-medium">Дедлайн:</span> {p.deadlineDisplay}
                      </span>
                      <span className="hidden sm:block text-border">|</span>
                      <span className="hidden sm:block">
                        {p.funding === "fully-funded"
                          ? "Повне фінансування"
                          : p.funding === "partially-funded"
                          ? "Часткове фінансування"
                          : "Без фінансування"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => update(p.id, { status: p.status === "published" ? "draft" : "published" })}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all ${
                          p.status === "published"
                            ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                            : "bg-green-50 text-green-700 hover:bg-green-100"
                        }`}
                      >
                        {p.status === "published" ? "Зняти" : "Опублікувати"}
                      </button>
                      <Link
                        href={`/dashboard/projects/${p.id}`}
                        className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-primary-light text-primary hover:bg-primary/10 transition-all"
                      >
                        Редагувати
                      </Link>
                      <button
                        onClick={() => setDeleteId(p.id)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-xl text-red-500 hover:bg-red-50 transition-all"
                      >
                        Видалити
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-7">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-foreground text-center mb-2">Видалити проект?</h3>
            <p className="text-sm text-muted text-center mb-6 leading-relaxed">
              Цю дію не можна скасувати. Заявки на цей проект залишаться в системі.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted-bg transition-all"
              >
                Скасувати
              </button>
              <button
                onClick={() => { remove(deleteId); setDeleteId(null); }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-all"
              >
                Видалити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
  return <OrgShell><ProjectsContent /></OrgShell>;
}
