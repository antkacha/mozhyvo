"use client";

import { useState, useEffect, useCallback } from "react";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
  applications: number;
  joined: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin" | "org">("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/users");
    const json = await res.json() as { users?: UserRow[] };
    setUsers(json.users ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) &&
        !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  async function doAction(userId: string, action: "ban" | "unban" | "set_role", role?: string) {
    setActionLoading(userId);
    await fetch(`/api/admin/users/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, role }),
    });
    await load();
    setActionLoading(null);
  }

  const roleLabel: Record<string, { label: string; cls: string }> = {
    admin: { label: "Адмін",       cls: "bg-primary/10 text-primary" },
    org:   { label: "Організація", cls: "bg-amber-50 text-amber-600" },
    user:  { label: "Користувач",  cls: "bg-muted-bg text-muted" },
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black text-foreground">Користувачі</h1>
          <p className="text-sm text-muted mt-0.5">{users.length} зареєстровано</p>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-xs font-semibold border border-border rounded-xl text-muted hover:bg-muted-bg transition-all disabled:opacity-50">
          <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Оновити
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Пошук за ім'ям або email..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white" />
        </div>
        <div className="flex gap-1 bg-muted-bg rounded-xl p-1">
          {(["all", "user", "org", "admin"] as const).map((r) => {
            const count = r === "all" ? users.length : users.filter((u) => u.role === r).length;
            return (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  roleFilter === r ? "bg-white text-foreground shadow-sm" : "text-muted hover:text-foreground"
                }`}>
                {r === "all" ? "Всі" : r === "user" ? "Користувачі" : r === "org" ? "Організації" : "Адміни"} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-2xl mb-2">🔍</p>
            <p className="text-sm text-muted">Нічого не знайдено</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted-bg/50">
                  <th className="text-left text-xs font-semibold text-muted px-5 py-3">Ім&apos;я</th>
                  <th className="text-left text-xs font-semibold text-muted px-5 py-3 hidden sm:table-cell">Email</th>
                  <th className="text-left text-xs font-semibold text-muted px-5 py-3 hidden md:table-cell">Заявки</th>
                  <th className="text-left text-xs font-semibold text-muted px-5 py-3 hidden md:table-cell">Зареєстровано</th>
                  <th className="text-left text-xs font-semibold text-muted px-5 py-3">Роль</th>
                  <th className="text-left text-xs font-semibold text-muted px-5 py-3">Статус / Дії</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className={`border-b border-border/50 last:border-0 transition-colors ${u.banned ? "bg-red-50/40" : "hover:bg-muted-bg/20"}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                          {u.name[0]?.toUpperCase() ?? "?"}
                        </div>
                        <p className="text-sm font-semibold text-foreground">{u.name}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <p className="text-xs text-muted">{u.email}</p>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-sm font-semibold text-foreground">{u.applications}</span>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <p className="text-xs text-muted">
                        {new Date(u.joined).toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                      </p>
                    </td>
                    <td className="px-5 py-3.5">
                      {actionLoading === u.id ? (
                        <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                      ) : (
                        <select
                          value={u.role}
                          onChange={(e) => doAction(u.id, "set_role", e.target.value)}
                          className="text-xs border border-border rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary/30"
                        >
                          <option value="user">user</option>
                          <option value="org">org</option>
                          <option value="admin">admin</option>
                        </select>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          u.banned ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"
                        }`}>
                          {u.banned ? "Заблоковано" : "Активний"}
                        </span>
                        {actionLoading === u.id ? null : (
                          <button
                            onClick={() => doAction(u.id, u.banned ? "unban" : "ban")}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                              u.banned
                                ? "border-green-200 text-green-600 hover:bg-green-50"
                                : "border-red-200 text-red-500 hover:bg-red-50"
                            }`}
                          >
                            {u.banned ? "Розблок" : "Блок"}
                          </button>
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
    </div>
  );
}
