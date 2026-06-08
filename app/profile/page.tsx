"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { opportunities } from "@/lib/data";
import { useApplications, Application } from "@/hooks/useApplications";
import { useProfile, UserProfile } from "@/hooks/useProfile";
import { useSaved } from "@/hooks/useSaved";
import OpportunityCard from "@/components/OpportunityCard";

const STATUS_LABELS: Record<Application["status"], string> = {
  pending: "На розгляді",
  reviewing: "Розглядається",
  accepted: "Прийнята",
  rejected: "Відхилена",
};

const STATUS_STYLES: Record<Application["status"], string> = {
  pending: "bg-yellow-100 text-yellow-700",
  reviewing: "bg-blue-100 text-blue-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
};

const DEGREES = ["Бакалавр", "Магістр", "Аспірант / PhD", "Спеціаліст", "Незакінчена вища", "Інше"];
const LANGUAGES = ["Українська", "Англійська", "Німецька", "Французька", "Польська", "Іспанська", "Іспанська", "Португальська", "Інша"];
const COUNTRIES = ["Україна", "Польща", "Німеччина", "США", "Велика Британія", "Чехія", "Словаччина", "Австрія", "Нідерланди", "Швеція", "Норвегія", "Фінляндія", "Канада", "Інша"];

type Tab = "applications" | "saved" | "profile";

export default function ProfilePage() {
  const { applications, ready: appsReady } = useApplications();
  const { profile, save, ready: profileReady } = useProfile();
  const { saved, ready: savedReady } = useSaved();

  const [tab, setTab] = useState<Tab>("applications");
  const [form, setForm] = useState<UserProfile>(profile);
  const [formDirty, setFormDirty] = useState(false);
  const [saved2, setSaved2] = useState(false);

  useEffect(() => {
    if (profileReady) setForm(profile);
  }, [profileReady, profile]);

  const setField = (field: keyof UserProfile, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormDirty(true);
    setSaved2(false);
  };

  const toggleLang = (lang: string) => {
    setField(
      "languages",
      form.languages.includes(lang)
        ? form.languages.filter((l) => l !== lang)
        : [...form.languages, lang]
    );
  };

  const handleSaveProfile = () => {
    save(form);
    setFormDirty(false);
    setSaved2(true);
  };

  const savedOpps = opportunities.filter((o) => saved.includes(o.slug));

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "applications", label: "Мої заявки", count: appsReady ? applications.length : 0 },
    { id: "saved", label: "Збережені", count: savedReady ? saved.length : 0 },
    { id: "profile", label: "Мій профіль" },
  ];

  const inputCls = "w-full px-4 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex items-start gap-5 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center flex-shrink-0">
          <span className="text-2xl font-extrabold text-primary">
            {profileReady && profile.firstName ? profile.firstName[0].toUpperCase() : "?"}
          </span>
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-foreground">
            {profileReady && (profile.firstName || profile.lastName)
              ? `${profile.firstName} ${profile.lastName}`.trim()
              : "Мій профіль"}
          </h1>
          {profileReady && profile.email && (
            <p className="text-sm text-muted mt-0.5">{profile.email}</p>
          )}
          {profileReady && profile.institution && (
            <p className="text-xs text-muted mt-0.5">{profile.institution} · {profile.degree}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted-bg p-1.5 rounded-2xl w-fit mb-8">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === t.id
                ? "bg-white text-foreground shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${tab === t.id ? "bg-primary text-white" : "bg-border text-muted"}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Applications tab ── */}
      {tab === "applications" && (
        <div>
          {!appsReady ? (
            <div className="flex flex-col gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 bg-muted-bg rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📋</div>
              <h2 className="text-lg font-bold text-foreground mb-2">Ще немає заявок</h2>
              <p className="text-sm text-muted mb-6">Знайди цікаві можливості та подай першу заявку</p>
              <Link href="/opportunities" className="px-6 py-3 bg-primary text-white rounded-2xl font-semibold text-sm hover:bg-primary-dark transition-all">
                Переглянути можливості
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {applications.map((app) => (
                <div key={app.id} className="bg-white rounded-2xl border border-border p-5 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/opportunities/${app.opportunitySlug}`}
                          className="font-semibold text-foreground text-sm hover:text-primary transition-colors truncate"
                        >
                          {app.opportunityTitle}
                        </Link>
                      </div>
                      <p className="text-xs text-muted mb-2">{app.org}</p>
                      <div className="flex items-center gap-3 text-xs text-muted">
                        <span>Дедлайн: {app.deadline}</span>
                        <span>·</span>
                        <span>
                          Подано:{" "}
                          {new Date(app.submittedAt).toLocaleDateString("uk-UA", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_STYLES[app.status]}`}>
                      {STATUS_LABELS[app.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Saved tab ── */}
      {tab === "saved" && (
        <div>
          {!savedReady ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-44 bg-muted-bg rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : savedOpps.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🔖</div>
              <h2 className="text-lg font-bold text-foreground mb-2">Нічого не збережено</h2>
              <p className="text-sm text-muted mb-6">Натисни серце ♥ на будь-якій можливості, щоб зберегти</p>
              <Link href="/opportunities" className="px-6 py-3 bg-primary text-white rounded-2xl font-semibold text-sm hover:bg-primary-dark transition-all">
                Переглянути можливості
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedOpps.map((opp) => (
                <OpportunityCard key={opp.slug} opp={opp} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Profile tab ── */}
      {tab === "profile" && (
        <div className="bg-white rounded-2xl border border-border p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-foreground">Персональні дані</h2>
            {saved2 && (
              <div className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Збережено
              </div>
            )}
          </div>

          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Ім&apos;я</label>
                <input type="text" value={form.firstName} onChange={(e) => setField("firstName", e.target.value)} placeholder="Іванна" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Прізвище</label>
                <input type="text" value={form.lastName} onChange={(e) => setField("lastName", e.target.value)} placeholder="Шевченко" className={inputCls} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} placeholder="your@email.com" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Номер телефону</label>
              <input type="tel" value={form.phone} onChange={(e) => setField("phone", e.target.value)} placeholder="+380 50 123 4567" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Країна</label>
              <select value={form.country} onChange={(e) => setField("country", e.target.value)} className={inputCls}>
                <option value="">Оберіть країну...</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Заклад навчання</label>
              <input type="text" value={form.institution} onChange={(e) => setField("institution", e.target.value)} placeholder="Назва університету" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Ступінь освіти</label>
              <select value={form.degree} onChange={(e) => setField("degree", e.target.value)} className={inputCls}>
                <option value="">Оберіть...</option>
                {DEGREES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Мови</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLang(lang)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all duration-150 ${
                      form.languages.includes(lang)
                        ? "bg-primary text-white border-primary"
                        : "border-border text-muted hover:border-primary hover:text-primary bg-white"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Про себе</label>
              <textarea
                value={form.bio}
                onChange={(e) => setField("bio", e.target.value)}
                placeholder="Розкажи коротко про себе, свої цілі та інтереси..."
                rows={4}
                className={`${inputCls} resize-none leading-relaxed`}
              />
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveProfile}
                disabled={!formDirty}
                className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Зберегти зміни
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
