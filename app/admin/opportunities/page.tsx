"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { typeColors } from "@/lib/data";
import type { OpportunityType } from "@/lib/data";

interface OrgProject {
  id: string;
  title: string;
  type: string;
  type_name: string;
  status: string;
  deadline: string;
  deadline_display: string;
  country: string;
  flag: string;
  created_at: string;
  orgs: { id: string; name: string; slug: string | null } | null;
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  published: { label: "Опубліковано", cls: "bg-green-50 text-green-700" },
  draft:     { label: "Чернетка",     cls: "bg-muted-bg text-muted" },
  pending:   { label: "На модерації", cls: "bg-amber-50 text-amber-600" },
  archived:  { label: "Архів",        cls: "bg-gray-100 text-gray-500" },
};

export default function AdminOpportunitiesPage() {
  const [items, setItems]         = useState<OrgProject[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState<"all" | "published" | "draft" | "pending">("all");
  const [deleteTarget, setDeleteTarget] = useState<OrgProject | null>(null);
  const [deleting, setDeleting]   = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    fetch("/api/admin/opportunities")
      .then((r) => r.json())
      .then(({ opportunities }) => {
        if (opportunities) setItems(opportunities);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? items : items.filter((i) => i.status === filter);

  const counts = {
    all:       items.length,
    published: items.filter((i) => i.status === "published").length,
    pending:   items.filter((i) => i.status === "pending").length,
    draft:     items.filter((i) => i.status === "draft").length,
  };

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/opportunities/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
        setDeleteTarget(null);
      } else {
        const { error } = await res.json();
        setDeleteError(error ?? "Помилка видалення");
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground">Можливості</h1>
          <p className="text-sm text-muted mt-0.5">{counts.all} всього · {counts.published} опубліковано</p>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-muted-bg rounded-2xl p-1">
        {(["all", "published", "pending", "draft"] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${filter === s ? "bg-white text-foreground shadow-sm" : "text-muted hover:text-foreground"}`}>
            {s === "all" ? "Всі" : STATUS_LABEL[s]?.label ?? s} ({counts[s] ?? 0})
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 bg-white rounded-2xl border border-border animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white border border-border rounded-2xl">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-sm font-semibold text-foreground">Нічого немає</p>
          </div>
        ) : (
          filtered.map((item) => {
            const st = STATUS_LABEL[item.status] ?? { label: item.status, cls: "bg-muted-bg text-muted" };
            return (
              <div key={item.id}
                className="bg-white rounded-2xl border border-border p-4 flex items-center gap-4 hover:shadow-sm transition-all">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeColors[item.type as OpportunityType] ?? "bg-muted-bg text-muted"}`}>
                      {item.type_name || item.type}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                  </div>
                  <p className="text-sm font-bold text-foreground truncate">{item.title}</p>
                  <p className="text-xs text-muted">
                    {item.orgs?.name ?? "—"} · {item.flag} {item.country} · {item.deadline_display || item.deadline}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link href={`/opportunities/${item.id}`} target="_blank"
                    className="px-3 py-1.5 border border-border text-muted text-xs font-medium rounded-xl hover:bg-muted-bg transition-all">
                    ↗ Відкрити
                  </Link>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="px-3 py-1.5 border border-red-200 text-red-500 text-xs font-semibold rounded-xl hover:bg-red-50 transition-all">
                    Видалити
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !deleting && setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-foreground text-center mb-1">Видалити можливість?</h3>
            <p className="text-sm text-muted text-center mb-1">{deleteTarget.title}</p>
            <p className="text-xs text-muted text-center mb-6">{deleteTarget.orgs?.name}</p>
            <p className="text-xs text-red-500 bg-red-50 rounded-xl px-4 py-2.5 text-center mb-5">
              Це незворотна дія. Усі заявки на цю програму також буде видалено.
            </p>
            {deleteError && (
              <p className="text-xs text-red-500 text-center -mt-2 mb-3">{deleteError}</p>
            )}
            <div className="flex gap-3">
              <button onClick={() => { setDeleteTarget(null); setDeleteError(""); }} disabled={deleting}
                className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium text-muted hover:bg-muted-bg transition-all disabled:opacity-40">
                Скасувати
              </button>
              <button onClick={confirmDelete} disabled={deleting}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {deleting ? (
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : "Так, видалити"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
