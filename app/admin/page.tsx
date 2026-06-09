"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from "recharts";

// Demo data — in production these come from Supabase aggregates
const STATS = [
  { label: "Користувачів",      value: "1 247",  delta: "+38",  color: "text-primary",    bg: "bg-primary-light" },
  { label: "Заявок",            value: "4 891",  delta: "+143", color: "text-green-600",  bg: "bg-green-50" },
  { label: "Організацій",       value: "89",     delta: "+3",   color: "text-amber-600",  bg: "bg-amber-50" },
  { label: "На верифікації",    value: "12",     delta: "",     color: "text-red-500",    bg: "bg-red-50" },
];

const registrations = [
  { date: "01.06", users: 18 }, { date: "02.06", users: 24 }, { date: "03.06", users: 31 },
  { date: "04.06", users: 27 }, { date: "05.06", users: 42 }, { date: "06.06", users: 38 },
  { date: "07.06", users: 51 }, { date: "08.06", users: 44 }, { date: "09.06", users: 63 },
];

const byType = [
  { type: "Стипендія",   count: 1432 }, { type: "Стажування", count: 987 },
  { type: "Обмін",       count: 754  }, { type: "Волонтерство",count: 612 },
  { type: "Грант",       count: 441  }, { type: "Конкурс",     count: 312 },
];

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

export default function AdminOverviewPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-foreground">Огляд платформи</h1>
        <p className="text-sm text-muted mt-0.5">Статистика в реальному часі</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STATS.map(({ label, value, delta, color, bg }) => (
          <div key={label} className={`rounded-2xl border border-border p-5 ${bg}`}>
            <p className={`text-3xl font-black ${color}`}>{value}</p>
            <p className="text-xs text-muted mt-0.5">{label}</p>
            {delta && <p className="text-xs font-semibold text-green-600 mt-1">{delta} цього тижня</p>}
          </div>
        ))}
      </div>

      {/* Registration trend */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <h2 className="text-sm font-bold text-foreground mb-5">Нові реєстрації (останні 9 днів)</h2>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={registrations}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F5" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6B7280" }} />
            <YAxis tick={{ fontSize: 11, fill: "#6B7280" }} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="users" stroke="#3B4FE8" strokeWidth={2.5} dot={{ r: 3, fill: "#3B4FE8" }} name="Реєстрації" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Applications by type */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <h2 className="text-sm font-bold text-foreground mb-5">Заявки за типом програми</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={byType} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#F4F4F5" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 11, fill: "#6B7280" }} />
            <YAxis dataKey="type" type="category" tick={{ fontSize: 11, fill: "#6B7280" }} width={90} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill="#3B4FE8" radius={[0, 4, 4, 0]} name="Заявки" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Нові організації на верифікації", count: 4, href: "/admin/organizations", color: "text-amber-600 bg-amber-50 border-amber-100" },
          { label: "Можливості на модерації",          count: 7, href: "/admin/opportunities", color: "text-blue-600 bg-blue-50 border-blue-100" },
          { label: "Скарги користувачів",              count: 2, href: "/admin/users",         color: "text-red-600 bg-red-50 border-red-100" },
        ].map(({ label, count, href, color }) => (
          <a key={href} href={href}
            className={`rounded-2xl border p-5 flex items-center justify-between gap-3 hover:shadow-sm transition-all ${color}`}>
            <p className="text-sm font-semibold">{label}</p>
            <span className="text-2xl font-black flex-shrink-0">{count}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
