"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useOrgSession } from "@/hooks/useOrgSession";
import { useApplications, Application } from "@/hooks/useApplications";
import { DEMO_ORG_EMAIL } from "@/lib/demo-org";

// ── Coordinator mock data (original dashboard) ─────────────────────
const MOCK_PROGRAMS = [
  { id: "erasmus-plus", title: "Erasmus+ Youth Exchange", org: "European Commission", deadline: "2025-06-30", deadlineDisplay: "30 черв 2025", country: "🇪🇺 Євросоюз", type: "Обмін" },
  { id: "daad-research", title: "DAAD Research Grant", org: "DAAD", deadline: "2025-09-15", deadlineDisplay: "15 вер 2025", country: "🇩🇪 Німеччина", type: "Стипендія" },
  { id: "hack4good", title: "Hack4Good 2025", org: "NGO TechForGood", deadline: "2025-07-20", deadlineDisplay: "20 лип 2025", country: "🌍 Онлайн", type: "Хакатон" },
];

const STATUS_LABELS: Record<Application["status"], string> = { pending: "Нова", reviewing: "Розглядається", accepted: "Прийнята", rejected: "Відхилена" };
const STATUS_STYLES: Record<Application["status"], string> = { pending: "bg-yellow-100 text-yellow-700", reviewing: "bg-blue-100 text-blue-700", accepted: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-600" };

const ORG_TYPES = ["НГО / Громадська організація", "Університет / Освітня установа", "Міжнародний фонд / Донор", "Компанія / Стартап", "Державна установа", "Інше"];
const COUNTRIES = ["Україна", "Польща", "Германія", "США", "Велика Британія", "Франція", "Нідерланди", "Швеція", "Норвегія", "Канада", "Австралія", "Інша"];

// ── Org Dashboard ──────────────────────────────────────────────────
function OrgDashboard() {
  const { org, update, logout } = useOrgSession();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<"profile" | "opportunities" | "analytics">("profile");
  const [editing, setEditing] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(org?.name ?? "");
  const [editType, setEditType] = useState(org?.type ?? "");
  const [editCountry, setEditCountry] = useState(org?.country ?? "");
  const [editCity, setEditCity] = useState(org?.city ?? "");
  const [editWebsite, setEditWebsite] = useState(org?.website ?? "");
  const [editEmail, setEditEmail] = useState(org?.contactEmail ?? "");
  const [editDesc, setEditDesc] = useState(org?.description ?? "");
  const [saved, setSaved] = useState(false);

  if (!org) return null;

  const isVerified = org.status === "verified";
  const isPending = org.status === "pending";

  const initials = org.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => update({ logo: ev.target?.result as string });
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    update({
      name: editName,
      type: editType,
      country: editCountry,
      city: editCity,
      website: editWebsite,
      contactEmail: editEmail,
      description: editDesc,
    });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const startEdit = () => {
    setEditName(org.name);
    setEditType(org.type);
    setEditCountry(org.country);
    setEditCity(org.city);
    setEditWebsite(org.website);
    setEditEmail(org.contactEmail);
    setEditDesc(org.description);
    setEditing(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* ── Org header card ── */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6 mb-6">
        <div className="flex items-start gap-5">
          {/* Logo */}
          <div className="relative flex-shrink-0">
            <div
              onClick={() => logoInputRef.current?.click()}
              className="w-16 h-16 rounded-2xl overflow-hidden bg-primary-light flex items-center justify-center cursor-pointer border-2 border-dashed border-primary/20 hover:border-primary transition-all group"
              title="Натисни щоб змінити логотип"
            >
              {org.logo ? (
                <Image src={org.logo} alt={org.name} width={64} height={64} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-black text-primary group-hover:scale-110 transition-transform">{initials}</span>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-black text-gray-900">{org.name}</h1>
                  {isVerified && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                      ✅ Верифіковано
                    </span>
                  )}
                  {isPending && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-700">
                      ⏳ Очікує верифікації
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted">{org.type}</p>
                <p className="text-xs text-muted mt-1">📍 {org.city}, {org.country}</p>
              </div>
              <button
                onClick={logout}
                className="text-xs text-muted hover:text-red-500 transition-colors font-medium flex-shrink-0"
              >
                Вийти
              </button>
            </div>
          </div>
        </div>

        {/* Pending verification banner */}
        {isPending && (
          <div className="mt-5 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">⏳</span>
              <div>
                <p className="text-sm font-semibold text-yellow-800 mb-1">Очікує верифікації командою Моживо</p>
                <p className="text-xs text-yellow-700 leading-relaxed">
                  Зазвичай це займає 1–3 робочі дні. Після верифікації ти зможеш публікувати можливості та бачити аналітику.
                </p>
                <Link href="/contacts" className="inline-flex items-center gap-1 text-xs font-semibold text-yellow-800 hover:underline mt-2">
                  Є питання? Напишіть нам →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Dev toggle — demo account only */}
        {org.contactEmail === DEMO_ORG_EMAIL && (
          <div className="mt-4 flex items-center gap-3 p-3 bg-gray-50 border border-dashed border-gray-300 rounded-xl">
            <span className="text-xs text-gray-400 font-mono">🛠 demo</span>
            <span className="text-xs text-gray-500">Симулювати верифікацію:</span>
            <button
              onClick={() => update({ status: "pending" })}
              className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-all ${org.status === "pending" ? "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-400" : "bg-gray-100 text-gray-500 hover:bg-yellow-50"}`}
            >
              ⏳ Pending
            </button>
            <button
              onClick={() => update({ status: "verified" })}
              className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-all ${org.status === "verified" ? "bg-green-100 text-green-700 ring-1 ring-green-400" : "bg-gray-100 text-gray-500 hover:bg-green-50"}`}
            >
              ✅ Verified
            </button>
          </div>
        )}

        {saved && (
          <div className="mt-4 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            Профіль збережено
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-muted-bg p-1.5 rounded-2xl w-fit mb-6">
        {([
          { id: "profile" as const, label: "Профіль", icon: "👤", locked: false },
          { id: "opportunities" as const, label: "Можливості", icon: "📋", locked: isPending },
          { id: "analytics" as const, label: "Аналітика", icon: "📊", locked: isPending },
        ]).map((t) => (
          <button
            key={t.id}
            onClick={() => !t.locked && setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === t.id
                ? "bg-white text-foreground shadow-sm"
                : t.locked
                ? "text-muted/50 cursor-not-allowed"
                : "text-muted hover:text-foreground"
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
            {t.locked && <span className="text-xs">🔒</span>}
          </button>
        ))}
      </div>

      {/* ── Tab: Profile ── */}
      {tab === "profile" && (
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Інформація про організацію</h2>
            {!editing ? (
              <button onClick={startEdit} className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Редагувати
              </button>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => setEditing(false)} className="text-sm font-medium text-muted hover:text-foreground transition-colors px-3 py-1.5 rounded-lg">
                  Скасувати
                </button>
                <button onClick={handleSave} className="text-sm font-semibold text-white bg-primary hover:bg-primary-dark transition-colors px-4 py-1.5 rounded-lg">
                  Зберегти
                </button>
              </div>
            )}
          </div>

          {!editing ? (
            <div className="flex flex-col divide-y divide-gray-100">
              {[
                { label: "Назва", value: org.name },
                { label: "Тип", value: org.type },
                { label: "Країна та місто", value: `${org.city}, ${org.country}` },
                { label: "Сайт", value: org.website || "—", isLink: !!org.website },
                { label: "Контактний email", value: org.contactEmail },
                { label: "Опис", value: org.description, wide: true },
              ].map((row) => (
                <div key={row.label} className={`py-4 ${row.wide ? "flex flex-col gap-1" : "flex items-start justify-between gap-4"}`}>
                  <span className="text-sm text-muted flex-shrink-0">{row.label}</span>
                  {row.isLink ? (
                    <a href={row.value} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary hover:underline text-right">
                      {row.value}
                    </a>
                  ) : (
                    <span className={`text-sm font-medium text-gray-900 ${row.wide ? "leading-relaxed text-gray-600" : "text-right"}`}>
                      {row.value}
                    </span>
                  )}
                </div>
              ))}
              <div className="py-4 flex items-center justify-between gap-4">
                <span className="text-sm text-muted">Статус</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isVerified ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {isVerified ? "✅ Верифіковано" : "⏳ Очікує верифікації"}
                </span>
              </div>
              <div className="py-4 flex items-center justify-between gap-4">
                <span className="text-sm text-muted">Дата реєстрації</span>
                <span className="text-sm font-medium text-gray-900">{org.createdAt}</span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {[
                { label: "Назва організації", value: editName, onChange: setEditName, type: "text" as const, placeholder: "Офіційна назва" },
                { label: "Контактний email", value: editEmail, onChange: setEditEmail, type: "email" as const, placeholder: "email@org.com" },
                { label: "Сайт", value: editWebsite, onChange: setEditWebsite, type: "url" as const, placeholder: "https://your-org.org" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-sm font-medium text-foreground mb-1.5">{f.label}</label>
                  <input type={f.type} value={f.value} onChange={(e) => f.onChange(e.target.value)} placeholder={f.placeholder}
                    className="w-full px-4 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Тип організації</label>
                <select value={editType} onChange={(e) => setEditType(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white"
                >
                  {ORG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Країна</label>
                  <select value={editCountry} onChange={(e) => setEditCountry(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white"
                  >
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Місто</label>
                  <input type="text" value={editCity} onChange={(e) => setEditCity(e.target.value)} placeholder="Київ"
                    className="w-full px-4 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Опис організації</label>
                <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={4} placeholder="Коротко про місію та діяльність..."
                  className="w-full px-4 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white resize-none"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Opportunities (locked) ── */}
      {tab === "opportunities" && isPending && (
        <div className="bg-white rounded-2xl border border-border shadow-sm p-10 text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Доступно після верифікації</h3>
          <p className="text-sm text-muted max-w-sm mx-auto mb-5 leading-relaxed">
            Після того як команда Моживо перевірить вашу організацію, ви зможете публікувати можливості для молоді.
          </p>
          <div className="flex flex-col gap-2 max-w-xs mx-auto text-sm text-left mb-6">
            {["Публікувати необмежену кількість можливостей", "Редагувати та архівувати оголошення", "Переглядати заявки учасників"].map((item) => (
              <div key={item} className="flex items-center gap-2.5 text-muted">
                <span className="w-5 h-5 rounded-full bg-muted-bg flex items-center justify-center text-xs flex-shrink-0">✓</span>
                {item}
              </div>
            ))}
          </div>
          <Link href="/contacts" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all">
            Написати команді →
          </Link>
        </div>
      )}

      {/* ── Tab: Opportunities (verified — uses site data as mock) ── */}
      {tab === "opportunities" && isVerified && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">Мої можливості</h2>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Додати можливість
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-border shadow-sm p-10 text-center text-muted">
            <div className="text-4xl mb-3">📋</div>
            <p className="font-semibold text-foreground mb-1">Поки що немає опублікованих можливостей</p>
            <p className="text-sm">Натисни «Додати можливість» щоб опублікувати першу</p>
          </div>
        </div>
      )}

      {/* ── Tab: Analytics (locked) ── */}
      {tab === "analytics" && isPending && (
        <div className="bg-white rounded-2xl border border-border shadow-sm p-10 text-center">
          <div className="text-5xl mb-4">📊</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Аналітика доступна після верифікації</h3>
          <p className="text-sm text-muted max-w-sm mx-auto leading-relaxed">
            Після верифікації ви побачите скільки разів переглядали ваші можливості, скільки людей їх зберегли та подали заявку.
          </p>
        </div>
      )}

      {/* ── Tab: Analytics (verified) ── */}
      {tab === "analytics" && isVerified && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Переглядів", value: "—", icon: "👁️" },
            { label: "Збережено", value: "—", icon: "🔖" },
            { label: "Заявок", value: "—", icon: "📩" },
            { label: "Можливостей", value: "0", icon: "📋" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-border p-5 text-center shadow-sm">
              <p className="text-2xl mb-1">{s.icon}</p>
              <p className="text-3xl font-extrabold text-primary">{s.value}</p>
              <p className="text-xs text-muted mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Coordinator Dashboard (original) ──────────────────────────────
function CoordinatorDashboard() {
  const { applications } = useApplications();
  const [tab, setTab] = useState<"programs" | "applications" | "archive">("programs");
  const [filterStatus, setFilterStatus] = useState<Application["status"] | "all">("all");
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [filterProgram, setFilterProgram] = useState<string>("all");

  const activeApplications = applications.filter((a) => a.status !== "rejected");
  const archivedApplications = applications.filter((a) => a.status === "rejected");
  const filteredApps = (tab === "archive" ? archivedApplications : activeApplications).filter((a) => {
    if (filterStatus !== "all" && a.status !== filterStatus) return false;
    if (filterProgram !== "all" && a.opportunitySlug !== filterProgram) return false;
    return true;
  });
  const programsWithCounts = MOCK_PROGRAMS.map((p) => ({
    ...p,
    count: applications.filter((a) => a.opportunitySlug === p.id).length,
  }));
  const tabs = [
    { id: "programs" as const, label: "Мої програми", count: MOCK_PROGRAMS.length },
    { id: "applications" as const, label: "Заявки", count: activeApplications.length },
    { id: "archive" as const, label: "Архів", count: archivedApplications.length },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground mb-1">Панель координатора</h1>
          <p className="text-sm text-muted">Керуй програмами та заявками учасників</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Додати програму
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Програм", value: MOCK_PROGRAMS.length },
          { label: "Всього заявок", value: applications.length },
          { label: "На розгляді", value: applications.filter((a) => a.status === "pending" || a.status === "reviewing").length },
          { label: "Прийнятих", value: applications.filter((a) => a.status === "accepted").length },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-border p-5 text-center shadow-sm">
            <p className="text-3xl font-extrabold text-primary">{s.value}</p>
            <p className="text-xs text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-1 bg-muted-bg p-1.5 rounded-2xl w-fit mb-8">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t.id ? "bg-white text-foreground shadow-sm" : "text-muted hover:text-foreground"}`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${tab === t.id ? "bg-primary text-white" : "bg-border text-muted"}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>
      {tab === "programs" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {programsWithCounts.map((prog) => (
            <div key={prog.id} className="bg-white rounded-2xl border border-border p-6 shadow-sm flex flex-col gap-4 hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-3">
                <span className="text-xs font-semibold text-primary bg-primary-light px-2.5 py-1 rounded-full">{prog.type}</span>
                <button className="text-muted hover:text-foreground transition-colors p-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">{prog.org}</p>
                <p className="font-bold text-foreground text-sm leading-snug">{prog.title}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-muted">
                <span>{prog.country}</span><span>до {prog.deadlineDisplay}</span>
              </div>
              <div className="pt-3 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="font-bold text-foreground">{prog.count}</span>
                  <span className="text-muted">заявок</span>
                </div>
                <button onClick={() => { setFilterProgram(prog.id); setTab("applications"); }}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Переглянути →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {(tab === "applications" || tab === "archive") && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-3">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as Application["status"] | "all")}
              className="text-sm border border-border rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            >
              <option value="all">Усі статуси</option>
              <option value="pending">Нові</option>
              <option value="reviewing">Розглядаються</option>
              <option value="accepted">Прийняті</option>
              <option value="rejected">Відхилені</option>
            </select>
            <select value={filterProgram} onChange={(e) => setFilterProgram(e.target.value)}
              className="text-sm border border-border rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            >
              <option value="all">Усі програми</option>
              {MOCK_PROGRAMS.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>
          {filteredApps.length === 0 ? (
            <div className="text-center py-16 text-muted">
              <div className="text-4xl mb-3">📭</div>
              <p className="font-semibold text-foreground mb-1">Заявок ще немає</p>
              <p className="text-sm">Тут з&apos;являться заявки учасників після подачі</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredApps.map((app) => (
                <button key={app.id} onClick={() => setSelectedApp(app)}
                  className="text-left bg-white rounded-2xl border border-border p-5 hover:shadow-md hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <p className="font-semibold text-foreground text-sm">{app.firstName} {app.lastName}</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[app.status]}`}>{STATUS_LABELS[app.status]}</span>
                      </div>
                      <p className="text-xs text-muted truncate mb-1">{app.email}</p>
                      <p className="text-xs text-muted">{app.opportunityTitle}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs text-muted">{new Date(app.submittedAt).toLocaleDateString("uk-UA", { day: "numeric", month: "short" })}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedApp(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <div>
                <p className="font-bold text-foreground">{selectedApp.firstName} {selectedApp.lastName}</p>
                <p className="text-xs text-muted">{selectedApp.opportunityTitle}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[selectedApp.status]}`}>{STATUS_LABELS[selectedApp.status]}</span>
                <button onClick={() => setSelectedApp(null)} className="text-muted hover:text-foreground transition-colors p-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 flex flex-col gap-5">
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Контакти</p>
                <div className="grid grid-cols-2 gap-y-1.5 text-sm">
                  <span className="text-muted">Email</span><span className="font-medium">{selectedApp.email}</span>
                  <span className="text-muted">Телефон</span><span className="font-medium">{selectedApp.phone || "—"}</span>
                  <span className="text-muted">Країна</span><span className="font-medium">{selectedApp.country}</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Освіта</p>
                <div className="grid grid-cols-2 gap-y-1.5 text-sm">
                  <span className="text-muted">Заклад</span><span className="font-medium">{selectedApp.institution}</span>
                  <span className="text-muted">Ступінь</span><span className="font-medium">{selectedApp.degree}</span>
                  <span className="text-muted">Мови</span><span className="font-medium">{selectedApp.languages.join(", ")}</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-2">Мотиваційний лист</p>
                <p className="text-sm leading-relaxed bg-muted-bg rounded-xl p-4">{selectedApp.motivation}</p>
              </div>
              {(selectedApp.cvUrl || selectedApp.portfolioUrl) && (
                <div className="flex gap-3">
                  {selectedApp.cvUrl && <a href={selectedApp.cvUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/20 bg-primary-light px-3 py-2 rounded-xl hover:bg-primary/10 transition-all">📄 CV</a>}
                  {selectedApp.portfolioUrl && <a href={selectedApp.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/20 bg-primary-light px-3 py-2 rounded-xl hover:bg-primary/10 transition-all">🔗 Портфоліо</a>}
                </div>
              )}
              <p className="text-xs text-muted border-t border-border pt-3">Подано: {new Date(selectedApp.submittedAt).toLocaleString("uk-UA")}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Router ─────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { org, ready } = useOrgSession();

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (org) return <OrgDashboard />;
  return <CoordinatorDashboard />;
}
