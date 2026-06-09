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
    logo: org?.logo ?? null as string | null,
  });

  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  function set(field: string, value: string | null) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set("logo", reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSave() {
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

  const initials = org.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const inputBase = "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-gray-900">Профіль організації</h1>
        <p className="text-sm text-gray-500 mt-0.5">Інформація, яку бачать учасники</p>
      </div>

      {/* Verification banner */}
      {org.status === "pending" && (
        <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-2xl mb-6">
          <span className="text-xl">⏳</span>
          <div>
            <p className="text-sm font-bold text-yellow-800">Профіль на верифікації</p>
            <p className="text-xs text-yellow-600 mt-0.5">Наша команда перевіряє вашу організацію. Це займає 1–3 робочих дні.</p>
          </div>
        </div>
      )}
      {org.status === "verified" && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl mb-6">
          <span className="text-xl">✅</span>
          <p className="text-sm font-bold text-green-800">Організацію верифіковано</p>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {/* Logo */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-5">Логотип</h2>
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-primary-light flex items-center justify-center flex-shrink-0 border border-gray-100">
              {form.logo ? (
                <Image src={form.logo} alt="Logo" width={80} height={80} className="w-full h-full object-cover" />
              ) : (
                <span className="text-xl font-black text-primary">{initials}</span>
              )}
            </div>
            <div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              <button
                onClick={() => fileRef.current?.click()}
                className="px-4 py-2.5 rounded-xl bg-primary-light text-primary text-sm font-semibold hover:bg-primary/10 transition-all"
              >
                Змінити лого
              </button>
              {form.logo && (
                <button onClick={() => set("logo", null)} className="ml-3 text-xs text-gray-400 hover:text-red-500 transition-all">
                  Видалити
                </button>
              )}
              <p className="text-xs text-gray-400 mt-2">PNG або JPG, рекомендовано 200×200 px</p>
            </div>
          </div>
        </section>

        {/* Basic info */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-5">Основна інформація</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className={labelClass}>Назва організації</label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} className={inputBase} />
            </div>
            <div>
              <label className={labelClass}>Тип організації</label>
              <select value={form.type} onChange={(e) => set("type", e.target.value)} className={inputBase}>
                <option value="">Оберіть тип</option>
                {ORG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Країна</label>
                <input value={form.country} onChange={(e) => set("country", e.target.value)} className={inputBase} />
              </div>
              <div>
                <label className={labelClass}>Місто</label>
                <input value={form.city} onChange={(e) => set("city", e.target.value)} className={inputBase} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Опис організації</label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={4}
                placeholder="Розкажіть, чим займається ваша організація..."
                className={`${inputBase} resize-none`}
              />
            </div>
          </div>
        </section>

        {/* Contacts */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-5">Контакти</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className={labelClass}>Вебсайт</label>
              <input
                value={form.website}
                onChange={(e) => set("website", e.target.value)}
                placeholder="https://your-org.com"
                className={inputBase}
              />
            </div>
            <div>
              <label className={labelClass}>Контактний email</label>
              <input
                value={form.contactEmail}
                onChange={(e) => set("contactEmail", e.target.value)}
                type="email"
                className={inputBase}
              />
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-8">
          {saved && <span className="text-xs text-green-600 font-semibold">✓ Профіль збережено</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm shadow-primary/25 disabled:opacity-50"
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
