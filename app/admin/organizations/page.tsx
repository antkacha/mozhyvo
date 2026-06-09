"use client";

import { useState } from "react";

type OrgStatus = "verified" | "pending" | "rejected" | "blocked";

interface DemoOrg {
  id: string;
  name: string;
  email: string;
  country: string;
  type: string;
  status: OrgStatus;
  opportunities: number;
  applications: number;
  submittedAt: string;
}

const DEMO_ORGS: DemoOrg[] = [
  { id: "1", name: "Erasmus+ UA",         email: "info@erasmus.eu",       country: "Бельгія",    type: "Міжнародна",   status: "verified", opportunities: 4, applications: 234, submittedAt: "2026-01-10" },
  { id: "2", name: "DAAD Ukraine",         email: "ukraine@daad.de",       country: "Німеччина",  type: "Освітня",      status: "verified", opportunities: 3, applications: 127, submittedAt: "2026-01-15" },
  { id: "3", name: "Youth Exchange Fund",  email: "apply@yef.org",         country: "Польща",     type: "Молодіжна",    status: "pending",  opportunities: 0, applications: 0,   submittedAt: "2026-05-20" },
  { id: "4", name: "Grants for Ukraine",   email: "hello@g4u.com",         country: "Україна",    type: "Грантова",     status: "pending",  opportunities: 0, applications: 0,   submittedAt: "2026-05-28" },
  { id: "5", name: "Fake NGO",             email: "spam@fake.net",         country: "Невідомо",   type: "Інша",         status: "rejected", opportunities: 0, applications: 0,   submittedAt: "2026-04-01" },
  { id: "6", name: "Visegrad Fund",        email: "info@visegradfund.org", country: "Угорщина",   type: "Освітня",      status: "verified", opportunities: 2, applications: 89,  submittedAt: "2025-12-05" },
  { id: "7", name: "Asia Pacific Youth",   email: "youth@apy.net",         country: "Японія",     type: "Міжнародна",   status: "pending",  opportunities: 0, applications: 0,   submittedAt: "2026-06-01" },
];

const STATUS_MAP: Record<OrgStatus, { label: string; cls: string }> = {
  verified: { label: "Верифікована", cls: "bg-green-50 text-green-700" },
  pending:  { label: "На розгляді",  cls: "bg-amber-50 text-amber-600" },
  rejected: { label: "Відхилено",    cls: "bg-red-50 text-red-500" },
  blocked:  { label: "Заблоковано",  cls: "bg-gray-100 text-gray-500" },
};

export default function AdminOrganizationsPage() {
  const [orgs, setOrgs] = useState<DemoOrg[]>(DEMO_ORGS);
  const [statusFilter, setStatusFilter] = useState<"all" | OrgStatus>("all");
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const filtered = statusFilter === "all" ? orgs : orgs.filter((o) => o.status === statusFilter);
  const pending = orgs.filter((o) => o.status === "pending");

  function setStatus(id: string, status: OrgStatus) {
    setOrgs((prev) => prev.map((o) => o.id === id ? { ...o, status } : o));
  }

  function handleReject(id: string) {
    setStatus(id, "rejected");
    setRejectTarget(null);
    setRejectReason("");
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground">Організації</h1>
          <p className="text-sm text-muted mt-0.5">{orgs.length} всього · {pending.length} на розгляді</p>
        </div>
      </div>

      {/* Pending banner */}
      {pending.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-amber-700">{pending.length} організацій чекають верифікації</p>
            <p className="text-xs text-amber-600">Перевірте документи та підтвердьте або відхиліть</p>
          </div>
          <button onClick={() => setStatusFilter("pending")}
            className="px-4 py-2 bg-amber-500 text-white text-xs font-semibold rounded-xl hover:bg-amber-600 transition-all flex-shrink-0">
            Переглянути
          </button>
        </div>
      )}

      {/* Status tabs */}
      <div className="flex gap-1 bg-muted-bg rounded-2xl p-1">
        {(["all", "verified", "pending", "rejected", "blocked"] as const).map((s) => {
          const count = s === "all" ? orgs.length : orgs.filter((o) => o.status === s).length;
          return (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`flex-1 px-2 py-2 rounded-xl text-xs font-semibold transition-all ${statusFilter === s ? "bg-white text-foreground shadow-sm" : "text-muted hover:text-foreground"}`}>
              {s === "all" ? "Всі" : STATUS_MAP[s].label} ({count})
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted-bg/50">
                <th className="text-left text-xs font-semibold text-muted px-5 py-3">Назва</th>
                <th className="text-left text-xs font-semibold text-muted px-5 py-3 hidden md:table-cell">Тип / Країна</th>
                <th className="text-left text-xs font-semibold text-muted px-5 py-3 hidden sm:table-cell">Активність</th>
                <th className="text-left text-xs font-semibold text-muted px-5 py-3">Статус</th>
                <th className="text-left text-xs font-semibold text-muted px-5 py-3">Дії</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((org) => (
                <tr key={org.id} className="border-b border-border/50 last:border-0 hover:bg-muted-bg/20 transition-colors">
                  <td className="px-5 py-4">
                    <p className="text-sm font-bold text-foreground">{org.name}</p>
                    <p className="text-xs text-muted">{org.email}</p>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <p className="text-xs text-foreground">{org.type}</p>
                    <p className="text-xs text-muted">{org.country}</p>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <p className="text-xs text-foreground">{org.opportunities} програм</p>
                    <p className="text-xs text-muted">{org.applications} заявок</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_MAP[org.status].cls}`}>
                      {STATUS_MAP[org.status].label}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {org.status === "pending" && (
                        <>
                          <button onClick={() => setStatus(org.id, "verified")}
                            className="px-3 py-1.5 text-xs font-semibold bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all">
                            Верифікувати
                          </button>
                          <button onClick={() => setRejectTarget(org.id)}
                            className="px-3 py-1.5 text-xs font-semibold border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-all">
                            Відхилити
                          </button>
                        </>
                      )}
                      {org.status === "verified" && (
                        <button onClick={() => setStatus(org.id, "blocked")}
                          className="px-3 py-1.5 text-xs font-semibold border border-gray-200 text-muted rounded-lg hover:bg-muted-bg transition-all">
                          Блок
                        </button>
                      )}
                      {(org.status === "rejected" || org.status === "blocked") && (
                        <button onClick={() => setStatus(org.id, "verified")}
                          className="px-3 py-1.5 text-xs font-semibold border border-green-200 text-green-600 rounded-lg hover:bg-green-50 transition-all">
                          Розблок
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject reason modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setRejectTarget(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold text-foreground mb-4">Причина відхилення</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4} placeholder="Вкажіть причину відхилення..."
              className="w-full px-3.5 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setRejectTarget(null)}
                className="px-4 py-2 border border-border rounded-xl text-sm text-muted hover:bg-muted-bg transition-all">
                Скасувати
              </button>
              <button onClick={() => handleReject(rejectTarget)}
                disabled={!rejectReason.trim()}
                className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-40 transition-all">
                Відхилити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
