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

const BRAND_PRESETS = [
  { color: "#3B4FE8", label: "Синій" },
  { color: "#10B981", label: "Зелений" },
  { color: "#F59E0B", label: "Жовтий" },
  { color: "#EF4444", label: "Червоний" },
  { color: "#8B5CF6", label: "Фіолетовий" },
  { color: "#EC4899", label: "Рожевий" },
  { color: "#0EA5E9", label: "Блакитний" },
  { color: "#14B8A6", label: "Бірюзовий" },
  { color: "#F97316", label: "Помаранчевий" },
  { color: "#1F2937", label: "Чорний" },
];

const SOCIAL_FIELDS: { key: keyof NonNullable<ReturnType<typeof useOrgSession>["org"]>["socials"]; label: string; placeholder: string }[] = [
  { key: "telegram",  label: "Telegram",   placeholder: "https://t.me/your_channel" },
  { key: "instagram", label: "Instagram",  placeholder: "https://instagram.com/yourorg" },
  { key: "facebook",  label: "Facebook",   placeholder: "https://facebook.com/yourorg" },
  { key: "linkedin",  label: "LinkedIn",   placeholder: "https://linkedin.com/company/yourorg" },
  { key: "twitter",   label: "Twitter / X", placeholder: "https://twitter.com/yourorg" },
  { key: "youtube",   label: "YouTube",    placeholder: "https://youtube.com/@yourorg" },
];

