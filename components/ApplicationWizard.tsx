"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useApplications } from "@/hooks/useApplications";
import { createClient } from "@/lib/supabase/client";
import type { FormQuestion } from "@/hooks/useOrgProjects";
import type { Opportunity } from "@/lib/data";

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DRAFT_KEY = (slug: string) => `mozhyvo_draft_${slug}`;

const DEFAULT_QUESTIONS: FormQuestion[] = [
  { id: "block_contacts",   type: "block_contacts",   label: "Контактна інформація", required: true },
  { id: "block_education",  type: "block_education",  label: "Освіта",               required: true },
  { id: "block_motivation", type: "block_motivation", label: "Мотиваційний лист",    required: true },
  { id: "block_documents",  type: "block_documents",  label: "CV та портфоліо",      required: false },
];

interface FormState {
  phone: string; country: string;
  institution: string; degree: string; graduationYear: string; languages: string;
  motivation: string;
  cvUrl: string; portfolioUrl: string;
}

const EMPTY: FormState = {
  phone: "", country: "",
  institution: "", degree: "", graduationYear: "", languages: "",
  motivation: "",
  cvUrl: "", portfolioUrl: "",
};

interface Props {
  opp: Opportunity;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ApplicationWizard({ opp, onClose, onSuccess }: Props) {
  const { user, loading: authLoading } = useAuth();
  const { profile, ready: profileReady } = useProfile();
  const { submit, hasApplied, ready: appsReady } = useApplications();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [customAnswers, setCustomAnswers] = useState<Record<string, string | string[]>>({});
  const [customErrors, setCustomErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<FormQuestion[]>([]);
  const [loadingForm, setLoadingForm] = useState(true);

  useEffect(() => {
    if (!UUID_RE.test(opp.slug)) {
      setQuestions(DEFAULT_QUESTIONS);
      setLoadingForm(false);
      return;
    }
    const supabase = createClient();
    supabase.from("org_projects").select("form_questions")
      .eq("id", opp.slug).maybeSingle()
      .then(({ data }) => {
        const qs = data?.form_questions;
        setQuestions(Array.isArray(qs) && qs.length > 0 ? (qs as FormQuestion[]) : DEFAULT_QUESTIONS);
        setLoadingForm(false);
      });
  }, [opp.slug]);

  useEffect(() => {
    if (!profileReady) return;
    const draft = localStorage.getItem(DRAFT_KEY(opp.slug));
    const saved: Partial<FormState> = draft ? JSON.parse(draft) : {};
    setForm({
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

  const hasBlock = useCallback((type: string) => questions.some((q) => q.type === type), [questions]);

  function validate(): boolean {
    const e: Partial<Record<keyof FormState, string>> = {};
    const ce: Record<string, string> = {};

    if (hasBlock("block_contacts")) {
      if (!form.country.trim()) e.country = "Обов'язкове поле";
    }
    if (hasBlock("block_education")) {
      if (!form.institution.trim()) e.institution = "Обов'язкове поле";
      if (!form.degree.trim()) e.degree = "Оберіть ступінь";
    }
    if (hasBlock("block_motivation")) {
      const len = form.motivation.trim().length;
      if (len < 300) e.motivation = `Мінімум 300 символів (зараз ${len})`;
      else if (len > 2000) e.motivation = `Максимум 2000 символів (зараз ${len})`;
    }

    for (const q of questions) {
      if (!q.type.startsWith("block_") && q.required) {
        const ans = customAnswers[q.id];
        const empty = !ans || (Array.isArray(ans) ? ans.length === 0 : !(ans as string).trim());
        if (empty) ce[q.id] = "Обов'язкове поле";
      }
    }

    setErrors(e);
    setCustomErrors(ce);
    return Object.keys(e).length === 0 && Object.keys(ce).length === 0;
  }

  async function handleSubmit() {
    if (!validate() || !user) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submit({
        opportunitySlug:  opp.slug,
        opportunityTitle: opp.title,
        org:              opp.org,
        deadline:         opp.deadline,
        firstName:        profile.firstName,
        lastName:         profile.lastName,
        email:            profile.email || user.email || "",
        phone:            form.phone,
        country:          form.country,
        institution:      form.institution,
        degree:           form.degree,
        graduationYear:   form.graduationYear,
        languages:        form.languages.split(",").map((l) => l.trim()).filter(Boolean),
        motivation:       form.motivation,
        cvUrl:            form.cvUrl,
        portfolioUrl:     form.portfolioUrl,
        customAnswers:    Object.keys(customAnswers).length > 0 ? customAnswers : undefined,
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

  const inp = (field: keyof FormState) =>
    `w-full px-3.5 py-2.5 text-sm rounded-xl border ${errors[field] ? "border-red-300 focus:ring-red-200 focus:border-red-400" : "border-border focus:ring-primary/20 focus:border-primary"} bg-white focus:outline-none focus:ring-2 transition-all`;
  const cinp = (id: string) =>
    `w-full px-3.5 py-2.5 text-sm rounded-xl border ${customErrors[id] ? "border-red-300 focus:ring-red-200 focus:border-red-400" : "border-border focus:ring-primary/20 focus:border-primary"} bg-white focus:outline-none focus:ring-2 transition-all`;
  const lbl = "block text-sm font-medium text-foreground mb-1.5";

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

  if (submitted) {
    return (
      <div className="text-center py-8 px-4">
        <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-5xl animate-bounce">🎉</div>
        <h3 className="text-xl font-black text-foreground mb-2">Заявку надіслано!</h3>
        <p className="text-sm text-muted">Організатор розгляне вашу заявку та повідомить вас про рішення</p>
      </div>
    );
  }

  if (authLoading || !profileReady || loadingForm) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-7 h-7 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || "Ви";
  const displayEmail = profile.email || user?.email || "";
  const initials = (profile.firstName?.[0] ?? "") + (profile.lastName?.[0] ?? "");

  return (
    <div>
      {/* Identity — read-only */}
      <div className="mb-6 flex items-center gap-3 bg-muted-bg rounded-2xl px-4 py-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#3B4FE8,#7C3AED)" }}>
          {initials || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground leading-tight">{displayName}</p>
          <p className="text-xs text-muted truncate">{displayEmail}</p>
        </div>
        <a href="/cabinet/profile" target="_blank" rel="noopener noreferrer"
          className="text-xs text-muted hover:text-primary transition-colors flex-shrink-0">
          Змінити
        </a>
      </div>

      {/* Form questions */}
      <div className="flex flex-col gap-7">
        {questions.map((q) => {
          /* ── block_contacts ── */
          if (q.type === "block_contacts") return (
            <div key={q.id} className="flex flex-col gap-4">
              <p className="text-sm font-bold text-foreground border-b border-border pb-2">{q.label}</p>
              <div>
                <label className={lbl}>Телефон</label>
                <input value={form.phone} onChange={(e) => set("phone", e.target.value)}
                  placeholder="+380..." className={inp("phone")} />
              </div>
              <div>
                <label className={lbl}>Країна *</label>
                <input value={form.country} onChange={(e) => set("country", e.target.value)}
                  placeholder="Україна" className={inp("country")} />
                {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country}</p>}
              </div>
            </div>
          );

          /* ── block_education ── */
          if (q.type === "block_education") return (
            <div key={q.id} className="flex flex-col gap-4">
              <p className="text-sm font-bold text-foreground border-b border-border pb-2">{q.label}</p>
              <div>
                <label className={lbl}>Університет / Заклад *</label>
                <input value={form.institution} onChange={(e) => set("institution", e.target.value)}
                  className={inp("institution")} />
                {errors.institution && <p className="text-xs text-red-500 mt-1">{errors.institution}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Ступінь *</label>
                  <select value={form.degree} onChange={(e) => set("degree", e.target.value)} className={inp("degree")}>
                    <option value="">Оберіть...</option>
                    {["Бакалавр", "Магістр", "Аспірант", "Студент (не бакалавр)", "Доктор наук", "Інше"].map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  {errors.degree && <p className="text-xs text-red-500 mt-1">{errors.degree}</p>}
                </div>
                <div>
                  <label className={lbl}>Рік закінчення</label>
                  <input value={form.graduationYear} onChange={(e) => set("graduationYear", e.target.value)}
                    placeholder="2026" className={inp("graduationYear")} />
                </div>
              </div>
              <div>
                <label className={lbl}>Мови (через кому)</label>
                <input value={form.languages} onChange={(e) => set("languages", e.target.value)}
                  placeholder="Англійська B2, Польська A2" className={inp("languages")} />
              </div>
            </div>
          );

          /* ── block_motivation ── */
          if (q.type === "block_motivation") {
            const len = form.motivation.trim().length;
            return (
              <div key={q.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-bold text-foreground">{q.label} *</p>
                  <span className={`text-xs font-semibold ${len < 300 ? "text-red-500" : len > 1800 ? "text-amber-600" : "text-green-600"}`}>
                    {len} / 2000
                  </span>
                </div>
                <textarea
                  value={form.motivation}
                  onChange={(e) => set("motivation", e.target.value)}
                  rows={9}
                  placeholder="Розкажіть, чому ви хочете взяти участь у цій програмі, який у вас досвід та які цілі..."
                  className={inp("motivation") + " resize-none"}
                />
                {errors.motivation && <p className="text-xs text-red-500 mt-1">{errors.motivation}</p>}
                <p className="text-xs text-muted mt-1">💾 Чернетка зберігається автоматично</p>
              </div>
            );
          }

          /* ── block_documents ── */
          if (q.type === "block_documents") return (
            <div key={q.id} className="flex flex-col gap-4">
              <p className="text-sm font-bold text-foreground border-b border-border pb-2">{q.label}</p>
              <div className="bg-primary-light rounded-xl p-3.5 text-sm text-primary font-medium">
                📎 Завантажте файли на Google Drive або Dropbox і вставте посилання нижче
              </div>
              <div>
                <label className={lbl}>Посилання на CV / резюме</label>
                <input value={form.cvUrl} onChange={(e) => set("cvUrl", e.target.value)}
                  placeholder="https://drive.google.com/..." className={inp("cvUrl")} />
              </div>
              <div>
                <label className={lbl}>Портфоліо / додаткові матеріали</label>
                <input value={form.portfolioUrl} onChange={(e) => set("portfolioUrl", e.target.value)}
                  placeholder="https://..." className={inp("portfolioUrl")} />
              </div>
            </div>
          );

          /* ── custom question ── */
          const ans = customAnswers[q.id];
          return (
            <div key={q.id}>
              <label className={lbl}>{q.label}{q.required && " *"}</label>
              {q.description && <p className="text-xs text-muted mb-2">{q.description}</p>}

              {q.type === "text" && (
                <input value={(ans as string) ?? ""} onChange={(e) => setCustomAnswer(q.id, e.target.value)}
                  placeholder={q.placeholder ?? ""} className={cinp(q.id)} />
              )}
              {q.type === "textarea" && (
                <textarea value={(ans as string) ?? ""} onChange={(e) => setCustomAnswer(q.id, e.target.value)}
                  placeholder={q.placeholder ?? ""} rows={4} className={cinp(q.id) + " resize-none"} />
              )}
              {q.type === "select" && (
                <select value={(ans as string) ?? ""} onChange={(e) => setCustomAnswer(q.id, e.target.value)}
                  className={cinp(q.id)}>
                  <option value="">Оберіть...</option>
                  {q.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              )}
              {q.type === "radio" && (
                <div className="flex flex-col gap-2 mt-1">
                  {q.options?.map((o) => (
                    <label key={o} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name={q.id} value={o} checked={(ans as string) === o}
                        onChange={() => setCustomAnswer(q.id, o)} className="accent-primary" />
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
                          setCustomAnswer(q.id, e.target.checked ? [...current, o] : current.filter((x) => x !== o));
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

      {submitError && (
        <div className="mt-5 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {submitError}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-8 pt-5 border-t border-border gap-3">
        <button onClick={onClose}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted-bg transition-all">
          Скасувати
        </button>
        <button onClick={handleSubmit} disabled={submitting}
          className="px-6 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-50 transition-all shadow-sm shadow-primary/20 flex items-center gap-2">
          {submitting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          {submitting ? "Надсилаємо..." : "Надіслати заявку →"}
        </button>
      </div>
    </div>
  );
}
