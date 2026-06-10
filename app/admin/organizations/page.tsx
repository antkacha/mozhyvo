"use client";

import { useState, useEffect, useCallback } from "react";

type OrgStatus = "verified" | "pending" | "rejected" | "blocked";

interface OrgRow {
  id: string;
  name: string;
  contact_email: string;
  country: string;
  type: string;
  status: OrgStatus;
  description: string;
  website: string;
  created_at: string;
  verified_at: string | null;
  rejection_reason: string | null;
  _projectCount?: number;
}

const STATUS_MAP: Record<OrgStatus, { label: string; cls: string }> = {
  verified: { label: "Верифікована", cls: "bg-green-50 text-green-700" },
  pending:  { label: "На розгляді",  cls: "bg-amber-50 text-amber-600" },
  rejected: { label: "Відхилено",    cls: "bg-red-50 text-red-500" },
  blocked:  { label: "Заблоковано",  cls: "bg-gray-100 text-gray-500" },
};

export default function AdminOrganizationsPage() {
  const [orgs, setOrgs] = useState<OrgRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | OrgStatus>("all");
  const [search, setSearch] = useState("");
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selected, setSelected] = useState<OrgRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/orgs/list");
    const json = await res.json() as { orgs?: OrgRow[] };
    setOrgs(
      (json.orgs ?? []).map((row) => ({
        ...row,
        _projectCount: (row as unknown as { org_projects: { count: number }[] }).org_projects?.[0]?.count ?? 0,
      }))
    );
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = orgs.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (search && !o.name.toLowerCase().includes(search.toLowerCase()) &&
        !o.contact_email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const pending = orgs.filter((o) => o.status === "pending");

  async function doAction(orgId: string, action: "verify" | "reject" | "block" | "unblock", reason?: string) {
    setActionLoading(orgId);
    await fetch("/api/admin/orgs/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgId, action, rejectionReason: reason }),
    });
    await load();
    setActionLoading(null);
    setRejectTarget(null);
    setRejectReason("");
    if (selected?.id === orgId) setSelected(null);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-foreground">Організації</h1>
          <p className="text-sm text-muted mt-0.5">{orgs.length} всього · {pending.length} на розгляді</p>
        </div>
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Пошук..."
            className="pl-9 pr-4 py-2 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 w-56"
          />
        </div>
      </div>

      {/* Pending banner */}
      {pending.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-amber-700">{pending.length} {pending.length === 1 ? "організація чекає" : "організацій чекають"} верифікації</p>
            <p className="text-xs text-amber-600 mt-0.5">Перевірте дані та підтвердіть — автоматично піде email підтвердження</p>
          </div>
          <button onClick={() => setStatusFilter("pending")}
            className="px-4 py-2 bg-amber-500 text-white text-xs font-semibold rounded-xl hover:bg-amber-600 transition-all flex-shrink-0">
            Переглянути
          </button>
        </div>
      )}

      {/* Status tabs */}
      <div className="flex gap-1 bg-muted-bg rounded-2xl p-1 overflow-x-auto">
        {(["all", "pending", "verified", "rejected", "blocked"] as const).map((s) => {
          const count = s === "all" ? orgs.length : orgs.filter((o) => o.status === s).length;
          return (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${statusFilter === s ? "bg-white text-foreground shadow-sm" : "text-muted hover:text-foreground"}`}>
              {s === "all" ? "Всі" : STATUS_MAP[s].label} ({count})
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-sm text-muted">Організацій не знайдено</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted-bg/50">
                  <th className="text-left text-xs font-semibold text-muted px-5 py-3">Назва</th>
                  <th className="text-left text-xs font-semibold text-muted px-5 py-3 hidden md:table-cell">Тип / Країна</th>
                  <th className="text-left text-xs font-semibold text-muted px-5 py-3 hidden sm:table-cell">Проектів</th>
                  <th className="text-left text-xs font-semibold text-muted px-5 py-3">Статус</th>
                  <th className="text-left text-xs font-semibold text-muted px-5 py-3">Дії</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((org) => (
                  <tr key={org.id} className="border-b border-border/50 last:border-0 hover:bg-muted-bg/20 transition-colors">
                    <td className="px-5 py-4">
                      <button onClick={() => setSelected(org)} className="text-left group">
                        <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{org.name}</p>
                        <p className="text-xs text-muted">{org.contact_email}</p>
                      </button>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <p className="text-xs text-foreground">{org.type || "—"}</p>
                      <p className="text-xs text-muted">{org.country || "—"}</p>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <p className="text-sm font-semibold text-foreground">{org._projectCount ?? 0}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_MAP[org.status].cls}`}>
                        {STATUS_MAP[org.status].label}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        {actionLoading === org.id ? (
                          <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                        ) : (
                          <>
                            {org.status === "pending" && (
                              <>
                                <button onClick={() => doAction(org.id, "verify")}
                                  className="px-3 py-1.5 text-xs font-semibold bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all">
                                  Верифікувати
                                </button>
                                <button onClick={() => { setRejectTarget(org.id); setRejectReason(""); }}
                                  className="px-3 py-1.5 text-xs font-semibold border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-all">
                                  Відхилити
                                </button>
                              </>
                            )}
                            {org.status === "verified" && (
                              <button onClick={() => doAction(org.id, "block")}
                                className="px-3 py-1.5 text-xs font-semibold border border-gray-200 text-muted rounded-lg hover:bg-muted-bg transition-all">
                                Заблокувати
                              </button>
                            )}
                            {(org.status === "rejected" || org.status === "blocked") && (
                              <button onClick={() => doAction(org.id, "verify")}
                                className="px-3 py-1.5 text-xs font-semibold border border-green-200 text-green-600 rounded-lg hover:bg-green-50 transition-all">
                                Верифікувати
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject reason modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setRejectTarget(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold text-foreground mb-1">Причина відхилення</h3>
            <p className="text-xs text-muted mb-4">Буде надіслано на email організації</p>
            <textarea
              value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
              rows={4} placeholder="Вкажіть причину відхилення..."
              className="w-full px-3.5 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setRejectTarget(null)}
                className="px-4 py-2 border border-border rounded-xl text-sm text-muted hover:bg-muted-bg transition-all">
                Скасувати
              </button>
              <button onClick={() => doAction(rejectTarget, "reject", rejectReason)}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-40 transition-all">
                Відхилити + надіслати email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Org detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
              <div>
                <h3 className="text-base font-bold text-foreground">{selected.name}</h3>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_MAP[selected.status].cls}`}>
                  {STATUS_MAP[selected.status].label}
                </span>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-xl flex items-center justify-center text-muted hover:bg-muted-bg transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["Email",   selected.contact_email],
                  ["Тип",     selected.type || "—"],
                  ["Країна",  selected.country || "—"],
                  ["Сайт",    selected.website || "—"],
                  ["Зареєстровано", new Date(selected.created_at).toLocaleDateString("uk-UA")],
                  ["Проектів", String(selected._projectCount ?? 0)],
                ].map(([k, v]) => (
                  <div key={k}>
                    <p className="text-xs text-muted">{k}</p>
                    <p className="font-medium text-foreground truncate">{v}</p>
                  </div>
                ))}
              </div>
              {selected.description && (
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Опис</p>
                  <p className="text-sm text-foreground leading-relaxed bg-muted-bg rounded-xl p-4">{selected.description}</p>
                </div>
              )}
              {selected.rejection_reason && (
                <div className="bg-red-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-red-600 mb-1">Причина відхилення</p>
                  <p className="text-sm text-red-700">{selected.rejection_reason}</p>
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-border flex-shrink-0 flex gap-2 flex-wrap">
              {selected.status === "pending" && (
                <>
                  <button onClick={() => doAction(selected.id, "verify")}
                    className="flex-1 py-2 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-all">
                    Верифікувати ✓
                  </button>
                  <button onClick={() => { setRejectTarget(selected.id); setSelected(null); }}
                    className="flex-1 py-2 border border-red-200 text-red-500 text-sm font-semibold rounded-xl hover:bg-red-50 transition-all">
                    Відхилити
                  </button>
                </>
              )}
              {selected.status === "verified" && (
                <button onClick={() => doAction(selected.id, "block")}
                  className="flex-1 py-2 border border-border text-muted text-sm font-semibold rounded-xl hover:bg-muted-bg transition-all">
                  Заблокувати
                </button>
              )}
              {(selected.status === "blocked" || selected.status === "rejected") && (
                <button onClick={() => doAction(selected.id, "verify")}
                  className="flex-1 py-2 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-all">
                  Верифікувати
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
