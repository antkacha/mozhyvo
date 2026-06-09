"use client";

import { useState } from "react";
import { opportunities as allOpps, typeColors } from "@/lib/data";
import type { OpportunityType } from "@/lib/data";

type ModStatus = "pending" | "approved" | "rejected";

interface ModOpportunity {
  slug: string;
  title: string;
  org: string;
  type: string;
  typeName: string;
  country: string;
  deadline: string;
  deadlineDisplay: string;
  modStatus: ModStatus;
  submittedAt: string;
}

// Simulate a moderation queue from static data
const INITIAL: ModOpportunity[] = allOpps.slice(0, 10).map((o, i) => ({
  slug:           o.slug,
  title:          o.title,
  org:            o.org,
  type:           o.type,
  typeName:       o.typeName,
  country:        o.country,
  deadline:       o.deadline,
  deadlineDisplay:o.deadlineDisplay,
  modStatus:      (["pending", "pending", "approved", "pending", "rejected", "approved", "pending", "approved", "pending", "approved"] as ModStatus[])[i],
  submittedAt:    "2026-05-" + String(i + 10).padStart(2, "0"),
}));

const STATUS_MAP: Record<ModStatus, { label: string; cls: string }> = {
  pending:  { label: "На модерації", cls: "bg-amber-50 text-amber-600" },
  approved: { label: "Опубліковано", cls: "bg-green-50 text-green-700" },
  rejected: { label: "Відхилено",    cls: "bg-red-50 text-red-500" },
};

export default function AdminOpportunitiesPage() {
  const [items, setItems]         = useState<ModOpportunity[]>(INITIAL);
  const [filter, setFilter]       = useState<"all" | ModStatus>("pending");
  const [selected, setSelected]   = useState<string[]>([]);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [preview, setPreview]     = useState<ModOpportunity | null>(null);

  const filtered = filter === "all" ? items : items.filter((i) => i.modStatus === filter);
  const pendingCount = items.filter((i) => i.modStatus === "pending").length;

  function setMod(slug: string, status: ModStatus) {
    setItems((prev) => prev.map((i) => i.slug === slug ? { ...i, modStatus: status } : i));
    setSelected((prev) => prev.filter((s) => s !== slug));
  }

  function bulkApprove() {
    setItems((prev) => prev.map((i) => selected.includes(i.slug) ? { ...i, modStatus: "approved" } : i));
    setSelected([]);
  }

  function handleReject(slug: string) {
    setMod(slug, "rejected");
    setRejectTarget(null);
    setRejectReason("");
  }

  function toggleSelect(slug: string) {
    setSelected((prev) => prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground">Модерація можливостей</h1>
          <p className="text-sm text-muted mt-0.5">{pendingCount} очікують перевірки</p>
        </div>
      </div>

      {/* Bulk toolbar */}
      {selected.length > 0 && (
        <div className="bg-primary-light border border-primary/20 rounded-2xl px-5 py-3 flex items-center justify-between gap-4">
          <p className="text-sm font-semibold text-primary">Обрано: {selected.length}</p>
          <div className="flex gap-2">
            <button onClick={bulkApprove}
              className="px-4 py-2 bg-green-500 text-white text-xs font-semibold rounded-xl hover:bg-green-600 transition-all">
              Схвалити все
            </button>
            <button onClick={() => setSelected([])}
              className="px-4 py-2 border border-border text-muted text-xs rounded-xl hover:bg-muted-bg transition-all">
              Скасувати
            </button>
          </div>
        </div>
      )}

      {/* Status tabs */}
      <div className="flex gap-1 bg-muted-bg rounded-2xl p-1">
        {(["pending", "approved", "rejected", "all"] as const).map((s) => {
          const count = s === "all" ? items.length : items.filter((i) => i.modStatus === s).length;
          return (
            <button key={s} onClick={() => setFilter(s)}
              className={`flex-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${filter === s ? "bg-white text-foreground shadow-sm" : "text-muted hover:text-foreground"}`}>
              {s === "all" ? "Всі" : STATUS_MAP[s].label} ({count})
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="flex flex-col gap-3">
        {filtered.map((item) => (
          <div key={item.slug}
            className={`bg-white rounded-2xl border p-4 flex items-center gap-4 hover:shadow-sm transition-all ${
              item.modStatus === "pending" ? "border-amber-200" : "border-border"
            }`}>
            {item.modStatus === "pending" && (
              <input type="checkbox" checked={selected.includes(item.slug)}
                onChange={() => toggleSelect(item.slug)}
                className="w-4 h-4 accent-primary flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0" onClick={() => setPreview(item)} role="button">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeColors[item.type as OpportunityType]}`}>{item.typeName}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_MAP[item.modStatus].cls}`}>{STATUS_MAP[item.modStatus].label}</span>
              </div>
              <p className="text-sm font-bold text-foreground truncate">{item.title}</p>
              <p className="text-xs text-muted">{item.org} · {item.country} · {item.deadlineDisplay}</p>
            </div>
            {item.modStatus === "pending" && (
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => setMod(item.slug, "approved")}
                  className="px-3 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-xl hover:bg-green-600 transition-all">
                  Схвалити
                </button>
                <button onClick={() => setRejectTarget(item.slug)}
                  className="px-3 py-1.5 border border-red-200 text-red-500 text-xs font-semibold rounded-xl hover:bg-red-50 transition-all">
                  Відхилити
                </button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 bg-white border border-border rounded-2xl">
            <p className="text-3xl mb-2">✅</p>
            <p className="text-sm font-semibold text-foreground">Нічого немає</p>
          </div>
        )}
      </div>

      {/* Reject modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setRejectTarget(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold text-foreground mb-4">Причина відхилення</h3>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
              rows={4} placeholder="Вкажіть причину..."
              className="w-full px-3.5 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none mb-4" />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setRejectTarget(null)}
                className="px-4 py-2 border border-border rounded-xl text-sm text-muted hover:bg-muted-bg transition-all">Скасувати</button>
              <button onClick={() => handleReject(rejectTarget!)} disabled={!rejectReason.trim()}
                className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-40 transition-all">Відхилити</button>
            </div>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPreview(null)} />
          <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-foreground line-clamp-1">{preview.title}</h3>
              <button onClick={() => setPreview(null)} className="p-1.5 rounded-lg hover:bg-muted-bg text-muted">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="space-y-3 text-sm">
              {[
                { label: "Організація", value: preview.org },
                { label: "Тип",         value: preview.typeName },
                { label: "Країна",      value: preview.country },
                { label: "Дедлайн",     value: preview.deadlineDisplay },
                { label: "Подано",      value: preview.submittedAt },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-3">
                  <span className="text-muted">{label}</span>
                  <span className="font-medium text-foreground">{value}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex gap-3">
              <a href={`/opportunities/${preview.slug}`} target="_blank" rel="noreferrer"
                className="flex-1 text-center py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted-bg transition-all">
                Відкрити сторінку ↗
              </a>
              {preview.modStatus === "pending" && (
                <button onClick={() => { setMod(preview.slug, "approved"); setPreview(null); }}
                  className="flex-1 py-2.5 bg-green-500 text-white rounded-xl text-sm font-semibold hover:bg-green-600 transition-all">
                  Схвалити
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
