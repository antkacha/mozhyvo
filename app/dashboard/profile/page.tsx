"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { useOrgSession } from "@/hooks/useOrgSession";
import CoverPickerModal, { type CoverResult } from "@/components/CoverPickerModal";

const ORG_TYPES = [
  "Бізнес / Приватна компанія",
  "Благодійний фонд",
  "Державна установа",
  "Медіа / Видання",
  "Міжнародна організація",
  "Молодіжна організація",
  "НГО / Громадська організація",
  "Освітня установа",
  "Студентська організація",
  "Інше",
];

const BRAND_PRESETS = [
  "#3B4FE8", "#10B981", "#F59E0B", "#EF4444",
  "#8B5CF6", "#EC4899", "#0EA5E9", "#14B8A6",
  "#F97316", "#1F2937",
];

const SOCIAL_FIELDS = [
  { key: "telegram",  label: "Telegram",    placeholder: "https://t.me/your_channel" },
  { key: "instagram", label: "Instagram",   placeholder: "https://instagram.com/yourorg" },
  { key: "facebook",  label: "Facebook",    placeholder: "https://facebook.com/yourorg" },
  { key: "linkedin",  label: "LinkedIn",    placeholder: "https://linkedin.com/company/yourorg" },
  { key: "twitter",   label: "Twitter / X", placeholder: "https://twitter.com/yourorg" },
  { key: "youtube",   label: "YouTube",     placeholder: "https://youtube.com/@yourorg" },
] as const;

// ── YouTube helper ───────────────────────────────────────────────────
function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?\s]+)/);
  return m?.[1] ?? null;
}

// ── Cover display (shared in form + preview) ─────────────────────────
function CoverDisplay({
  coverImage,
  coverVideo,
  brandColor,
  height = "h-24",
  children,
}: {
  coverImage: string | null;
  coverVideo: string | null;
  brandColor: string;
  height?: string;
  children?: React.ReactNode;
}) {
  const ytId = coverVideo ? getYouTubeId(coverVideo) : null;

  return (
    <div className={`${height} w-full relative overflow-hidden`}>
      {/* Background */}
      {coverVideo ? (
        ytId ? (
          // YouTube thumbnail — arbitrary URL, can't use next/image without domain config
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`}
            alt="cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <video src={coverVideo} autoPlay muted loop playsInline className="w-full h-full object-cover" />
        )
      ) : coverImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={coverImage} alt="cover" className="w-full h-full object-cover" />
      ) : (
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${brandColor} 0%, ${brandColor}99 100%)` }}
        />
      )}

      {/* Dot overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Video badge */}
      {coverVideo && (
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-[10px] font-semibold">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
          Відео
        </div>
      )}

      {children}
    </div>
  );
}

// ── Live preview card ────────────────────────────────────────────────
function PreviewCard({
  form,
  initials,
  verified,
}: {
  form: {
    name: string; type: string; country: string; description: string;
    mission: string; logo: string | null; coverImage: string | null;
    coverVideo: string | null; brandColor: string; focusAreas: string[];
    socials: Record<string, string>;
  };
  initials: string;
  verified: boolean;
}) {
  const activeSocials = Object.values(form.socials).filter(Boolean).length;

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
      <CoverDisplay
        coverImage={form.coverImage}
        coverVideo={form.coverVideo}
        brandColor={form.brandColor}
        height="h-24"
      />

      <div className="px-5 pb-5">
        {/* Logo overlapping cover */}
        <div className="flex items-end justify-between -mt-7 mb-3">
          <div
            className="w-14 h-14 rounded-xl border-4 border-white shadow-md flex items-center justify-center text-white font-black text-sm overflow-hidden flex-shrink-0"
            style={{ background: form.logo ? undefined : form.brandColor }}
          >
            {form.logo ? (
              <Image src={form.logo} alt="logo" width={56} height={56} className="w-full h-full object-cover" />
            ) : (
              <span>{initials.slice(0, 2)}</span>
            )}
          </div>
          {verified && (
            <span className="mb-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-semibold border border-blue-100">
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Верифіковано
            </span>
          )}
        </div>

        <p className="font-black text-foreground text-base leading-tight mb-0.5">
          {form.name || <span className="text-muted/40">Назва організації</span>}
        </p>
        <p className="text-xs text-muted mb-3">
          {[form.type, form.country].filter(Boolean).join(" · ") || "Тип · Країна"}
        </p>

        {form.description ? (
          <p className="text-xs text-muted leading-relaxed line-clamp-3 mb-3">{form.description}</p>
        ) : (
          <p className="text-xs text-muted/30 mb-3">Опис організації з&apos;явиться тут...</p>
        )}

        {form.focusAreas.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {form.focusAreas.slice(0, 4).map((a) => (
              <span key={a} className="px-2 py-0.5 rounded-full bg-primary-light text-primary text-[10px] font-medium">{a}</span>
            ))}
            {form.focusAreas.length > 4 && (
              <span className="px-2 py-0.5 rounded-full bg-muted-bg text-muted text-[10px]">+{form.focusAreas.length - 4}</span>
            )}
          </div>
        )}

        <div className="pt-3 border-t border-border/60 flex items-center gap-3 text-[10px] text-muted">
          {activeSocials > 0 && (
            <span>🔗 {activeSocials} {activeSocials === 1 ? "соцмережа" : "соцмережі"}</span>
          )}
          {form.mission && <span>💬 Місія вказана</span>}
          {form.coverVideo && <span>🎬 Відео-обкладинка</span>}
          {!form.mission && !activeSocials && !form.coverVideo && (
            <span className="text-muted/40">Додайте більше інформації</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Section wrapper ──────────────────────────────────────────────────
function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <div className="px-6 py-4 border-b border-border/60 bg-muted-bg/30">
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
        {hint && <p className="text-xs text-muted mt-0.5 leading-relaxed">{hint}</p>}
      </div>
      <div className="p-6 flex flex-col gap-5">{children}</div>
    </div>
  );
}

