"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

import { createClient } from "@/lib/supabase/client";
import { LogoMark } from "@/components/Header";

const ORG_TYPES = [
  "НГО / Громадська організація",
  "Міжнародна організація",
  "Освітня установа",
  "Грантовий фонд",
  "Державна установа",
  "Бізнес-асоціація",
  "Молодіжна організація",
  "Інша",
];

const STEPS = ["Організація", "Контакти", "Акаунт"] as const;

export default function OrgRegisterPage() {
  const supabase = useMemo(() => createClient(), []);


  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Step 0
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [website, setWebsite] = useState("");
  // Step 1
  const [description, setDescription] = useState("");
  // Step 2
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const inp = "w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!name.trim()) e.name = "Вкажіть назву організації";
      if (!type) e.type = "Оберіть тип";
      if (!country.trim()) e.country = "Вкажіть країну";
    }
    if (step === 1) {
      if (description.trim().length < 30) e.description = "Мінімум 30 символів";
    }
    if (step === 2) {
      if (!email.includes("@")) e.email = "Невірний email";
      if (password.length < 8) e.password = "Мінімум 8 символів";
      if (password !== confirmPassword) e.confirmPassword = "Паролі не збігаються";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (!validate()) return;
    setStep((s) => s + 1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("loading");
    setErrorMsg("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        data: {
          role:            "org",
          org_name:        name,
          org_type:        type,
          org_country:     country,
          org_city:        city,
          org_website:     website,
          org_description: description,
        },
      },
    });

    if (error) {
      setErrorMsg(
        error.message.includes("already registered")
          ? "Цей email вже зареєстрований. Спробуйте увійти."
          : error.message
      );
      setStatus("error");
      return;
    }

    setStatus("success");
  }

  if (status === "success") {
    return (
      <div className="min-h-[88vh] flex items-center justify-center px-4 py-16 bg-muted-bg">
        <div className="w-full max-w-[420px] text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-xl font-black text-foreground mb-2">Перевірте пошту</h1>
          <p className="text-sm text-muted leading-relaxed mb-6">
            Ми надіслали листа на <strong>{email}</strong>. Перейдіть за посиланням у листі, щоб підтвердити акаунт і потрапити в кабінет.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-left mb-6">
            <p className="text-xs font-semibold text-amber-700 mb-1">Що далі?</p>
            <ol className="text-xs text-amber-600 space-y-1 list-decimal list-inside">
              <li>Підтвердіть email за посиланням у листі</li>
              <li>Ви потрапите в кабінет організації</li>
              <li>Наш адмін верифікує вашу організацію (1–3 дні)</li>
              <li>Після верифікації ваші проекти стають публічними</li>
            </ol>
          </div>
          <Link href="/" className="text-sm text-muted hover:text-primary transition-colors">
            ← Повернутись на головну
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[88vh] flex items-center justify-center px-4 py-16 bg-muted-bg">
      <div className="w-full max-w-[480px]">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group mb-4">
            <LogoMark />
            <span className="text-xl font-black text-foreground group-hover:text-primary transition-colors">Моживо</span>
          </Link>
          <h1 className="text-xl font-bold text-foreground">Реєстрація організації</h1>
          <p className="text-sm text-muted mt-1">Розміщуйте можливості для молоді України</p>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-7">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                i < step ? "bg-primary text-white" : i === step ? "bg-primary text-white ring-4 ring-primary/20" : "bg-muted-bg border border-border text-muted"
              }`}>
                {i < step ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i === step ? "text-foreground" : "text-muted"}`}>{label}</span>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl border border-border shadow-sm p-7 flex flex-col gap-4">

            {/* Step 0: Org info */}
            {step === 0 && (
              <>
                <h2 className="text-base font-bold text-foreground">Про організацію</h2>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Назва організації <span className="text-red-500">*</span></label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Фонд «Молодь України»" className={inp} />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Тип організації <span className="text-red-500">*</span></label>
                  <select value={type} onChange={(e) => setType(e.target.value)} className={inp}>
                    <option value="">Оберіть тип...</option>
                    {ORG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Країна <span className="text-red-500">*</span></label>
                    <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Україна" className={inp} />
                    {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Місто</label>
                    <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Київ" className={inp} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Сайт</label>
                  <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://your-org.com" className={inp} />
                </div>
              </>
            )}

            {/* Step 1: Description */}
            {step === 1 && (
              <>
                <h2 className="text-base font-bold text-foreground">Опис організації</h2>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Коротко про організацію <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    placeholder="Розкажіть, чим займається ваша організація, яку місію виконує, з якою молоддю працює..."
                    className={`${inp} resize-none leading-relaxed`}
                  />
                  <p className="text-xs text-muted mt-1">{description.length} символів · мінімум 30</p>
                  {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                </div>
                <div className="bg-primary-light/50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-primary mb-1">Після верифікації</p>
                  <p className="text-xs text-muted leading-relaxed">
                    Опис буде відображатись на публічній сторінці вашої організації та у кожній програмі.
                  </p>
                </div>
              </>
            )}

            {/* Step 2: Account */}
            {step === 2 && (
              <>
                <h2 className="text-base font-bold text-foreground">Дані для входу</h2>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Email <span className="text-red-500">*</span></label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@your-org.com" autoComplete="email" className={inp} />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Пароль <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={password} onChange={(e) => setPassword(e.target.value)}
                      placeholder="Мінімум 8 символів" autoComplete="new-password"
                      className={`${inp} pr-11`}
                    />
                    <button type="button" onClick={() => setShowPass((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors">
                      {showPass
                        ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      }
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Підтвердити пароль <span className="text-red-500">*</span></label>
                  <input
                    type={showPass ? "text" : "password"}
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Повторіть пароль" autoComplete="new-password"
                    className={inp}
                  />
                  {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
                </div>
                {errorMsg && (
                  <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                    {errorMsg}
                  </div>
                )}
              </>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-2 border-t border-border mt-2">
              {step > 0 ? (
                <button type="button" onClick={() => setStep((s) => s - 1)} className="text-sm text-muted hover:text-foreground transition-colors flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  Назад
                </button>
              ) : (
                <Link href="/login" className="text-sm text-muted hover:text-primary transition-colors">
                  Вже є акаунт
                </Link>
              )}

              {step < STEPS.length - 1 ? (
                <button type="button" onClick={next} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-all">
                  Далі
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-all disabled:opacity-60"
                >
                  {status === "loading" ? (
                    <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Реєстрація...</>
                  ) : "Зареєструватись"}
                </button>
              )}
            </div>
          </div>
        </form>

        <p className="text-center text-xs text-muted mt-5">
          Вже є акаунт?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">Увійти</Link>
        </p>
      </div>
    </div>
  );
}
