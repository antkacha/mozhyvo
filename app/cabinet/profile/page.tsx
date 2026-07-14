"use client";

import { useState, useEffect } from "react";
import { useProfile } from "@/hooks/useProfile";
import { profileCompleteness } from "@/lib/types";
import type { UserProfile } from "@/lib/types";

const DEGREES = ["Аспірант", "Бакалавр", "Доктор наук", "Магістр", "Студент", "Інше"];
const INTEREST_OPTIONS = [
  "Стипендії", "Стажування", "Обміни", "Волонтерство", "Гранти", "Конференції",
  "Хакатони", "Конкурси", "Технології", "Бізнес", "Освіта", "Наука", "Мистецтво", "Спорт",
];

const lbl = "block text-sm font-medium text-foreground mb-1.5";
const inp = "w-full px-3.5 py-2.5 text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white transition-all";
const section = "bg-white rounded-2xl border border-border p-6 space-y-4";

export default function CabinetProfilePage() {
  const { profile, save, ready } = useProfile();
  const [form, setForm] = useState<UserProfile>(profile);
  const [saving, setSaving] = useState(false);
  const [saved, setSavedFlag] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [langInput, setLangInput] = useState("");

  useEffect(() => {
    if (ready) setForm(profile);
  }, [ready, profile]);

  function set<K extends keyof UserProfile>(field: K, value: UserProfile[K]) {
    setForm((p) => ({ ...p, [field]: value }));
    setSavedFlag(false);
  }

  function toggleInterest(interest: string) {
    const has = form.interests.includes(interest);
    set("interests", has ? form.interests.filter((i) => i !== interest) : [...form.interests, interest]);
  }

  function addLanguage() {
    const trimmed = langInput.trim();
    if (trimmed && !form.languages.includes(trimmed)) {
      set("languages", [...form.languages, trimmed]);
    }
    setLangInput("");
  }

  function removeLanguage(lang: string) {
    set("languages", form.languages.filter((l) => l !== lang));
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    const error = await save(form);
    setSaving(false);
    if (error) {
      setSaveError("Не вдалося зберегти. Спробуй ще раз.");
    } else {
      setSavedFlag(true);
      setTimeout(() => setSavedFlag(false), 3000);
    }
  }

  const completeness = profileCompleteness(form);

  if (!ready) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-7 h-7 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground">Мій профіль</h1>
          <p className="text-sm text-muted mt-0.5">Заповнений профіль = більше шансів</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-primary">{completeness}%</span>
          <p className="text-xs text-muted">заповнено</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted-bg rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${completeness}%` }} />
      </div>

      {/* Avatar placeholder */}
      <div className={section}>
        <h2 className="text-sm font-bold text-foreground">Фото профілю</h2>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center text-primary font-black text-2xl flex-shrink-0">
            {form.firstName ? form.firstName[0].toUpperCase() : "?"}
          </div>
          <div>
            <p className="text-sm text-foreground font-medium mb-1">Завантаження фото скоро буде доступне</p>
            <p className="text-xs text-muted">Зараз показується перша літера імені</p>
          </div>
        </div>
      </div>

      {/* Personal */}
      <div className={section}>
        <h2 className="text-sm font-bold text-foreground">Особисті дані</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={lbl}>Ім&apos;я</label>
            <input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} className={inp} />
          </div>
          <div>
            <label className={lbl}>Прізвище</label>
            <input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} className={inp} />
          </div>
          <div>
            <label className={lbl}>Email</label>
            <input value={form.email} disabled className={inp + " opacity-60 cursor-not-allowed"} />
          </div>
          <div>
            <label className={lbl}>Телефон</label>
            <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+380..." className={inp} />
          </div>
          <div>
            <label className={lbl}>Країна</label>
            <input value={form.country} onChange={(e) => set("country", e.target.value)} placeholder="Україна" className={inp} />
          </div>
          <div>
            <label className={lbl}>Місто</label>
            <input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Київ" className={inp} />
          </div>
          <div className="sm:col-span-2">
            <label className={lbl}>Про себе</label>
            <textarea value={form.bio} onChange={(e) => set("bio", e.target.value)} rows={3}
              placeholder="Кілька речень про тебе..." className={inp + " resize-none"} />
          </div>
        </div>
      </div>

      {/* Education */}
      <div className={section}>
        <h2 className="text-sm font-bold text-foreground">Освіта</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={lbl}>Університет / Заклад освіти</label>
            <input value={form.institution} onChange={(e) => set("institution", e.target.value)} className={inp} />
          </div>
          <div>
            <label className={lbl}>Ступінь</label>
            <select value={form.degree} onChange={(e) => set("degree", e.target.value)} className={inp}>
              <option value="">Оберіть...</option>
              {DEGREES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className={lbl}>Рік закінчення</label>
            <input value={form.graduationYear} onChange={(e) => set("graduationYear", e.target.value)}
              placeholder="2026" className={inp} />
          </div>
        </div>
      </div>

      {/* Languages */}
      <div className={section}>
        <h2 className="text-sm font-bold text-foreground">Мови</h2>
        <div className="flex gap-2">
          <input value={langInput} onChange={(e) => setLangInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLanguage())}
            placeholder="Англійська B2..." className={inp + " flex-1"} />
          <button onClick={addLanguage}
            className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all flex-shrink-0">
            +
          </button>
        </div>
        {form.languages.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {form.languages.map((lang) => (
              <span key={lang} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-light text-primary text-xs font-semibold rounded-full">
                {lang}
                <button onClick={() => removeLanguage(lang)} className="hover:text-primary-dark">×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Interests */}
      <div className={section}>
        <h2 className="text-sm font-bold text-foreground">Інтереси</h2>
        <p className="text-xs text-muted -mt-2">Оберіть теми, які тебе цікавлять — для персоналізованих рекомендацій</p>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((interest) => {
            const active = form.interests.includes(interest);
            return (
              <button key={interest} onClick={() => toggleInterest(interest)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  active ? "bg-primary text-white border-primary" : "bg-white text-muted border-border hover:border-primary hover:text-primary"
                }`}>
                {interest}
              </button>
            );
          })}
        </div>
      </div>

      {/* Social links */}
      <div className={section}>
        <h2 className="text-sm font-bold text-foreground">Соціальні мережі</h2>
        <div className="space-y-3">
          <div>
            <label className={lbl}>LinkedIn</label>
            <input value={form.linkedinUrl} onChange={(e) => set("linkedinUrl", e.target.value)}
              placeholder="https://linkedin.com/in/..." className={inp} />
          </div>
          <div>
            <label className={lbl}>Telegram</label>
            <input value={form.telegram} onChange={(e) => set("telegram", e.target.value)}
              placeholder="@username" className={inp} />
          </div>
          <div>
            <label className={lbl}>Посилання на CV</label>
            <input value={form.cvUrl} onChange={(e) => set("cvUrl", e.target.value)}
              placeholder="https://drive.google.com/..." className={inp} />
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="sticky bottom-4 flex items-center justify-end gap-3">
        {saveError && (
          <p className="text-sm font-medium text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-xl">
            {saveError}
          </p>
        )}
        <button onClick={handleSave} disabled={saving}
          className={`px-8 py-3 rounded-full font-semibold text-sm transition-all shadow-lg flex items-center gap-2 ${
            saved ? "bg-green-500 text-white" : "bg-primary text-white hover:bg-primary-dark shadow-primary/25"
          } disabled:opacity-60`}>
          {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {saved ? "✓ Збережено!" : saving ? "Зберігаємо..." : "Зберегти зміни"}
        </button>
      </div>
    </div>
  );
}