const inp = "w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted/40";
const lbl = "block text-sm font-medium text-foreground mb-1.5";

// ── Main component ───────────────────────────────────────────────────
function ProfileContent() {
  const { org, update } = useOrgSession();
  const logoRef = useRef<HTMLInputElement>(null);
  const [focusInput, setFocusInput] = useState("");
  const [saved, setSaved]   = useState(false);
  const [saving, setSaving] = useState(false);
  const [coverModalOpen, setCoverModalOpen] = useState(false);

  const [form, setForm] = useState({
    name:         org?.name         ?? "",
    type:         org?.type         ?? "",
    country:      org?.country      ?? "",
    city:         org?.city         ?? "",
    founded:      org?.founded      ?? "",
    website:      org?.website      ?? "",
    contactEmail: org?.contactEmail ?? "",
    description:  org?.description  ?? "",
    mission:      org?.mission      ?? "",
    logo:         org?.logo         ?? (null as string | null),
    coverImage:   org?.coverImage   ?? (null as string | null),
    coverVideo:   org?.coverVideo   ?? (null as string | null),
    brandColor:   org?.brandColor   ?? "#3B4FE8",
    focusAreas:   org?.focusAreas   ?? ([] as string[]),
    socials:      (org?.socials     ?? {}) as Record<string, string>,
  });

  // Must be before conditional return (Rules of Hooks)
  const handleCoverApply = useCallback((result: CoverResult) => {
    if (result.kind === "image") {
      setForm((p) => ({ ...p, coverImage: result.data, coverVideo: null }));
    } else {
      setForm((p) => ({ ...p, coverVideo: result.url, coverImage: null }));
    }
    setSaved(false);
  }, []);

  if (!org) return null;

  const initials = org.name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  function set<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((p) => ({ ...p, [field]: value }));
    setSaved(false);
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) { alert("Максимум 2 МБ"); return; }
    const r = new FileReader();
    r.onload = () => set("logo", r.result as string);
    r.readAsDataURL(f);
  }

  function removeCover() {
    setForm((p) => ({ ...p, coverImage: null, coverVideo: null }));
    setSaved(false);
  }

  function addFocusArea() {
    const v = focusInput.trim();
    if (!v || form.focusAreas.includes(v)) return;
    set("focusAreas", [...form.focusAreas, v]);
    setFocusInput("");
  }

  function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    update({ ...form, name: form.name.trim(), description: form.description.trim(), mission: form.mission.trim() });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const hasCover = !!(form.coverImage || form.coverVideo);

  return (
    <>
      <CoverPickerModal
        isOpen={coverModalOpen}
        onClose={() => setCoverModalOpen(false)}
        onApply={handleCoverApply}
      />

      <div className="page-transition">
        {/* ── Page header ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <h1 className="text-2xl font-black text-foreground">Профіль організації</h1>
            <p className="text-sm text-muted mt-1">Заповніть профіль — кандидати бачать його публічно</p>
          </div>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-1.5 text-xs text-green-600 font-semibold">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                Збережено
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm shadow-primary/20 disabled:opacity-50"
            >
              {saving ? "Зберігаємо..." : "Зберегти зміни"}
            </button>
          </div>
        </div>

        {/* Status banners */}
        {org.status === "pending" && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-6">
            <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-amber-800">Верифікація в процесі</p>
              <p className="text-xs text-amber-600 mt-0.5">Наша команда перевіряє вашу організацію. Зазвичай це займає 1–3 робочих дні.</p>
            </div>
          </div>
        )}
        {org.status === "verified" && (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl mb-6">
            <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-semibold text-green-800">Організацію верифіковано — профіль повністю публічний</p>
          </div>
        )}

        {/* ── 2-column grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">

          {/* ── LEFT: form ─────────────────────────────────────────── */}
          <div className="lg:col-span-3 flex flex-col gap-5">

            {/* Обкладинка та логотип */}
            <Section
              title="Обкладинка та логотип"
              hint="Зображення, банер або відео — відображається у верхній частині вашого публічного профілю."
            >
              {/* Cover area */}
              <div>
                <label className={lbl}>
                  Обкладинка
                  {form.coverVideo && (
                    <span className="ml-2 text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-semibold">🎬 Відео</span>
                  )}
                </label>

                <div
                  className="relative rounded-2xl overflow-hidden h-36 cursor-pointer group"
                  onClick={() => setCoverModalOpen(true)}
                >
                  <CoverDisplay
                    coverImage={form.coverImage}
                    coverVideo={form.coverVideo}
                    brandColor={form.brandColor}
                    height="h-full"
                  />

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-all flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-all text-center">
                      <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-2">
                        {hasCover ? (
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        )}
                      </div>
                      <p className="text-white text-xs font-semibold">{hasCover ? "Змінити обкладинку" : "Додати обкладинку"}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCoverModalOpen(true)}
                      className="text-xs text-primary font-semibold hover:text-primary-dark transition-colors"
                    >
                      {hasCover ? "Змінити" : "Додати обкладинку"}
                    </button>
                    <span className="text-xs text-muted/30">·</span>
                    <span className="text-xs text-muted">Фото, банер або YouTube відео</span>
                  </div>
                  {hasCover && (
                    <button onClick={removeCover} className="text-xs text-muted hover:text-red-500 transition-colors font-medium">
                      Видалити
                    </button>
                  )}
                </div>
              </div>

              {/* Logo + brand color */}
              <div className="flex items-start gap-5 pt-1">
                <div
                  className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0 border border-border shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ background: form.logo ? undefined : form.brandColor }}
                  onClick={() => logoRef.current?.click()}
                  title="Завантажити лого"
                >
                  {form.logo ? (
                    <Image src={form.logo} alt="Logo" width={64} height={64} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-lg font-black text-white">{initials}</span>
                  )}
                </div>
                <div className="flex-1">
                  <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                  <div className="flex items-center gap-3 mb-1.5">
                    <button onClick={() => logoRef.current?.click()} className="px-4 py-2 rounded-xl bg-primary-light text-primary text-sm font-semibold hover:bg-primary/10 transition-all">
                      {form.logo ? "Змінити лого" : "Завантажити лого"}
                    </button>
                    {form.logo && (
                      <button onClick={() => set("logo", null)} className="text-xs text-muted hover:text-red-500 transition-colors">
                        Видалити
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-muted">PNG або JPG, до 2 МБ</p>
                </div>
              </div>

              {/* Brand color */}
              <div className="pt-1">
                <label className={lbl}>
                  Бренд-колір
                  <span className="ml-2 text-xs text-muted font-normal">
                    {form.coverImage || form.coverVideo ? "для логотипу та акцентів" : "для обкладинки та логотипу"}
                  </span>
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {BRAND_PRESETS.map((c) => (
                    <button
                      key={c}
                      onClick={() => set("brandColor", c)}
                      className={`w-7 h-7 rounded-lg transition-all hover:scale-110 ${form.brandColor === c ? "ring-2 ring-offset-2 ring-primary scale-110" : ""}`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg border border-border flex-shrink-0" style={{ background: form.brandColor }} />
                  <input
                    type="color"
                    value={form.brandColor}
                    onChange={(e) => set("brandColor", e.target.value)}
                    className="w-8 h-8 rounded-lg border border-border cursor-pointer p-0.5 flex-shrink-0"
                  />
                  <input
                    type="text"
                    value={form.brandColor}
                    onChange={(e) => { if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) set("brandColor", e.target.value); }}
                    className={`${inp} font-mono uppercase max-w-[120px]`}
                    maxLength={7}
                  />
                </div>
              </div>
            </Section>

            {/* Загальна інформація */}
            <Section title="Загальна інформація">
              <div>
                <label className={lbl}>Назва організації *</label>
                <input value={form.name} onChange={(e) => set("name", e.target.value)} className={`${inp} ${!form.name.trim() ? "border-red-300" : ""}`} placeholder="Назва вашої організації" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Тип організації</label>
                  <select value={form.type} onChange={(e) => set("type", e.target.value)} className={inp}>
                    <option value="">Оберіть тип...</option>
                    {ORG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={lbl}>Рік заснування</label>
                  <input value={form.founded} onChange={(e) => set("founded", e.target.value)} placeholder="2015" className={inp} maxLength={4} />
                </div>
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
                <label className={lbl}>Опис організації</label>
                <textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={4} placeholder="Розкажіть про цілі та діяльність організації..." className={`${inp} resize-none`} />
                <p className="text-xs text-muted mt-1">{form.description.length}/500 символів</p>
              </div>
              <div>
                <label className={lbl}>
                  Місія
                  <span className="ml-2 text-xs text-muted font-normal">необов&apos;язково</span>
                </label>
                <textarea value={form.mission} onChange={(e) => set("mission", e.target.value)} rows={2} placeholder="Заради чого існує ваша організація..." className={`${inp} resize-none`} />
                <p className="text-xs text-muted mt-1">Відображається як цитата на публічному профілі</p>
              </div>
            </Section>

            {/* Напрями діяльності */}
            <Section title="Напрями діяльності" hint="Додайте теги — наприклад: «Освіта», «Лідерство», «IT». Кандидати бачать їх на профілі.">
              <div className="flex flex-wrap gap-2 min-h-[36px]">
                {form.focusAreas.map((a) => (
                  <span key={a} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary-light text-primary text-sm font-medium">
                    {a}
                    <button onClick={() => set("focusAreas", form.focusAreas.filter((x) => x !== a))} className="ml-0.5 opacity-50 hover:opacity-100 transition-opacity leading-none text-base">×</button>
                  </span>
                ))}
                {form.focusAreas.length === 0 && <p className="text-xs text-muted/40 self-center">Поки немає напрямів...</p>}
              </div>
              <div className="flex gap-2">
                <input
                  value={focusInput}
                  onChange={(e) => setFocusInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFocusArea(); } }}
                  placeholder="Введіть напрям і натисніть Enter або +"
                  className={`${inp} flex-1`}
                  maxLength={30}
                />
                <button onClick={addFocusArea} className="px-4 py-2.5 rounded-xl bg-primary-light text-primary text-sm font-semibold hover:bg-primary/10 transition-all flex-shrink-0">
                  + Додати
                </button>
              </div>
            </Section>

            {/* Контакти */}
            <Section title="Контактна інформація">
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
            </Section>

            {/* Соцмережі */}
            <Section title="Соціальні мережі" hint="Відображаються як кнопки на вашому публічному профілі.">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className={lbl}>{label}</label>
                    <input
                      value={form.socials[key] ?? ""}
                      onChange={(e) => set("socials", { ...form.socials, [key]: e.target.value })}
                      placeholder={placeholder}
                      className={inp}
                      type="url"
                    />
                  </div>
                ))}
              </div>
            </Section>

            {/* Save bottom */}
            <div className="flex items-center justify-end gap-3 pb-4">
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
                className="px-6 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm shadow-primary/20 disabled:opacity-50"
              >
                {saving ? "Зберігаємо..." : "Зберегти зміни"}
              </button>
            </div>
          </div>

          {/* ── RIGHT: sticky live preview ──────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Живий перегляд профілю</p>
                <PreviewCard form={form} initials={initials} verified={org.status === "verified"} />
              </div>
              <div className="bg-primary-light rounded-xl p-4 border border-primary/15">
                <p className="text-xs font-semibold text-primary mb-1">💡 Поради</p>
                <ul className="text-xs text-primary/70 space-y-1.5">
                  <li>• Відео-обкладинка (YouTube) — найпотужніший спосіб виділитись</li>
                  <li>• Яскравий банер привертає увагу одразу</li>
                  <li>• Чіткий опис збільшує довіру кандидатів</li>
                  <li>• Місія — ключ для залучення відданих кандидатів</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

export default function ProfilePage() {
  return <ProfileContent />;
}
