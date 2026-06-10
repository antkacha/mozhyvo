"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useApplications } from "@/hooks/useApplications";
import { createClient } from "@/lib/supabase/client";
import type { FormQuestion } from "@/hooks/useOrgProjects";
import type { Opportunity } from "@/lib/data";

// Matches plain UUIDs and prefixed IDs like proj-*, org-*, etc.
const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DRAFT_KEY = (slug: string) => `mozhyvo_draft_${slug}`;

interface FormState {
  // Step 0
  firstName: string; lastName: string; email: string; phone: string; country: string;
  // Step 1
  institution: string; degree: string; graduationYear: string; languages: string;
  // Step 2
  motivation: string;
  // Step 3
  cvUrl: string; portfolioUrl: string;
}

const EMPTY: FormState = {
  firstName: "", lastName: "", email: "", phone: "", country: "",
  institution: "", degree: "", graduationYear: "", languages: "",
  motivation: "", cvUrl: "", portfolioUrl: "",
};

function motLen(m: string) { return m.trim().length; }

interface Props {
  opp: Opportunity;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ApplicationWizard({ opp, onClose, onSuccess }: Props) {
  const { user, loading: authLoading } = useAuth();
  const { profile, ready: profileReady } = useProfile();
  const { submit, hasApplied, ready: appsReady } = useApplications();

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Custom questions for org projects
  const [customQuestions, setCustomQuestions] = useState<FormQuestion[]>([]);
  const [customAnswers, setCustomAnswers] = useState<Record<string, string | string[]>>({});
  const [customErrors, setCustomErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!UUID_RE.test(opp.slug)) return;
    const supabase = createClient();
    supabase.from("org_projects").select("form_questions")
      .eq("id", opp.slug).maybeSingle()
      .then(({ data }) => {
        if (data?.form_questions && Array.isArray(data.form_questions) && data.form_questions.length > 0) {
          setCustomQuestions(data.form_questions as FormQuestion[]);
        }
      });
  }, [opp.slug]);

  const hasCustom = customQuestions.length > 0;
  const steps = hasCustom
    ? ["Особисті дані", "Освіта", "Мотивація", "Документи", "Питання", "Підтвердження"]
    : ["Особисті дані", "Освіта", "Мотивація", "Документи", "Підтвердження"];
  const confirmStep = steps.length - 1;
  const customQStep = hasCustom ? 4 : -1;

  // Pre-fill from profile
  useEffect(() => {
    if (!profileReady) return;
    const draft = localStorage.getItem(DRAFT_KEY(opp.slug));
    const saved: Partial<FormState> = draft ? JSON.parse(draft) : {};
    setForm({
      firstName:      saved.firstName      ?? profile.firstName,
      lastName:       saved.lastName       ?? profile.lastName,
      email:          saved.email          ?? profile.email,
      phone:          saved.phone          ?? profile.phone,
      country:        saved.country        ?? profile.country,
      institution:    saved.institution    ?? profile.institution,
      degree:         saved.degree         ?? profile.degree,
      graduationYear: saved.graduationYear ?? profile.graduationYear ?? "",
      languages:      saved.languages      ?? profile.languages.join(", "),
      motivation:     saved.motivation     ?? "",
      cvUrl:          saved.cvUrl          ?? profile.cvUrl ?? "",
      portfolioUrl:   saved.portfolioUrl   ?? "",
    });
  }, [profileReady, profile, opp.slug]);

  // Auto-save draft
  useEffect(() => {
    if (!form.motivation && !form.cvUrl) return;
    localStorage.setItem(DRAFT_KEY(opp.slug), JSON.stringify(form));
  }, [form, opp.slug]);

  const set = useCallback((field: keyof FormState, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }, []);

  function setCustomAnswer(id: string, value: string | string[]) {
    setCustomAnswers((p) => ({ ...p, [id]: value }));
    setCustomErrors((p) => { const n = { ...p }; delete n[id]; return n; });
  }

  function validate(s: number): boolean {
    const e: Partial<Record<keyof FormState, string>> = {};
    const ce: Record<string, string> = {};

    if (s === 0) {
      if (!form.firstName.trim()) e.firstName = "Обов'язкове поле";
      if (!form.lastName.trim())  e.lastName  = "Обов'язкове поле";
      if (!form.email.trim() || !form.email.includes("@")) e.email = "Введіть коректний email";
      if (!form.country.trim()) e.country = "Обов'язкове поле";
    }
    if (s === 1) {
      if (!form.institution.trim()) e.institution = "Обов'язкове поле";
      if (!form.degree.trim())      e.degree      = "Оберіть ступінь";
    }
    if (s === 2) {
      const len = motLen(form.motivation);
      if (len < 300) e.motivation = `Мінімум 300 символів (зараз ${len})`;
      if (len > 2000) e.motivation = `Максимум 2000 символів (зараз ${len})`;
    }
    if (s === customQStep) {
      for (const q of customQuestions) {
        if (q.required) {
          const ans = customAnswers[q.id];
          const empty = !ans || (Array.isArray(ans) ? ans.length === 0 : !(ans as string).trim());
          if (empty) ce[q.id] = "Обов'язкове поле";
        }
      }
    }

    setErrors(e);
    setCustomErrors(ce);
    return Object.keys(e).length === 0 && Object.keys(ce).length === 0;
  }

  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!validate(step) || !user) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submit({
        opportunitySlug:  opp.slug,
        opportunityTitle: opp.title,
        org:              opp.org,
        deadline:         opp.deadline,
        firstName:        form.firstName,
        lastName:         form.lastName,
        email:            form.email,
        phone:            form.phone,
        country:          form.country,
        institution:      form.institution,
        degree:           form.degree,
        graduationYear:   form.graduationYear,
        languages:        form.languages.split(",").map((l) => l.trim()).filter(Boolean),
        motivation:       form.motivation,
        cvUrl:            form.cvUrl,
        portfolioUrl:     form.portfolioUrl,
        customAnswers:    hasCustom ? customAnswers : undefined,
      });
      localStorage.removeItem(DRAFT_KEY(opp.slug));
      setSubmitted(true);
      setTimeout(onSuccess, 1500);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Помилка відправки. Спробуй ще раз.");
    } finally {
      setSubmitting(false);
    }
  }

  function next() { if (validate(step)) setStep((s) => s + 1); }
  function back() { setStep((s) => s - 1); }

  const inputCls = (field: keyof FormState) =>
    `w-full px-3.5 py-2.5 text-sm rounded-xl border ${errors[field] ? "border-red-300 focus:ring-red-200 focus:border-red-400" : "border-border focus:ring-primary/20 focus:border-primary"} bg-white focus:outline-none focus:ring-2 transition-all`;
  const customInputCls = (id: string) =>
    `w-full px-3.5 py-2.5 text-sm rounded-xl border ${customErrors[id] ? "border-red-300 focus:ring-red-200 focus:border-red-400" : "border-border focus:ring-primary/20 focus:border-primary"} bg-white focus:outline-none focus:ring-2 transition-all`;
  const lbl = "block text-sm font-medium text-foreground mb-1.5";

  // Not logged in
  if (!authLoading && !user) {
    return (
      <div className="text-center py-8 px-4">
        <div className="w-16 h-16 bg-primary-light rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">🔒</div>
        <h3 className="text-lg font-bold text-foreground mb-2">Увійдіть, щоб подати заявку</h3>
        <p className="text-sm text-muted mb-6">Для подачі заявки потрібен акаунт на Моживо</p>
        <div className="flex flex-col gap-3">
          <a href={`/login?next=/opportunities/${opp.slug}`}
            className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-all text-center">
            Увійти
          </a>
          <a href={`/register?next=/opportunities/${opp.slug}`}
            className="w-full py-3 border border-border rounded-xl font-semibold text-sm hover:border-primary hover:text-primary transition-all text-center">
            Зареєструватись
          </a>
        </div>
      </div>
    );
  }

  // Already applied
  if (appsReady && hasApplied(opp.slug)) {
    return (
      <div className="text-center py-8 px-4">
        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">✅</div>
        <h3 className="text-lg font-bold text-foreground mb-2">Ви вже подали заявку</h3>
        <p className="text-sm text-muted mb-6">Слідкуйте за статусом у вашому кабінеті</p>
        <a href="/cabinet/applications"
          className="inline-block px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-all">
          Мої заявки →
        </a>
      </div>
    );
  }

  // Success screen
  if (submitted) {
    return (
      <div className="text-center py-8 px-4">
        <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-5xl animate-bounce">🎉</div>
        <h3 className="text-xl font-black text-foreground mb-2">Заявку надіслано!</h3>
        <p className="text-sm text-muted">Організатор розгляне вашу заявку та повідомить вас про рішення</p>
      </div>
    );
  }

  if (authLoading || !profileReady) {
    return <div className="flex items-center justify-center py-16"><div className="w-7 h-7 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" /></div>;
  }

  const motChars = motLen(form.motivation);

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                i < step ? "bg-primary text-white" : i === step ? "bg-primary text-white ring-4 ring-primary/20" : "bg-muted-bg text-muted"
              }`}>
                {i < step ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                ) : i + 1}
              </div>
              <span className={`text-[10px] font-semibold hidden sm:block ${i === step ? "text-primary" : "text-muted"}`}>{s}</span>
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-0.5 mx-1 ${i < step ? "bg-primary" : "bg-muted-bg"}`} />}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="min-h-[280px]">

        {/* Step 0: Personal */}
        {step === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={lbl}>Ім&apos;я *</label>
              <input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} className={inputCls("firstName")} />
              {errors.firstName && <p className="text-xs text-red-500 mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className={lbl}>Прізвище *</label>
              <input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} className={inputCls("lastName")} />
              {errors.lastName && <p className="text-xs text-red-500 mt-1">{errors.lastName}</p>}
            </div>
            <div>
              <label className={lbl}>Email *</label>
              <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={inputCls("email")} />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className={lbl}>Телефон</label>
              <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+380..." className={inputCls("phone")} />
            </div>
            <div className="sm:col-span-2">
              <label className={lbl}>Країна *</label>
              <input value={form.country} onChange={(e) => set("country", e.target.value)} placeholder="Україна" className={inputCls("country")} />
              {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country}</p>}
            </div>
          </div>
        )}

        {/* Step 1: Education */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div>
              <label className={lbl}>Університет / Заклад *</label>
              <input value={form.institution} onChange={(e) => set("institution", e.target.value)} className={inputCls("institution")} />
              {errors.institution && <p className="text-xs text-red-500 mt-1">{errors.institution}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Ступінь *</label>
                <select value={form.degree} onChange={(e) => set("degree", e.target.value)} className={inputCls("degree")}>
                  <option value="">Оберіть...</option>
                  {["Бакалавр", "Магістр", "Аспірант", "Студент (не бакалавр)", "Доктор наук", "Інше"].map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                {errors.degree && <p className="text-xs text-red-500 mt-1">{errors.degree}</p>}
              </div>
              <div>
                <label className={lbl}>Рік закінчення</label>
                <input value={form.graduationYear} onChange={(e) => set("graduationYear", e.target.value)} placeholder="2026" className={inputCls("graduationYear")} />
              </div>
            </div>
            <div>
              <label className={lbl}>Мови (через кому)</label>
              <input value={form.languages} onChange={(e) => set("languages", e.target.value)} placeholder="Англійська B2, Польська A2" className={inputCls("languages")} />
            </div>
          </div>
        )}

        {/* Step 2: Motivation */}
        {step === 2 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className={lbl + " mb-0"}>Мотиваційний лист *</label>
              <span className={`text-xs font-semibold ${motChars < 300 ? "text-red-500" : motChars > 1800 ? "text-amber-600" : "text-green-600"}`}>
                {motChars} / 2000
              </span>
            </div>
            <textarea
              value={form.motivation}
              onChange={(e) => set("motivation", e.target.value)}
              rows={10}
              placeholder="Розкажіть, чому ви хочете взяти участь у цій програмі, який у вас досвід та які цілі..."
              className={inputCls("motivation") + " resize-none"}
            />
            {errors.motivation && <p className="text-xs text-red-500 mt-1">{errors.motivation}</p>}
            <p className="text-xs text-muted mt-2">💾 Чернетка зберігається автоматично</p>
          </div>
        )}

        {/* Step 3: Documents */}
        {step === 3 && (
          <div className="flex flex-col gap-5">
            <div className="bg-primary-light rounded-2xl p-4 text-sm text-primary font-medium">
              📎 Завантажте резюме на Google Drive або Dropbox і вставте посилання нижче
            </div>
            <div>
              <label className={lbl}>Посилання на CV / резюме</label>
              <input value={form.cvUrl} onChange={(e) => set("cvUrl", e.target.value)} placeholder="https://drive.google.com/..." className={inputCls("cvUrl")} />
            </div>
            <div>
              <label className={lbl}>Портфоліо / додаткові матеріали</label>
              <input value={form.portfolioUrl} onChange={(e) => set("portfolioUrl", e.target.value)} placeholder="https://..." className={inputCls("portfolioUrl")} />
            </div>
          </div>
        )}

        {/* Step 4: Custom questions (only for org projects that have them) */}
        {step === customQStep && (
          <div className="flex flex-col gap-5">
            <p className="text-sm text-muted">Організатор програми задав додаткові питання</p>
            {customQuestions.map((q) => {
              const ans = customAnswers[q.id];
              return (
                <div key={q.id}>
                  <label className={lbl}>{q.label}{q.required && " *"}</label>
                  {q.description && <p className="text-xs text-muted mb-2">{q.description}</p>}

                  {q.type === "text" && (
                    <input
                      value={(ans as string) ?? ""}
                      onChange={(e) => setCustomAnswer(q.id, e.target.value)}
                      placeholder={q.placeholder ?? ""}
                      className={customInputCls(q.id)}
                    />
                  )}

                  {q.type === "textarea" && (
                    <textarea
                      value={(ans as string) ?? ""}
                      onChange={(e) => setCustomAnswer(q.id, e.target.value)}
                      placeholder={q.placeholder ?? ""}
                      rows={4}
                      className={customInputCls(q.id) + " resize-none"}
                    />
                  )}

                  {q.type === "select" && (
                    <select
                      value={(ans as string) ?? ""}
                      onChange={(e) => setCustomAnswer(q.id, e.target.value)}
                      className={customInputCls(q.id)}
                    >
                      <option value="">Оберіть...</option>
                      {q.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  )}

                  {q.type === "radio" && (
                    <div className="flex flex-col gap-2 mt-1">
                      {q.options?.map((o) => (
                        <label key={o} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={q.id}
                            value={o}
                            checked={(ans as string) === o}
                            onChange={() => setCustomAnswer(q.id, o)}
                            className="accent-primary"
                          />
                          <span className="text-sm text-foreground">{o}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {q.type === "checkbox" && (
                    <div className="flex flex-col gap-2 mt-1">
                      {q.options?.map((o) => (
                        <label key={o} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={((ans as string[]) ?? []).includes(o)}
                            onChange={(e) => {
                              const current = (ans as string[]) ?? [];
                              const next = e.target.checked ? [...current, o] : current.filter((x) => x !== o);
                              setCustomAnswer(q.id, next);
                            }}
                            className="accent-primary"
                          />
                          <span className="text-sm text-foreground">{o}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {customErrors[q.id] && <p className="text-xs text-red-500 mt-1">{customErrors[q.id]}</p>}
                </div>
              );
            })}
          </div>
        )}

        {/* Confirmation step */}
        {step === confirmStep && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
              {[
                { label: "Ім'я та прізвище", value: `${form.firstName} ${form.lastName}` },
                { label: "Email",             value: form.email },
                { label: "Країна",            value: form.country },
                { label: "Заклад",            value: form.institution },
                { label: "Ступінь",           value: form.degree },
              ].map(({ label, value }) => value && (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-muted">{label}</span>
                  <span className="font-medium text-foreground">{value}</span>
                </div>
              ))}
            </div>
            <div className="bg-muted-bg rounded-2xl p-4">
              <p className="text-xs font-semibold text-muted mb-2 uppercase tracking-wider">Мотиваційний лист</p>
              <p className="text-sm text-foreground line-clamp-4">{form.motivation}</p>
            </div>
            {hasCustom && customQuestions.length > 0 && (
              <div className="bg-muted-bg rounded-2xl p-4">
                <p className="text-xs font-semibold text-muted mb-3 uppercase tracking-wider">Питання організатора</p>
                <div className="space-y-2">
                  {customQuestions.map((q) => {
                    const a = customAnswers[q.id];
                    const display = Array.isArray(a) ? a.join(", ") : (a as string) || "—";
                    return (
                      <div key={q.id} className="flex justify-between gap-3 text-sm">
                        <span className="text-muted flex-shrink-0">{q.label}</span>
                        <span className="font-medium text-foreground text-right line-clamp-2">{display}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <p className="text-xs text-muted">Надсилаючи заявку, ви погоджуєтеся з умовами використання платформи Моживо.</p>
          </div>
        )}
      </div>

      {submitError && (
        <div className="mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {submitError}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-7 pt-5 border-t border-border gap-3">
        <button
          onClick={step === 0 ? onClose : back}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted-bg transition-all"
        >
          {step === 0 ? "Скасувати" : "← Назад"}
        </button>
        {step < steps.length - 1 ? (
          <button onClick={next}
            className="px-6 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm shadow-primary/20">
            Далі →
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={submitting}
            className="px-6 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-50 transition-all shadow-sm shadow-primary/20 flex items-center gap-2">
            {submitting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {submitting ? "Надсилаємо..." : "Надіслати заявку ✓"}
          </button>
        )}
      </div>
    </div>
  );
}
