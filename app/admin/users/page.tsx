"use client";

import { useState } from "react";

interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  status: "active" | "blocked";
  applications: number;
  joined: string;
}

const DEMO_USERS: DemoUser[] = [
  { id: "1", name: "Олена Петренко",  email: "olena@example.com",  role: "user",  status: "active",  applications: 3, joined: "2026-01-15" },
  { id: "2", name: "Микола Іваненко", email: "mykola@example.com", role: "user",  status: "active",  applications: 7, joined: "2026-02-03" },
  { id: "3", name: "Аня Коваль",      email: "anya@example.com",   role: "admin", status: "active",  applications: 1, joined: "2025-12-01" },
  { id: "4", name: "Тарас Шевченко",  email: "taras@example.com",  role: "user",  status: "blocked", applications: 0, joined: "2026-03-10" },
  { id: "5", name: "Марія Бондар",    email: "mariia@example.com", role: "user",  status: "active",  applications: 5, joined: "2026-04-22" },
  { id: "6", name: "Дмитро Гриценко", email: "dmytro@example.com", role: "user",  status: "active",  applications: 2, joined: "2026-05-01" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<DemoUser[]>(DEMO_USERS);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "user" | "admin">("all");

  const filtered = users.filter((u) => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  function toggleBlock(id: string) {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: u.status === "blocked" ? "active" : "blocked" } : u));
  }

  function setRole(id: string, role: "user" | "admin") {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role } : u));
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-foreground">Користувачі</h1>
          <p className="text-sm text-muted mt-0.5">{users.length} зареєстровано</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Пошук за ім'ям або email..."
          className="flex-1 px-4 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white" />
        <div className="flex gap-1 bg-muted-bg rounded-xl p-1">
          {(["all", "user", "admin"] as const).map((r) => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${roleFilter === r ? "bg-white text-foreground shadow-sm" : "text-muted hover:text-foreground"}`}>
              {r === "all" ? "Всі" : r === "user" ? "Користувачі" : "Адміни"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted-bg/50">
                <th className="text-left text-xs font-semibold text-muted px-5 py-3">Ім&apos;я</th>
                <th className="text-left text-xs font-semibold text-muted px-5 py-3 hidden sm:table-cell">Email</th>
                <th className="text-left text-xs font-semibold text-muted px-5 py-3 hidden md:table-cell">Заявки</th>
                <th className="text-left text-xs font-semibold text-muted px-5 py-3">Статус</th>
                <th className="text-left text-xs font-semibold text-muted px-5 py-3">Роль</th>
                <th className="text-left text-xs font-semibold text-muted px-5 py-3">Дії</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-border/50 last:border-0 hover:bg-muted-bg/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-light flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                        {user.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{user.name}</p>
                        <p className="text-xs text-muted hidden sm:hidden">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <p className="text-xs text-muted">{user.email}</p>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell">
                    <span className="text-sm font-semibold text-foreground">{user.applications}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      user.status === "active" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
                    }`}>
                      {user.status === "active" ? "Активний" : "Заблокований"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <select value={user.role} onChange={(e) => setRole(user.id, e.target.value as "user" | "admin")}
                      className="text-xs border border-border rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-primary/30">
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => toggleBlock(user.id)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                        user.status === "active"
                          ? "border-red-200 text-red-500 hover:bg-red-50"
                          : "border-green-200 text-green-600 hover:bg-green-50"
                      }`}>
                      {user.status === "active" ? "Блок" : "Розблок"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted">
              <p className="text-2xl mb-2">🔍</p>
              <p className="text-sm">Нічого не знайдено</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
