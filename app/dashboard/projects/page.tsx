"use client";

import Link from "next/link";
import { useState } from "react";
import { useOrgSession } from "@/hooks/useOrgSession";
import { useOrgProjects, OrgProject } from "@/hooks/useOrgProjects";
import { useOrgApplications } from "@/hooks/useOrgApplications";
import OrgShell from "@/components/OrgShell";

const STATUS_LABELS: Record<OrgProject["status"], string> = {
  published: "Опубліковано",
  draft: "Чернетка",
  closed: "Закрито",
};
const STATUS_STYLES: Record<OrgProject["status"], string> = {
  published: "bg-green-100 text-green-700",
  draft: "bg-yellow-100 text-yellow-700",
  closed: "bg-gray-100 text-gray-500",
};
const FUNDING_LABELS: Record<OrgProject["funding"], string> = {
  "fully-funded": "Повне фінансування",
  "partially-funded": "Часткове фінансування",
  "self-funded": "Без фінансування",
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

  function handleDelete(id: string) {
    remove(id);
    setDeleteId(null);
  }

  function togglePublish(p: OrgProject) {
    update(p.id, { status: p.status === "published" ? "draft" : "published" });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Проекти</h1>
          <p className="text-sm text-gray-500 mt-0.5">{counts.all} проектів всього</p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-all shadow-sm shadow-primary/25"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Новий проект
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {([["all", "Всі"], ["published", "Опубліковані"], ["draft", "Чернетки"], ["closed", "Закриті"]] as const).map(
          ([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter(val)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                filter === val
                  ? "bg-primary text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-primary/40"
              }`}
            >
              {label}
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${filter === val ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                {counts[val]}
              </span>
            </button>
          )
        )}
      </div>

      {/* Project list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-semibold text-gray-700 mb-1">Проектів ще немає</p>
          <p className="text-sm text-gray-400 mb-5">Створіть перший проект та залучайте учасників</p>
          <Link href="/dashboard/projects/new" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all">
            + Створити проект
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((p) => {
            const appCount = applications.filter((a) => a.projectId === p.id).length;
            const newCount = applications.filter((a) => a.projectId === p.id && a.status === "new").length;
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[p.status]}`}>
                          {STATUS_LABELS[p.status]}
                        </span>
                        <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">{p.typeName}</span>
                        <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">{p.flag} {p.location}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-base leading-snug mb-1">{p.title}</h3>
                      <p className="text-sm text-gray-500 line-clamp-1">{p.shortDescription}</p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 flex-shrink-0 text-center">
                      <div>
                        <p className="text-lg font-black text-gray-900">{p.views}</p>
                        <p className="text-xs text-gray-400">переглядів</p>
                      </div>
                      <Link href={`/dashboard/applications?project=${p.id}`} className="group">
                        <div className="relative">
                          <p className="text-lg font-black text-primary">{appCount}</p>
                          <p className="text-xs text-gray-400 group-hover:text-primary transition-colors">заявок</p>
                        </div>
                        {newCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {newCount}
                          </span>
                        )}
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span>Дедлайн: <span className="font-semibold text-gray-700">{p.deadlineDisplay}</span></span>
                      <span className="text-gray-200">|</span>
                      <span>{FUNDING_LABELS[p.funding]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => togglePublish(p)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                          p.status === "published"
                            ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                            : "bg-green-50 text-green-700 hover:bg-green-100"
                        }`}
                      >
                        {p.status === "published" ? "Зняти з публікації" : "Опублікувати"}
                      </button>
                      <Link
                        href={`/dashboard/projects/${p.id}`}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary-light text-primary hover:bg-primary/10 transition-all"
                      >
                        Редагувати
                      </Link>
                      <button
                        onClick={() => setDeleteId(p.id)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all"
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

      {/* Delete confirmation modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-center text-gray-900 mb-1">Видалити проект?</h3>
            <p className="text-sm text-gray-500 text-center mb-5">Цю дію не можна скасувати. Всі заявки залишаться в системі.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all">
                Скасувати
              </button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-all">
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
