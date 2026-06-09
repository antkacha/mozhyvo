"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useOrgSession } from "@/hooks/useOrgSession";
import OrgShell from "@/components/OrgShell";

const ORG_TYPES = [
  "НГО / Громадська організація",
  "Благодійний фонд",
  "Молодіжна організація",
  "Студентська організація",
  "Освітня установа",
  "Державна установа",
  "Міжнародна організація",
  "Бізнес / Приватна компанія",
  "Медіа / Видання",
  "Інше",
];

function ProfileContent() {
  const { org, update } = useOrgSession();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: org?.name ?? "",
    type: org?.type ?? "",
    country: org?.country ?? "",
    city: org?.city ?? "",
    website: org?.website ?? "",
    contactEmail: org?.contactEmail ?? "",
    description: org?.description ?? "",
    logo: org?.logo ?? (null as string | null),
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  function set(field: string, value: string | null) {
    setForm((p) => ({ ...p, [field]: value }));
    setSaved(false);
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Файл занадто великий. Максимальний розмір — 2 МБ.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => set("logo", reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    update({
      name: form.name.trim(),
      type: form.type,
      country: form.country.trim(),
      city: form.city.trim(),
      website: form.website.trim(),
      contactEmail: form.contactEmail.trim(),
      description: form.description.trim(),
      logo: form.logo,
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (!org) return null;

  const initials = org.name
    .split(" ")
    .filter((w) => w.length > 0)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const input = "w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted/40";
  const label = "block text-sm font-medium text-foreground mb-1.5";
  const section = "bg-white rounded-2xl border border-border p-6 flex flex-col gap-5";

  return (
    <div className="page-transition max-w-xl">
      <h1 className="text-2xl font-black text-foreground mb-7">Профіль організації</h1>

      {/* Status banner */}
      {org.status === "pending" && (
        <div className="flex items-start gap-3.5 p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-6">
          <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-amber-800">Верифікація в процесі</p>
            <p className="text-xs text-amber-600 mt-0.5 leading-relaxed">
              Наша команда перевіряє вашу організацію. Зазвичай це займає 1–3 робочих дні.
            </p>
          </div>
        </div>
      )}
      {org.status === "verified" && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl mb-6">
          <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-semibold text-green-800">Організацію верифіковано</p>
        </div>
      )}

      <div className="flex flex-col gap-5">
        {/* Logo */}
        <section className={section}>
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">Логотип</h2>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-primary-light flex items-center justify-center flex-shrink-0 border border-border">
              {form.logo ? (
                <Image src={form.logo} alt="Logo" width={64} height={64} className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-black text-primary">{initials}</span>
              )}
            </div>
            <div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              <div className="flex items-center gap-3">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-primary-light text-primary text-sm font-semibold hover:bg-primary/10 transition-all"
                >
                  Завантажити лого
                </button>
                {form.logo && (
                  <button onClick={() => set("logo", null)} className="text-xs text-muted hover:text-red-500 transition-colors">
                    Видалити
                  </button>
                )}
              </div>
              <p className="text-xs text-muted mt-2">PNG або JPG, до 2 МБ, рекомендовано 200×200 px</p>
            </div>
          </div>
        </section>

        {/* Загальна інформація */}
        <section className={section}>
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">Загальна інформація</h2>
          <div>
            <label className={label}>Назва організації *</label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={`${input} ${!form.name.trim() ? "border-red-300" : ""}`}
            />
          </div>
          <div>
            <label className={label}>Тип організації</label>
            <select value={form.type} onChange={(e) => set("type", e.target.value)} className={input}>
              <option value="">Оберіть тип...</option>
              {ORG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Країна</label>
              <input value={form.country} onChange={(e) => set("country", e.target.value)} placeholder="Україна" className={input} />
            </div>
            <div>
              <label className={label}>Місто</label>
              <input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Київ" className={input} />
            </div>
          </div>
          <div>
            <label className={label}>Опис організації</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
              placeholder="Розкажіть про цілі та діяльність вашої організації..."
              className={`${input} resize-none`}
            />
            <p className="text-xs text-muted mt-1">{form.description.length}/500 символів</p>
          </div>
        </section>

        {/* Контакти */}
        <section className={section}>
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">Контактна інформація</h2>
          <div>
            <label className={label}>Вебсайт</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <input
                value={form.website}
                onChange={(e) => set("website", e.target.value)}
                placeholder="https://your-org.com"
                className={`${input} pl-9`}
              />
            </div>
          </div>
          <div>
            <label className={label}>Контактний email</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <input
                value={form.contactEmail}
                onChange={(e) => set("contactEmail", e.target.value)}
                type="email"
                className={`${input} pl-9`}
              />
            </div>
          </div>
        </section>

        {/* Save */}
        <div className="flex items-center justify-end gap-3 pb-8">
          {saved && (
            <span className="flex items-center gap-1.5 text-xs text-green-600 font-semibold">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              Зміни збережено
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !form.name.trim()}
            className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm shadow-primary/20 disabled:opacity-50"
          >
            {saving ? "Зберігаємо..." : "Зберегти зміни"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return <OrgShell><ProfileContent /></OrgShell>;
}
