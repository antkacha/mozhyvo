"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Opportunity } from "@/lib/data";
import { useApplications } from "@/hooks/useApplications";
import { createClient } from "@/lib/supabase/client";
import type { FormQuestion } from "@/hooks/useOrgProjects";

const DEGREES = [
  "Бакалавр",
  "Магістр",
  "Аспірант / PhD",
  "Спеціаліст",
  "Незакінчена вища",
  "Інше",
];

const LANGUAGES = [
  "Українська",
  "Англійська",
  "Німецька",
  "Французька",
  "Польська",
  "Іспанська",
  "Італійська",
  "Португальська",
  "Інша",
];

const COUNTRIES = [
  "Україна",
  "Польща",
  "Німеччина",
  "США",
  "Велика Британія",
  "Чехія",
  "Словаччина",
  "Австрія",
  "Нідерланди",
  "Швеція",
  "Норвегія",
  "Фінляндія",
  "Канада",
  "Інша",
];

const YEARS = ["2024", "2025", "2026", "2027", "2028", "2029"];

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  institution: string;
  degree: string;
  graduationYear: string;
  languages: string[];
  motivation: string;
  cvUrl: string;
  portfolioUrl: string;
};

const EMPTY: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  country: "",
  institution: "",
  degree: "",
  graduationYear: "",
  languages: [],
  motivation: "",
  cvUrl: "",
  portfolioUrl: "",
};


// ── Helpers ──────────────────────────────────────────────────────

function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function inputCls(error?: string) {
  return `w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white ${
    error ? "border-red-400" : "border-border"
  }`;
}

// ── Main component ────────────────────────────────────────────────

