"use client";

import { useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useOrgApplications } from "@/hooks/useOrgApplications";
import { useOrgProjects } from "@/hooks/useOrgProjects";
import { useOrgSession } from "@/hooks/useOrgSession";

const STATUS_LABEL: Record<string, string> = { new: "Нова", reviewing: "Розглядається", selected: "Відібрано", rejected: "Відхилено" };
const STATUS_COLORS: Record<string, string> = { new: "#3B82F6", reviewing: "#F59E0B", selected: "#22C55E", rejected: "#F87171" };

function StatCard({ label, value, delta }: { label: string; value: number | string; delta?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">{label}</p>
      <p className="text-3xl font-black text-foreground">{value}</p>
      {delta && <p className="text-xs text-green-600 font-semibold mt-1">{delta}</p>}
    </div>
  );
}

interface TooltipEntry { dataKey: string; name?: string; value: number }
interface TooltipProps { active?: boolean; payload?: TooltipEntry[]; label?: string }
const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-border rounded-2xl shadow-xl p-3 text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-muted">{p.name ?? p.dataKey}: <span className="font-semibold text-foreground">{p.value}</span></p>
      ))}
    </div>
  );
};

function AnalyticsContent() {
  const { org } = useOrgSession();
  const { applications, ready } = useOrgApplications(org?.id);
  const { projects } = useOrgProjects(org?.id);

  // Applications over last 30 days
  const timelineData = useMemo(() => {
    const today = new Date();
    const days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() - (29 - i));
      return d.toISOString().split("T")[0];
    });
    return days.map((day) => ({
      date: new Date(day).toLocaleDateString("uk-UA", { day: "numeric", month: "short" }),
      count: applications.filter((a) => a.submittedAt.split("T")[0] === day).length,
    }));
  }, [applications]);

  // By country
  const countryData = useMemo(() => {
    const counts: Record<string, number> = {};
    applications.forEach((a) => { counts[a.country] = (counts[a.country] ?? 0) + 1; });
    return Object.entries(counts)
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [applications]);

  // By status
  const statusData = useMemo(() => {
    const counts: Record<string, number> = { new: 0, reviewing: 0, selected: 0, rejected: 0 };
    applications.forEach((a) => { counts[a.status] = (counts[a.status] ?? 0) + 1; });
    return Object.entries(counts).map(([status, count]) => ({
      name: STATUS_LABEL[status],
      count,
      color: STATUS_COLORS[status],
    }));
  }, [applications]);

  // Project performance
  const projectStats = useMemo(() => {
    return projects.map((p) => {
      const apps = applications.filter((a) => a.projectId === p.id);
      return {
        id: p.id,
        title: p.title,
        total: apps.length,
        selected: apps.filter((a) => a.status === "selected").length,
        reviewing: apps.filter((a) => a.status === "reviewing").length,
        convRate: apps.length > 0 ? Math.round((apps.filter((a) => a.status === "selected").length / apps.length) * 100) : 0,
      };
    }).sort((a, b) => b.total - a.total);
  }, [applications, projects]);

  // Top institutions
  const topInstitutions = useMemo(() => {
    const counts: Record<string, number> = {};
    applications.forEach((a) => { counts[a.institution] = (counts[a.institution] ?? 0) + 1; });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [applications]);

  const totalSelected = applications.filter((a) => a.status === "selected").length;
  const totalReviewing = applications.filter((a) => a.status === "reviewing").length;
  const convRate = applications.length > 0 ? Math.round((totalSelected / applications.length) * 100) : 0;
  const last7 = applications.filter((a) => {
    const d = new Date(a.submittedAt);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    return d >= cutoff;
  }).length;

  if (!ready) {
    return <div className="flex items-center justify-center min-h-[40vh]"><div className="w-7 h-7 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="page-transition space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-foreground">Аналітика</h1>
        <p className="text-sm text-muted mt-0.5">Статистика та показники ваших проєктів</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Всього заявок" value={applications.length} delta={last7 > 0 ? `+${last7} за 7 днів` : undefined} />
        <StatCard label="На розгляді" value={totalReviewing} />
        <StatCard label="Відібрано" value={totalSelected} />
        <StatCard label="Конверсія" value={`${convRate}%`} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Timeline — 2/3 width */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-foreground">Заявки за останні 30 днів</h2>
              <p className="text-xs text-muted mt-0.5">{applications.length} заявок всього</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={timelineData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#6B7280" }} tickLine={false} axisLine={false} interval={6} />
              <YAxis tick={{ fontSize: 10, fill: "#6B7280" }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="count"
                name="Заявки"
                stroke="#3B4FE8"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status donut-style bar */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <h2 className="text-sm font-bold text-foreground mb-4">Розподіл за статусом</h2>
          <div className="space-y-3">
            {statusData.map((s) => (
              <div key={s.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-foreground">{s.name}</span>
                  <span className="text-xs font-bold text-foreground">{s.count}</span>
                </div>
                <div className="h-2 bg-muted-bg rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: applications.length > 0 ? `${(s.count / applications.length) * 100}%` : "0%",
                      background: s.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          {/* Total */}
          <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted font-medium">Конверсія у відібрані</span>
            <span className="text-sm font-black text-green-600">{convRate}%</span>
          </div>
        </div>
      </div>

      {/* By country */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <h2 className="text-sm font-bold text-foreground mb-1">Заявки за країнами</h2>
        <p className="text-xs text-muted mb-5">Топ-8 країн за кількістю заявок</p>
        {countryData.length === 0 ? (
          <p className="text-sm text-muted text-center py-8">Немає даних</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={countryData} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#6B7280" }} tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="country" tick={{ fontSize: 11, fill: "#0F0F0F" }} tickLine={false} axisLine={false} width={56} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" name="Заявки" fill="#3B4FE8" radius={[0, 6, 6, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Project performance table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-bold text-foreground">Ефективність проєктів</h2>
        </div>
        {projectStats.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm text-muted">Немає проєктів з заявками</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-muted-bg">
              <tr>
                {["Проєкт", "Заявок", "На розгляді", "Відібрано", "Конверсія"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold text-muted uppercase tracking-wider first:font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {projectStats.map((p, i) => (
                <tr key={p.id} className={`border-t border-border ${i % 2 === 1 ? "bg-muted-bg/30" : ""} hover:bg-primary-light/40 transition-colors`}>
                  <td className="px-5 py-3.5">
                    <a href={`/dashboard/projects/${p.id}`} className="text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
                      {p.title}
                    </a>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-bold text-foreground">{p.total}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-semibold bg-amber-50 text-amber-600 px-2.5 py-1 rounded-full">{p.reviewing}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs font-semibold bg-green-50 text-green-700 px-2.5 py-1 rounded-full">{p.selected}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 bg-muted-bg rounded-full overflow-hidden">
                        <div className="h-full bg-green-400 rounded-full" style={{ width: `${p.convRate}%` }} />
                      </div>
                      <span className="text-xs font-bold text-foreground">{p.convRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Top institutions */}
      <div className="bg-white rounded-2xl border border-border p-5">
        <h2 className="text-sm font-bold text-foreground mb-4">Топ університети та заклади</h2>
        {topInstitutions.length === 0 ? (
          <p className="text-sm text-muted text-center py-6">Немає даних</p>
        ) : (
          <div className="space-y-3">
            {topInstitutions.map((inst, i) => (
              <div key={inst.name} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-muted-bg text-muted text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground truncate">{inst.name}</span>
                    <span className="text-xs font-bold text-foreground ml-2 flex-shrink-0">{inst.count}</span>
                  </div>
                  <div className="h-1.5 bg-muted-bg rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(inst.count / (topInstitutions[0]?.count ?? 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return <AnalyticsContent />;
}