function ProfileContent() {
  const { org, update } = useOrgSession();
  const fileRef = useRef<HTMLInputElement>(null);
  const [focusInput, setFocusInput] = useState("");

  const [form, setForm] = useState({
    name:         org?.name ?? "",
    type:         org?.type ?? "",
    country:      org?.country ?? "",
    city:         org?.city ?? "",
    founded:      org?.founded ?? "",
    website:      org?.website ?? "",
    contactEmail: org?.contactEmail ?? "",
    description:  org?.description ?? "",
    mission:      org?.mission ?? "",
    logo:         org?.logo ?? (null as string | null),
    brandColor:   org?.brandColor ?? "#3B4FE8",
    focusAreas:   org?.focusAreas ?? ([] as string[]),
    socials:      org?.socials ?? {},
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  function set<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
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

  function addFocusArea() {
    const val = focusInput.trim();
    if (!val || form.focusAreas.includes(val)) return;
    set("focusAreas", [...form.focusAreas, val]);
    setFocusInput("");
  }

  function removeFocusArea(area: string) {
    set("focusAreas", form.focusAreas.filter((a) => a !== area));
  }

  function setSocial(key: string, value: string) {
    set("socials", { ...form.socials, [key]: value });
  }

  function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    update({
      name:         form.name.trim(),
      type:         form.type,
      country:      form.country.trim(),
      city:         form.city.trim(),
      founded:      form.founded.trim(),
      website:      form.website.trim(),
      contactEmail: form.contactEmail.trim(),
      description:  form.description.trim(),
      mission:      form.mission.trim(),
      logo:         form.logo,
      brandColor:   form.brandColor,
      focusAreas:   form.focusAreas,
      socials:      form.socials,
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

  const inp = "w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted/40";
  const lbl = "block text-sm font-medium text-foreground mb-1.5";
  const sec = "bg-white rounded-2xl border border-border p-6 flex flex-col gap-5";

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

        {/* ── Логотип ──────────────────────────────────────────── */}
        <section className={sec}>
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">Логотип</h2>
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0 border border-border"
              style={{ background: form.logo ? undefined : form.brandColor }}>
              {form.logo ? (
                <Image src={form.logo} alt="Logo" width={64} height={64} className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg font-black text-white">{initials}</span>
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

        {/* ── Зовнішній вигляд ─────────────────────────────────── */}
        <section className={sec}>
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">Зовнішній вигляд профілю</h2>
          <p className="text-xs text-muted -mt-2 leading-relaxed">
            Бренд-колір використовується для обкладинки вашого публічного профілю та фону логотипу.
          </p>

          {/* Preview strip */}
          <div className="rounded-xl overflow-hidden border border-border">
            <div className="h-14 w-full" style={{ background: `linear-gradient(135deg, ${form.brandColor} 0%, ${form.brandColor}cc 100%)` }} />
            <div className="px-4 py-3 bg-white flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-black -mt-7 border-2 border-white shadow"
                style={{ background: form.brandColor }}>
                {initials.slice(0, 2)}
              </div>
              <div className="mt-1">
                <p className="text-xs font-bold text-foreground leading-none">{form.name || "Назва організації"}</p>
                <p className="text-[10px] text-muted mt-0.5">Попередній перегляд обкладинки</p>
              </div>
            </div>
          </div>

          {/* Presets */}
          <div>
            <label className={lbl}>Бренд-колір</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {BRAND_PRESETS.map((p) => (
                <button
                  key={p.color}
                  onClick={() => set("brandColor", p.color)}
                  title={p.label}
                  className={`w-8 h-8 rounded-lg transition-all ${form.brandColor === p.color ? "ring-2 ring-offset-2 ring-primary scale-110" : "hover:scale-105"}`}
                  style={{ background: p.color }}
                />
              ))}
            </div>
            {/* Custom hex input */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg border border-border flex-shrink-0" style={{ background: form.brandColor }} />
              <input
                type="color"
                value={form.brandColor}
                onChange={(e) => set("brandColor", e.target.value)}
                className="w-9 h-9 rounded-lg border border-border cursor-pointer flex-shrink-0 p-0.5"
                title="Довільний колір"
              />
              <input
                type="text"
                value={form.brandColor}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) set("brandColor", v);
                }}
                className={`${inp} font-mono uppercase`}
                placeholder="#3B4FE8"
                maxLength={7}
              />
            </div>
          </div>
        </section>

        {/* ── Загальна інформація ───────────────────────────────── */}
        <section className={sec}>
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">Загальна інформація</h2>
          <div>
            <label className={lbl}>Назва організації *</label>
            <input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className={`${inp} ${!form.name.trim() ? "border-red-300" : ""}`}
            />
          </div>
          <div>
            <label className={lbl}>Тип організації</label>
            <select value={form.type} onChange={(e) => set("type", e.target.value)} className={inp}>
              <option value="">Оберіть тип...</option>
              {ORG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Країна</label>
              <input value={form.country} onChange={(e) => set("country", e.target.value)} placeholder="Україна" className={inp} />
            </div>
            <div>
              <label className={lbl}>Місто</label>
              <input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Київ" className={inp} />
            </div>
          </div>
          <div>
            <label className={lbl}>Рік заснування</label>
            <input value={form.founded} onChange={(e) => set("founded", e.target.value)} placeholder="2015" className={inp} maxLength={4} />
          </div>
          <div>
            <label className={lbl}>Опис організації</label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
              placeholder="Розкажіть про цілі та діяльність вашої організації..."
              className={`${inp} resize-none`}
            />
            <p className="text-xs text-muted mt-1">{form.description.length}/500 символів</p>
          </div>
          <div>
            <label className={lbl}>Місія <span className="text-muted font-normal">(необов&apos;язково)</span></label>
            <textarea
              value={form.mission}
              onChange={(e) => set("mission", e.target.value)}
              rows={2}
              placeholder="Стисло — заради чого існує ваша організація..."
              className={`${inp} resize-none`}
            />
            <p className="text-xs text-muted mt-1">Відображається на публічному профілі як цитата</p>
          </div>
        </section>

        {/* ── Напрями діяльності ────────────────────────────────── */}
        <section className={sec}>
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">Напрями діяльності</h2>
          <p className="text-xs text-muted -mt-2 leading-relaxed">
            Додайте теги, що описують чим займається ваша організація (наприклад: «Освіта», «Лідерство», «IT»).
          </p>
          <div className="flex flex-wrap gap-2 min-h-[36px]">
            {form.focusAreas.map((area) => (
              <span key={area} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary-light text-primary text-sm font-medium">
                {area}
                <button onClick={() => removeFocusArea(area)} className="ml-0.5 text-primary/50 hover:text-primary transition-colors leading-none">×</button>
              </span>
            ))}
            {form.focusAreas.length === 0 && (
              <p className="text-xs text-muted/50 self-center">Поки немає напрямів...</p>
            )}
          </div>
          <div className="flex gap-2">
            <input
              value={focusInput}
              onChange={(e) => setFocusInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFocusArea(); } }}
              placeholder="Введіть напрям і натисніть Enter"
              className={`${inp} flex-1`}
              maxLength={30}
            />
            <button
              onClick={addFocusArea}
              className="px-4 py-2.5 rounded-xl bg-primary-light text-primary text-sm font-semibold hover:bg-primary/10 transition-all flex-shrink-0"
            >
              + Додати
            </button>
          </div>
        </section>

        {/* ── Контакти ─────────────────────────────────────────── */}
        <section className={sec}>
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">Контактна інформація</h2>
          <div>
            <label className={lbl}>Вебсайт</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <input value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://your-org.com" className={`${inp} pl-9`} />
            </div>
          </div>
          <div>
            <label className={lbl}>Контактний email</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <input value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} type="email" className={`${inp} pl-9`} />
            </div>
          </div>
        </section>

        {/* ── Соціальні мережі ─────────────────────────────────── */}
        <section className={sec}>
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">Соціальні мережі</h2>
          <p className="text-xs text-muted -mt-2">Відображаються на вашому публічному профілі.</p>
          {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className={lbl}>{label}</label>
              <input
                value={(form.socials as Record<string, string>)[key] ?? ""}
                onChange={(e) => setSocial(key, e.target.value)}
                placeholder={placeholder}
                className={inp}
                type="url"
              />
            </div>
          ))}
        </section>

        {/* ── Save ─────────────────────────────────────────────── */}
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
