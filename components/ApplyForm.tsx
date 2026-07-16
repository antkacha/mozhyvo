"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { Opportunity } from "@/lib/data";
import { useApplications } from "@/hooks/useApplications";
import { useProfile } from "@/hooks/useProfile";
import type { FormQuestion } from "@/hooks/useOrgProjects";
import { saveDraft, loadDraft, clearDraft } from "@/lib/draft-storage";

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

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 8 }, (_, i) => String(CURRENT_YEAR - 4 + i));

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

export default function ApplyForm({ opp, formQuestions: initialFormQuestions = [] }: { opp: Opportunity; formQuestions?: FormQuestion[] }) {
  const { submit, hasApplied, ready } = useApplications();
  const { profile, ready: profileReady } = useProfile();
  const [customQuestions] = useState<FormQuestion[]>(initialFormQuestions);
  const profileFilledRef = useRef(false);

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

  // Group custom items by sections — each section becomes its own step
  const customGroups = useMemo(() => {
    const groups: { id: string; label: string; questions: FormQuestion[] }[] = [];
    let current: (typeof groups)[0] | null = null;
    for (const item of trueCustomItems) {
      if (item.type === "section") {
        if (current && current.questions.length > 0) groups.push(current);
        current = { id: `csec_${item.id}`, label: item.label?.trim() || "Додаткові питання", questions: [] };
      } else {
        if (!current) current = { id: "csec_default", label: "Додаткові питання", questions: [] };
        current.questions.push(item);
      }
    }
    if (current && current.questions.length > 0) groups.push(current);
    return groups;
  }, [trueCustomItems]);

  // Build steps dynamically based on enabled blocks + org's custom sections
  const STEPS = useMemo(() => {
    const steps: Array<{ id: string; label: string }> = [];
    steps.push({ id: "personal", label: "Особисті дані" });
    if (enabledBlocks.has("block_education")) steps.push({ id: "education", label: "Освіта та мови" });
    if (enabledBlocks.has("block_motivation") || enabledBlocks.has("block_documents")) {
      steps.push({ id: "motivation", label: enabledBlocks.has("block_motivation") ? "Мотивація" : "Документи" });
    }
    customGroups.forEach((g) => steps.push({ id: g.id, label: g.label }));
    steps.push({ id: "review", label: "Огляд заявки" });
    return steps;
  }, [enabledBlocks, customGroups]);

  const DRAFT_KEY = `mozhyvo_apply_draft_${opp.slug}`;
  const [hasDraft, setHasDraft] = useState(false);
  const isDraftResolved = useRef(false);
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // On mount: check for a useful draft (has email = was at least profile-filled)
  useEffect(() => {
    type ApplyDraft = { data: FormData; step: number; customAnswers: Record<string, string | string[]> };
    const d = loadDraft<ApplyDraft>(DRAFT_KEY);
    if (d?.data?.email) {
      setHasDraft(true);
    } else {
      clearDraft(DRAFT_KEY); // clear empty/malformed drafts
      isDraftResolved.current = true;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(EMPTY);

  // Pre-fill from user profile once when it loads
  useEffect(() => {
    if (!profileReady || profileFilledRef.current) return;
    profileFilledRef.current = true;
    setData({
      firstName:      profile.firstName || "",
      lastName:       profile.lastName  || "",
      email:          profile.email     || "",
      phone:          profile.phone     || "",
      country:        profile.country   || "",
      institution:    profile.institution || "",
      degree:         profile.degree    || "",
      graduationYear: profile.graduationYear || "",
      languages:      profile.languages ?? [],
      motivation:     "",
      cvUrl:          profile.cvUrl     || "",
      portfolioUrl:   "",
    });
  }, [profileReady, profile]);
  const [customAnswers, setCustomAnswers] = useState<Record<string, string | string[]>>({});

  // Debounced save — only after draft decision is resolved AND profile is filled
  useEffect(() => {
    if (!isDraftResolved.current && !profileFilledRef.current) return;
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      saveDraft(DRAFT_KEY, { data, step, customAnswers });
    }, 500);
    return () => { if (draftTimer.current) clearTimeout(draftTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, step, customAnswers]);

  function restoreDraft() {
    type ApplyDraft = { data: FormData; step: number; customAnswers: Record<string, string | string[]> };
    const d = loadDraft<ApplyDraft>(DRAFT_KEY);
    if (!d) return;
    isDraftResolved.current = true;
    profileFilledRef.current = true; // block profile prefill from overwriting restored data
    setData(d.data);
    setStep(d.step);
    setCustomAnswers(d.customAnswers);
    setHasDraft(false);
  }

  function discardApplyDraft() {
    isDraftResolved.current = true;
    clearDraft(DRAFT_KEY);
    setHasDraft(false);
  }

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [customErrors, setCustomErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState("");

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

  function validateCustomGroup(questions: FormQuestion[]): Record<string, string> {
    const e: Record<string, string> = {};
    questions.forEach((q) => {
      if (!q.required) return;
      const val = customAnswers[q.id];
      if (!val || (Array.isArray(val) ? val.length === 0 : val.trim() === "")) {
        e[q.id] = "Обов'язкове поле";
      }
    });
    return e;
  }

  const next = () => {
    const sid = STEPS[step]?.id;
    const group = customGroups.find((g) => g.id === sid);
    if (group) {
      const e = validateCustomGroup(group.questions);
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
      clearDraft(DRAFT_KEY);
      setDone(true);
    } catch {
      setSubmitError("Помилка відправки заявки. Спробуй ще раз.");
    } finally {
      setSubmitting(false);
    }
  };

  // Already applied
  if (ready && hasApplied(opp.slug)) {
    return (
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-green-400 to-emerald-500 w-full" />
        <div className="px-8 py-14 text-center">
          <div className="w-18 h-18 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-5" style={{ width: 72, height: 72 }}>
            <svg className="w-9 h-9 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-semibold mb-4">
            <span className="text-green-500">✦</span> Заявка вже подана
          </div>
          <h2 className="text-xl font-black text-foreground mb-2">Ти вже відгукнувся!</h2>
          <p className="text-muted mb-7 max-w-xs mx-auto leading-relaxed">Ти вже подав заявку на цю програму. Переглянути статус можна в кабінеті.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/cabinet/applications" className="px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-all shadow-sm shadow-primary/20">
              Мої заявки
            </Link>
            <Link href="/opportunities" className="px-5 py-2.5 border border-border rounded-xl text-sm font-medium hover:border-primary hover:text-primary transition-all">
              Інші можливості
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (done) {
    return (
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-primary to-indigo-500 w-full" />
        <div className="px-8 py-14 text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="w-24 h-24 rounded-full bg-primary-light flex items-center justify-center">
              <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="absolute -top-1 -right-1 w-7 h-7 bg-primary rounded-full flex items-center justify-center text-white text-sm">✦</div>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-light text-primary text-xs font-semibold mb-4">
            МОЖUВО
          </div>
          <h2 className="text-2xl font-black text-foreground mb-2">Заявку подано! 🎉</h2>
          <p className="text-muted max-w-sm mx-auto mb-8 leading-relaxed">
            Твою заявку на <strong className="text-foreground">{opp.title}</strong> надіслано. Координатор розгляне її найближчим часом.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/cabinet/applications" className="px-6 py-3 bg-primary text-white rounded-2xl font-semibold text-sm hover:bg-primary-dark transition-all shadow-sm shadow-primary/20">
              Переглянути заявку →
            </Link>
            <Link href="/opportunities" className="px-6 py-3 border border-border rounded-2xl text-sm font-semibold hover:border-primary hover:text-primary transition-all">
              Знайти ще можливості
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">

      {/* Progress header */}
      <div>
        <div className="h-1 bg-primary-light">
          <div
            className="h-full bg-gradient-to-r from-primary to-indigo-500 transition-all duration-500 ease-out"
            style={{ width: `${Math.round(((step + 1) / STEPS.length) * 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-sm shadow-primary/30">
              {step < STEPS.length - 1 ? step + 1 : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div>
              <p className="font-bold text-foreground text-sm leading-tight">{STEPS[step]?.label}</p>
              <p className="text-xs text-muted mt-0.5">Крок {step + 1} з {STEPS.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {STEPS.map((s, i) => (
              <div
                key={s.id}
                title={s.label}
                className={`rounded-full transition-all duration-300 ${
                  i < step
                    ? "w-2 h-2 bg-primary"
                    : i === step
                    ? "w-2.5 h-2.5 bg-primary ring-[3px] ring-primary/20"
                    : "w-2 h-2 bg-border"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Draft restore banner */}
      {hasDraft && (
        <div className="flex items-center gap-3 px-6 py-3.5 border-b border-amber-200 bg-amber-50">
          <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-xs font-medium text-amber-800 flex-1">Знайдено незавершену заявку.</p>
          <div className="flex items-center gap-2">
            <button
              onClick={discardApplyDraft}
              className="text-xs font-semibold text-amber-700 hover:text-amber-900 transition-colors"
            >
              Почати заново
            </button>
            <button
              onClick={restoreDraft}
              className="text-xs font-bold px-3 py-1 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-all"
            >
              Продовжити
            </button>
          </div>
        </div>
      )}

      {/* Step content */}
      <div className="px-7 py-7">

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
        {(() => {
          const group = customGroups.find((g) => g.id === STEPS[step]?.id);
          if (!group) return null;
          return (
          <div className="flex flex-col gap-6">
            {group.questions.map((q) => {
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
          );
        })()}

        {/* ── Review ── */}
        {STEPS[step]?.id === "review" && (
          <div className="flex flex-col gap-4">
            {/* Confirm banner */}
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary-light border border-primary/15">
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs text-primary font-medium leading-snug">Перевір дані перед відправкою — після подачі заявку не можна редагувати.</p>
            </div>

            {/* Personal */}
            <div className="rounded-2xl border border-border overflow-hidden">
              <div className="px-5 py-3 bg-muted-bg/60 border-b border-border flex items-center gap-2">
                <span className="text-base">👤</span>
                <p className="text-xs font-bold text-foreground uppercase tracking-wider">Особисті дані</p>
              </div>
              <div className="px-5 py-4 grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                <span className="text-muted">Ім&apos;я</span><span className="text-foreground font-semibold">{data.firstName} {data.lastName}</span>
                <span className="text-muted">Email</span><span className="text-foreground font-semibold truncate">{data.email}</span>
                {enabledBlocks.has("block_contacts") && (
                  <>
                    <span className="text-muted">Телефон</span><span className="text-foreground font-semibold">{data.phone || "—"}</span>
                    <span className="text-muted">Країна</span><span className="text-foreground font-semibold">{data.country}</span>
                  </>
                )}
              </div>
            </div>

            {enabledBlocks.has("block_education") && (
              <div className="rounded-2xl border border-border overflow-hidden">
                <div className="px-5 py-3 bg-muted-bg/60 border-b border-border flex items-center gap-2">
                  <span className="text-base">🎓</span>
                  <p className="text-xs font-bold text-foreground uppercase tracking-wider">Освіта та мови</p>
                </div>
                <div className="px-5 py-4 grid grid-cols-2 gap-y-3 gap-x-6 text-sm">
                  <span className="text-muted">Заклад</span><span className="text-foreground font-semibold">{data.institution}</span>
                  <span className="text-muted">Ступінь</span><span className="text-foreground font-semibold">{data.degree}</span>
                  <span className="text-muted">Рік</span><span className="text-foreground font-semibold">{data.graduationYear || "—"}</span>
                  <span className="text-muted">Мови</span>
                  <div className="flex flex-wrap gap-1">
                    {data.languages.map((l) => (
                      <span key={l} className="px-2 py-0.5 rounded-full bg-primary-light text-primary text-xs font-medium">{l}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {(enabledBlocks.has("block_motivation") || enabledBlocks.has("block_documents")) && (
              <div className="rounded-2xl border border-border overflow-hidden">
                <div className="px-5 py-3 bg-muted-bg/60 border-b border-border flex items-center gap-2">
                  <span className="text-base">💬</span>
                  <p className="text-xs font-bold text-foreground uppercase tracking-wider">Мотивація та документи</p>
                </div>
                <div className="px-5 py-4">
                  {enabledBlocks.has("block_motivation") && (
                    <p className="text-sm text-foreground leading-relaxed line-clamp-4 mb-3">{data.motivation}</p>
                  )}
                  {(data.cvUrl || data.portfolioUrl) && (
                    <div className="flex flex-wrap gap-3">
                      {data.cvUrl && (
                        <a href={data.cvUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-light text-primary text-xs font-semibold hover:bg-primary/15 transition-colors">
                          📄 CV
                        </a>
                      )}
                      {data.portfolioUrl && (
                        <a href={data.portfolioUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-light text-primary text-xs font-semibold hover:bg-primary/15 transition-colors">
                          🔗 Портфоліо
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {trueCustomQuestions.length > 0 && (
              <div className="rounded-2xl border border-border overflow-hidden">
                <div className="px-5 py-3 bg-muted-bg/60 border-b border-border flex items-center gap-2">
                  <span className="text-base">✏️</span>
                  <p className="text-xs font-bold text-foreground uppercase tracking-wider">Відповіді на питання</p>
                </div>
                <div className="px-5 py-4 flex flex-col gap-3">
                  {trueCustomQuestions.map((q) => {
                    const val = customAnswers[q.id];
                    const display = Array.isArray(val) ? val.join(", ") : val || "—";
                    return (
                      <div key={q.id} className="grid grid-cols-2 gap-x-6 text-sm">
                        <span className="text-muted">{q.label}</span>
                        <span className="text-foreground font-semibold">{display}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <p className="text-xs text-muted text-center pt-2">
              Натискаючи «Відправити заявку», ти підтверджуєш, що всі дані вірні.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-5 border-t border-border">
          {step > 0 ? (
            <button onClick={back} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-muted hover:text-foreground hover:border-foreground/30 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Назад
            </button>
          ) : (
            <Link href={`/opportunities/${opp.slug}`} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              До програми
            </Link>
          )}

          {step < STEPS.length - 1 ? (
            <button onClick={next} className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-all shadow-sm shadow-primary/25">
              Далі
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <div className="flex flex-col items-end gap-2">
              {submitError && (
                <p className="text-xs text-red-500 font-medium">{submitError}</p>
              )}
              <button
                onClick={() => { setSubmitError(""); handleSubmit(); }}
                disabled={submitting}
                className="inline-flex items-center gap-2 px-7 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary-dark transition-all shadow-md shadow-primary/25 disabled:opacity-60 disabled:cursor-not-allowed"
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