export default function ApplyForm({ opp }: { opp: Opportunity }) {
  const { submit, hasApplied, ready } = useApplications();
  const [customQuestions, setCustomQuestions] = useState<FormQuestion[]>([]);

  useEffect(() => {
    // Skip static text slugs like "erasmus-plus"; fetch for any UUID-based ID
    if (!/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(opp.slug)) return;
    const supabase = createClient();
    supabase
      .from("org_projects")
      .select("form_questions")
      .eq("id", opp.slug)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.form_questions) setCustomQuestions(data.form_questions as FormQuestion[]);
      });
  }, [opp.slug]);

  // Which standard blocks the org enabled
  const enabledBlocks = useMemo(
    () => new Set(customQuestions.filter((q) => q.type.startsWith("block_")).map((q) => q.type)),
    [customQuestions]
  );

  // Sections + real questions (for rendering the custom step)
  const trueCustomItems = useMemo(
    () => customQuestions.filter((q) => !q.type.startsWith("block_")),
    [customQuestions]
  );
  // Only real questions, no sections (for validation and review)
  const trueCustomQuestions = useMemo(
    () => trueCustomItems.filter((q) => q.type !== "section"),
    [trueCustomItems]
  );

  // Custom step label: use first section's name if the org named it
  const customStepLabel = useMemo(() => {
    const sec = trueCustomItems.find((q) => q.type === "section");
    return sec?.label?.trim() || "Додаткові питання";
  }, [trueCustomItems]);

  // Build steps dynamically based on enabled blocks
  const STEPS = useMemo(() => {
    const steps: Array<{ id: string; label: string }> = [];
    steps.push({ id: "personal", label: "Особисті дані" });
    if (enabledBlocks.has("block_education")) steps.push({ id: "education", label: "Освіта та мови" });
    if (enabledBlocks.has("block_motivation") || enabledBlocks.has("block_documents")) {
      steps.push({ id: "motivation", label: enabledBlocks.has("block_motivation") ? "Мотивація" : "Документи" });
    }
    if (trueCustomQuestions.length > 0) steps.push({ id: "custom", label: customStepLabel });
    steps.push({ id: "review", label: "Огляд заявки" });
    return steps;
  }, [enabledBlocks, trueCustomQuestions.length, customStepLabel]);

  const CUSTOM_STEP_IDX = STEPS.findIndex((s) => s.id === "custom");

  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(EMPTY);
  const [customAnswers, setCustomAnswers] = useState<Record<string, string | string[]>>({});
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [customErrors, setCustomErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = (field: keyof FormData, value: string | string[]) => {
    setData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const toggleLang = (lang: string) => {
    set(
      "languages",
      data.languages.includes(lang)
        ? data.languages.filter((l) => l !== lang)
        : [...data.languages, lang]
    );
  };

  function setAnswer(id: string, value: string | string[]) {
    setCustomAnswers((prev) => ({ ...prev, [id]: value }));
    if (customErrors[id]) setCustomErrors((prev) => ({ ...prev, [id]: "" }));
  }

  function toggleCheckbox(id: string, opt: string) {
    const cur = (customAnswers[id] as string[] | undefined) ?? [];
    setAnswer(id, cur.includes(opt) ? cur.filter((v) => v !== opt) : [...cur, opt]);
  }

  // Per-step validation
  const validate = (s: number): Partial<FormData> => {
    const e: Partial<FormData> = {};
    const sid = STEPS[s]?.id;
    if (sid === "personal") {
      if (!data.firstName.trim()) e.firstName = "Вкажи ім'я";
      if (!data.lastName.trim()) e.lastName = "Вкажи прізвище";
      if (!data.email.includes("@")) e.email = "Невірний email";
      if (enabledBlocks.has("block_contacts") && !data.country) e.country = "Обери країну";
    }
    if (sid === "education") {
      if (!data.institution.trim()) e.institution = "Вкажи заклад";
      if (!data.degree) e.degree = "Обери ступінь";
      if (data.languages.length === 0)
        (e as Record<string, string>).languages = "Додай хоча б одну мову";
    }
    if (sid === "motivation") {
      if (enabledBlocks.has("block_motivation") && data.motivation.trim().length < 50)
        e.motivation = "Мотиваційний лист — мінімум 50 символів";
      if (data.cvUrl && !/^https?:\/\/.+/.test(data.cvUrl))
        e.cvUrl = "Вкажи повне посилання (https://...)";
      if (data.portfolioUrl && !/^https?:\/\/.+/.test(data.portfolioUrl))
        e.portfolioUrl = "Вкажи повне посилання (https://...)";
    }
    return e;
  };

  function validateCustom(): Record<string, string> {
    const e: Record<string, string> = {};
    trueCustomQuestions.forEach((q) => {
      if (!q.required) return;
      const val = customAnswers[q.id];
      if (!val || (Array.isArray(val) ? val.length === 0 : val.trim() === "")) {
        e[q.id] = "Обов'язкове поле";
      }
    });
    return e;
  }

  const next = () => {
    if (step === CUSTOM_STEP_IDX) {
      const e = validateCustom();
      if (Object.keys(e).length > 0) { setCustomErrors(e); return; }
      setCustomErrors({});
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const e = validate(step);
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }
    setErrors({});
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = () => {
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await submit({
        opportunitySlug: opp.slug,
        opportunityTitle: opp.title,
        org: opp.org,
        deadline: opp.deadline,
        ...data,
        ...(Object.keys(customAnswers).length > 0 ? { customAnswers } : {}),
      });
      setDone(true);
    } catch {
      alert("Помилка відправки заявки. Спробуй ще раз.");
    } finally {
      setSubmitting(false);
    }
  };

  // Already applied
  if (ready && hasApplied(opp.slug)) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-border px-8 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-foreground mb-2">Ти вже подав заявку</h2>
        <p className="text-muted mb-6">
          Ти вже відгукнувся на цю програму. Переглянути статус можна в профілі.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/profile" className="px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-all">
            Мій профіль
          </Link>
          <Link href="/opportunities" className="px-5 py-2.5 border border-border rounded-xl text-sm font-medium hover:border-primary hover:text-primary transition-all">
            Інші можливості
          </Link>
        </div>
      </div>
    );
  }

  // Success state
  if (done) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-border px-8 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-extrabold text-foreground mb-2">Заявку подано! 🎉</h2>
        <p className="text-muted max-w-sm mx-auto mb-8 leading-relaxed">
          Твою заявку на <strong>{opp.title}</strong> надіслано. Координатор розгляне її найближчим часом.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/profile" className="px-6 py-3 bg-primary text-white rounded-2xl font-semibold text-sm hover:bg-primary-dark transition-all shadow-sm shadow-primary/20">
            Переглянути в профілі
          </Link>
          <Link href="/opportunities" className="px-6 py-3 border border-border rounded-2xl text-sm font-semibold hover:border-primary hover:text-primary transition-all">
            Знайти ще можливості
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-border px-8 py-8">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                  i < step
                    ? "bg-primary text-white"
                    : i === step
                    ? "bg-primary text-white ring-4 ring-primary/20"
                    : "bg-muted-bg text-muted border border-border"
                }`}
              >
                {i < step ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i === step ? "text-foreground" : "text-muted"}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-0.5 flex-shrink-0 transition-all ${i < step ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm p-8">
        <h2 className="text-lg font-bold text-foreground mb-1">{STEPS[step]?.label}</h2>
        <p className="text-sm text-muted mb-6">Крок {step + 1} з {STEPS.length}</p>

        {/* ── Personal data ── */}
        {STEPS[step]?.id === "personal" && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Ім'я" required error={errors.firstName}>
                <input type="text" value={data.firstName} onChange={(e) => set("firstName", e.target.value)} placeholder="Іванна" className={inputCls(errors.firstName)} />
              </Field>
              <Field label="Прізвище" required error={errors.lastName}>
                <input type="text" value={data.lastName} onChange={(e) => set("lastName", e.target.value)} placeholder="Шевченко" className={inputCls(errors.lastName)} />
              </Field>
            </div>
            <Field label="Email" required error={errors.email}>
              <input type="email" value={data.email} onChange={(e) => set("email", e.target.value)} placeholder="your@email.com" autoComplete="email" className={inputCls(errors.email)} />
            </Field>
            {enabledBlocks.has("block_contacts") && (
              <>
                <Field label="Номер телефону" hint="Міжнародний формат, наприклад +380501234567">
                  <input type="tel" value={data.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+380 50 123 4567" className={inputCls()} />
                </Field>
                <Field label="Країна проживання" required error={errors.country}>
                  <select value={data.country} onChange={(e) => set("country", e.target.value)} className={inputCls(errors.country)}>
                    <option value="">Оберіть країну...</option>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
              </>
            )}
          </div>
        )}

        {/* ── Education ── */}
        {STEPS[step]?.id === "education" && (
          <div className="flex flex-col gap-5">
            <Field label="Заклад навчання" required error={errors.institution}>
              <input type="text" value={data.institution} onChange={(e) => set("institution", e.target.value)} placeholder="Київський університет імені Бориса Грінченка" className={inputCls(errors.institution)} />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Ступінь освіти" required error={errors.degree}>
                <select value={data.degree} onChange={(e) => set("degree", e.target.value)} className={inputCls(errors.degree)}>
                  <option value="">Оберіть...</option>
                  {DEGREES.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Рік закінчення">
                <select value={data.graduationYear} onChange={(e) => set("graduationYear", e.target.value)} className={inputCls()}>
                  <option value="">Оберіть...</option>
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Мови" required error={(errors as Record<string, string>).languages}>
              <div className="flex flex-wrap gap-2 mt-1">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLang(lang)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all duration-150 ${
                      data.languages.includes(lang)
                        ? "bg-primary text-white border-primary"
                        : "border-border text-muted hover:border-primary hover:text-primary bg-white"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </Field>
          </div>
        )}

        {/* ── Motivation / Documents ── */}
        {STEPS[step]?.id === "motivation" && (
          <div className="flex flex-col gap-5">
            {enabledBlocks.has("block_motivation") && (
              <Field
                label="Мотиваційний лист"
                required
                error={errors.motivation}
                hint={`${data.motivation.length} / мінімум 50 символів`}
              >
                <textarea
                  value={data.motivation}
                  onChange={(e) => set("motivation", e.target.value)}
                  placeholder={`Розкажи, чому ця програма важлива для тебе, які у тебе цілі та чому ти підходиш для участі...\n\nЯк ця можливість допоможе тобі в розвитку?`}
                  rows={8}
                  className={`${inputCls(errors.motivation)} resize-none leading-relaxed`}
                />
              </Field>
            )}
            {enabledBlocks.has("block_documents") && (
              <>
                <Field label="Посилання на CV" hint="Google Drive, Dropbox або інший публічний URL (необов'язково)" error={errors.cvUrl}>
                  <input type="url" value={data.cvUrl} onChange={(e) => set("cvUrl", e.target.value)} placeholder="https://drive.google.com/..." className={inputCls(errors.cvUrl)} />
                </Field>
                <Field label="Посилання на портфоліо" hint="GitHub, Behance, LinkedIn або особистий сайт (необов'язково)" error={errors.portfolioUrl}>
                  <input type="url" value={data.portfolioUrl} onChange={(e) => set("portfolioUrl", e.target.value)} placeholder="https://github.com/..." className={inputCls(errors.portfolioUrl)} />
                </Field>
              </>
            )}
          </div>
        )}

        {/* ── Custom questions ── */}
        {STEPS[step]?.id === "custom" && (
          <div className="flex flex-col gap-6">
            {trueCustomItems.map((q) => {
              if (q.type === "section") {
                return (
                  <div key={q.id} className="pt-2 pb-1 border-b-2 border-primary/20 -mb-2">
                    <h3 className="text-base font-bold text-foreground">{q.label || "Розділ"}</h3>
                    {q.description && <p className="text-sm text-muted mt-1 mb-2">{q.description}</p>}
                  </div>
                );
              }
              const err = customErrors[q.id];
              const val = customAnswers[q.id];
              const inp = `w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white ${err ? "border-red-400" : "border-border"}`;
              return (
                <div key={q.id}>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    {q.label}
                    {q.required && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  {q.description && <p className="text-xs text-muted mb-2">{q.description}</p>}
                  {q.type === "text" && (
                    <input
                      value={(val as string) ?? ""}
                      onChange={(e) => setAnswer(q.id, e.target.value)}
                      placeholder={q.placeholder}
                      className={inp}
                    />
                  )}
                  {q.type === "textarea" && (
                    <textarea
                      value={(val as string) ?? ""}
                      onChange={(e) => setAnswer(q.id, e.target.value)}
                      placeholder={q.placeholder}
                      rows={4}
                      className={`${inp} resize-none`}
                    />
                  )}
                  {q.type === "select" && (
                    <select value={(val as string) ?? ""} onChange={(e) => setAnswer(q.id, e.target.value)} className={inp}>
                      <option value="">Оберіть варіант...</option>
                      {(q.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  )}
                  {q.type === "radio" && (
                    <div className="flex flex-col gap-2 mt-1">
                      {(q.options ?? []).map((o) => (
                        <label key={o} className="flex items-center gap-3 cursor-pointer group">
                          <div
                            onClick={() => setAnswer(q.id, o)}
                            className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all cursor-pointer ${
                              val === o ? "border-primary bg-primary" : "border-border group-hover:border-primary/50"
                            }`}
                          >
                            {val === o && <div className="w-full h-full rounded-full bg-white scale-[0.4] block" />}
                          </div>
                          <span className="text-sm text-foreground">{o}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {q.type === "checkbox" && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {(q.options ?? []).map((o) => {
                        const checked = ((val as string[] | undefined) ?? []).includes(o);
                        return (
                          <button
                            key={o} type="button"
                            onClick={() => toggleCheckbox(q.id, o)}
                            className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${
                              checked ? "bg-primary text-white border-primary" : "border-border text-muted hover:border-primary hover:text-primary bg-white"
                            }`}
                          >
                            {o}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {err && <p className="text-xs text-red-500 mt-1">{err}</p>}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Review ── */}
        {STEPS[step]?.id === "review" && (
          <div className="flex flex-col gap-6">
            <div className="bg-muted-bg rounded-xl p-5">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Особисті дані</p>
              <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                <span className="text-muted">Ім&apos;я</span><span className="text-foreground font-medium">{data.firstName} {data.lastName}</span>
                <span className="text-muted">Email</span><span className="text-foreground font-medium">{data.email}</span>
                {enabledBlocks.has("block_contacts") && (
                  <>
                    <span className="text-muted">Телефон</span><span className="text-foreground font-medium">{data.phone || "—"}</span>
                    <span className="text-muted">Країна</span><span className="text-foreground font-medium">{data.country}</span>
                  </>
                )}
              </div>
            </div>
            {enabledBlocks.has("block_education") && (
              <div className="bg-muted-bg rounded-xl p-5">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Освіта та мови</p>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                  <span className="text-muted">Заклад</span><span className="text-foreground font-medium">{data.institution}</span>
                  <span className="text-muted">Ступінь</span><span className="text-foreground font-medium">{data.degree}</span>
                  <span className="text-muted">Рік</span><span className="text-foreground font-medium">{data.graduationYear || "—"}</span>
                  <span className="text-muted">Мови</span><span className="text-foreground font-medium">{data.languages.join(", ")}</span>
                </div>
              </div>
            )}
            {(enabledBlocks.has("block_motivation") || enabledBlocks.has("block_documents")) && (
              <div className="bg-muted-bg rounded-xl p-5">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Мотивація</p>
                {enabledBlocks.has("block_motivation") && (
                  <p className="text-sm text-foreground leading-relaxed line-clamp-4">{data.motivation}</p>
                )}
                {(data.cvUrl || data.portfolioUrl) && (
                  <div className="mt-3 flex flex-col gap-1">
                    {data.cvUrl && <a href={data.cvUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">📄 CV</a>}
                    {data.portfolioUrl && <a href={data.portfolioUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">🔗 Портфоліо</a>}
                  </div>
                )}
              </div>
            )}
            {trueCustomQuestions.length > 0 && (
              <div className="bg-muted-bg rounded-xl p-5">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">{customStepLabel}</p>
                <div className="flex flex-col gap-3">
                  {trueCustomQuestions.map((q) => {
                    const val = customAnswers[q.id];
                    const display = Array.isArray(val) ? val.join(", ") : val || "—";
                    return (
                      <div key={q.id} className="grid grid-cols-2 gap-x-4 text-sm">
                        <span className="text-muted">{q.label}</span>
                        <span className="text-foreground font-medium">{display}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <p className="text-xs text-muted text-center">
              Натискаючи «Відправити заявку», ти підтверджуєш, що всі дані вірні.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
          {step > 0 ? (
            <button onClick={back} className="flex items-center gap-2 text-sm font-medium text-muted hover:text-foreground transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Назад
            </button>
          ) : (
            <Link href={`/opportunities/${opp.slug}`} className="text-sm text-muted hover:text-foreground transition-colors">
              ← До програми
            </Link>
          )}

          {step < STEPS.length - 1 ? (
            <button onClick={next} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-all">
              Далі
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Надсилаємо...
                </>
              ) : (
                <>Відправити заявку 🚀</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
