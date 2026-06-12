"use client";

import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";

interface StatsData {
  totalUsers: number;
  totalApps: number;
  totalOrgs: number;
  pendingOrgs: number;
  pendingOpps: number;
  registrations: { date: string; users: number }[];
  appsByType: { type: string; typeName: string; count: number }[];
}

interface TooltipEntry { dataKey: string; name?: string; value: number; color?: string }
interface TooltipProps { active?: boolean; payload?: TooltipEntry[]; label?: string }

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-xl px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name ?? p.dataKey}: {p.value}</p>
      ))}
    </div>
  );
}

function StatCard({ label, value, delta, color, bg }: {
  label: string; value: string | number; delta?: string; color: string; bg: string;
}) {
  return (
    <div className={`rounded-2xl border border-border p-5 ${bg}`}>
      <p className={`text-3xl font-black ${color}`}>{value}</p>
      <p className="text-xs text-muted mt-0.5">{label}</p>
      {delta && <p className="text-xs font-semibold text-green-600 mt-1">{delta}</p>}
    </div>
  );
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((json: StatsData) => { setData(json); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-black text-foreground">Огляд платформи</h1>
          <p className="text-sm text-muted mt-0.5">Статистика в реальному часі</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border p-5 bg-muted-bg animate-pulse h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-border p-6 h-64 animate-pulse" />
          <div className="bg-white rounded-2xl border border-border p-6 h-64 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-foreground">Огляд платформи</h1>
        <p className="text-sm text-muted mt-0.5">Статистика в реальному часі</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Користувачів"   value={data.totalUsers.toLocaleString("uk-UA")} color="text-primary"   bg="bg-primary-light" />
        <StatCard label="Заявок"         value={data.totalApps.toLocaleString("uk-UA")}  color="text-green-600" bg="bg-green-50" />
        <StatCard label="Організацій"    value={data.totalOrgs.toLocaleString("uk-UA")}  color="text-amber-600" bg="bg-amber-50" />
        <StatCard label="На верифікації" value={data.pendingOrgs} color="text-red-500"   bg="bg-red-50" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-border p-6">
          <h2 className="text-sm font-bold text-foreground mb-5">Нові реєстрації (останні 9 днів)</h2>
          {data.registrations.every((r) => r.users === 0) ? (
            <div className="h-48 flex items-center justify-center text-sm text-muted">Даних поки немає</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.registrations}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F5" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6B7280" }} />
                <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="users" stroke="#3B4FE8" strokeWidth={2.5} dot={{ r: 3, fill: "#3B4FE8" }} name="Реєстрації" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-border p-6">
          <h2 className="text-sm font-bold text-foreground mb-5">Заявки за типом програми</h2>
          {data.appsByType.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-sm text-muted">Даних поки немає</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.appsByType.map((d) => ({ ...d, name: d.typeName || d.type }))} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F5" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#6B7280" }} allowDecimals={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#6B7280" }} width={90} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#3B4FE8" radius={[0, 4, 4, 0]} name="Заявки" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Quick action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <a href="/admin/organizations"
          className="rounded-2xl border border-amber-100 bg-amber-50 p-5 flex items-center justify-between gap-3 hover:shadow-sm transition-all">
          <div>
            <p className="text-sm font-semibold text-amber-700">Організацій на верифікації</p>
            <p className="text-xs text-amber-600 mt-0.5">Перевірте дані та підтвердіть</p>
          </div>
          <span className="text-3xl font-black text-amber-600 flex-shrink-0">{data.pendingOrgs}</span>
        </a>
        <a href="/admin/opportunities"
          className="rounded-2xl border border-blue-100 bg-blue-50 p-5 flex items-center justify-between gap-3 hover:shadow-sm transition-all">
          <div>
            <p className="text-sm font-semibold text-blue-700">Можливостей на модерації</p>
            <p className="text-xs text-blue-600 mt-0.5">Програми очікують публікації</p>
          </div>
          <span className="text-3xl font-black text-blue-600 flex-shrink-0">{data.pendingOpps}</span>
        </a>
      </div>
    </div>
  );
}
