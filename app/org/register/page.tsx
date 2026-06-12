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

const STEPS_OFFICIAL = ["Дані", "Опис", "Акаунт"] as const;
const STEPS_INFORMAL = ["Про групу", "Заявка", "Акаунт"] as const;

type Format = "" | "official" | "informal";

export default function OrgRegisterPage() {
  const supabase = useMemo(() => createClient(), []);

  const [format, setFormat] = useState<Format>("");
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Shared fields
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Official-only
  const [type, setType] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [description, setDescription] = useState("");

  // Informal-only
  const [instagram, setInstagram] = useState("");
  const [telegram, setTelegram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [reviewLetter, setReviewLetter] = useState("");

  const STEPS = format === "official" ? STEPS_OFFICIAL : STEPS_INFORMAL;

  const inp = "w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (format === "official") {
      if (step === 0) {
        if (!name.trim()) e.name = "Вкажіть назву організації";
        if (!type) e.type = "Оберіть тип";
        if (!country.trim()) e.country = "Вкажіть країну";
      }
      if (step === 1) {
        if (description.trim().length < 30) e.description = "Мінімум 30 символів";
      }
    }
    if (format === "informal") {
      if (step === 0) {
        if (!name.trim()) e.name = "Вкажіть назву групи";
        if (!country.trim()) e.country = "Вкажіть країну";
        if (!instagram.trim() && !telegram.trim() && !facebook.trim() && !website.trim())
          e.socials = "Додайте хоча б одне посилання на соцмережу або сайт";
      }
      if (step === 1) {
        if (reviewLetter.trim().length < 100) e.reviewLetter = "Мінімум 100 символів";
      }
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

  function chooseFormat(f: "official" | "informal") {
    setFormat(f);
    setStep(0);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("loading");
    setErrorMsg("");

    const metadata =
      format === "official"
        ? {
            role: "org",
            org_format: "official",
            org_name: name,
            org_type: type,
            org_country: country,
            org_city: city,
            org_website: website,
            org_registration_number: registrationNumber,
            org_description: description,
          }
        : {
            role: "org",
            org_format: "informal",
            org_name: name,
            org_country: country,
            org_city: city,
            org_website: website,
            org_description: reviewLetter,
            org_instagram: instagram,
            org_telegram: telegram,
            org_facebook: facebook,
          };

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        data: metadata,
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

  // ─── Success screens ───────────────────────────────────────────────────────

  if (status === "success") {
    return (
      <div className="min-h-[88vh] flex items-center justify-center px-4 py-16 bg-muted-bg">
        <div className="w-full max-w-[440px]">
          {format === "official" ? (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary-light flex items-center justify-center mx-auto mb-5">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h1 className="text-xl font-black text-foreground mb-2">Акаунт створено!</h1>
                <p className="text-sm text-muted leading-relaxed">
                  Підтвердіть email, перейшовши за посиланням у листі на <strong>{email}</strong>. Після підтвердження ваш профіль потрапить на верифікацію.
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-border shadow-sm p-5 mb-5">
                <p className="text-xs font-bold text-foreground mb-4">Що відбудеться далі</p>
                <div className="flex flex-col gap-3">
                  {[
                    { icon: "✉️", text: "Підтвердіть email за посиланням у листі" },
                    { icon: "🔍", text: "Наша команда перевірить дані вашої організації" },
                    { icon: "⏱️", text: "Верифікація займає від 1 до 3 робочих днів" },
                    { icon: "🎉", text: "Після верифікації зможете публікувати програми" },
                  ].map(({ icon, text }, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-base flex-shrink-0 mt-0.5">{icon}</span>
                      <p className="text-xs text-muted leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-700">
                Якщо у нас виникнуть питання — зв'яжемось з вами на вказаний email.
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
                  <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="text-xl font-black text-foreground mb-2">Запит отримано!</h1>
                <p className="text-sm text-muted leading-relaxed">
                  Ми отримали вашу заявку і розглянемо її вручну. Очікуйте відповіді на <strong>{email}</strong>.
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-border shadow-sm p-5 mb-5">
                <p className="text-xs font-bold text-foreground mb-4">Що відбудеться далі</p>
                <div className="flex flex-col gap-3">
                  {[
                    { icon: "✉️", text: "Підтвердіть email за посиланням у листі" },
                    { icon: "👀", text: "Наша команда перегляне вашу заявку та соцмережі" },
                    { icon: "📬", text: "Ви отримаєте листа з рішенням на вказаний email" },
                    { icon: "🚀", text: "Після схвалення зможете розміщувати ваші активності" },
                  ].map(({ icon, text }, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-base flex-shrink-0 mt-0.5">{icon}</span>
                      <p className="text-xs text-muted leading-relaxed">{text}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-700">
                Розгляд займає до 5 робочих днів. Якщо потрібна додаткова інформація — ми напишемо.
              </div>
            </>
          )}
          <div className="text-center mt-6">
            <Link href="/" className="text-sm text-muted hover:text-primary transition-colors">
              ← Повернутись на головну
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Format selection screen ───────────────────────────────────────────────

  if (!format) {
    return (
      <div className="min-h-[88vh] flex items-center justify-center px-4 py-16 bg-muted-bg">
        <div className="w-full max-w-[520px]">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 group mb-4">
              <LogoMark />
              <span className="text-xl font-black text-foreground group-hover:text-primary transition-colors">Моживо</span>
            </Link>
            <h1 className="text-xl font-bold text-foreground">Реєстрація організації</h1>
            <p className="text-sm text-muted mt-1">Розміщуйте можливості для молоді України</p>
          </div>

          <p className="text-sm font-semibold text-foreground mb-3 text-center">Який у вас тип організації?</p>

          <div className="flex flex-col gap-4">
            {/* Official */}
            <button
              type="button"
              onClick={() => chooseFormat("official")}
              className="group w-full text-left bg-white rounded-2xl border-2 border-border hover:border-primary shadow-sm p-6 transition-all hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-bold text-foreground">Офіційна організація</p>
                    <span className="text-xs bg-primary/10 text-primary font-semibold px-2.5 py-1 rounded-full flex-shrink-0">Верифікація 1-3 дні</span>
                  </div>
                  <p className="text-sm text-muted leading-relaxed">
                    НГО, фонд, освітня установа, міжнародна організація — зареєстрована юридично і має офіційні документи.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {["НГО", "Фонд", "Університет", "Держустанова"].map((t) => (
                      <span key={t} className="text-xs text-muted bg-muted-bg px-2 py-0.5 rounded-md">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </button>

            {/* Informal */}
            <button
              type="button"
              onClick={() => chooseFormat("informal")}
              className="group w-full text-left bg-white rounded-2xl border-2 border-border hover:border-emerald-500 shadow-sm p-6 transition-all hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-bold text-foreground">Неформальна ініціатива</p>
                    <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2.5 py-1 rounded-full flex-shrink-0">Ручна перевірка</span>
                  </div>
                  <p className="text-sm text-muted leading-relaxed">
                    Молодіжна група, команда волонтерів, спільнота або ініціатива без офіційної юридичної реєстрації.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {["Молодіжна група", "Волонтери", "Спільнота", "Ініціатива"].map((t) => (
                      <span key={t} className="text-xs text-muted bg-muted-bg px-2 py-0.5 rounded-md">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          </div>

          <p className="text-center text-xs text-muted mt-6">
            Вже є акаунт?{" "}
            <Link href="/login" className="text-primary font-semibold hover:underline">Увійти</Link>
          </p>
        </div>
      </div>
    );
  }

  // ─── Multi-step form ───────────────────────────────────────────────────────

  const isOfficial = format === "official";
  const accentClass = isOfficial ? "bg-primary text-white ring-primary/20" : "bg-emerald-600 text-white ring-emerald-500/20";
  const accentLine = isOfficial ? "bg-primary" : "bg-emerald-500";
  const btnClass = isOfficial
    ? "flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-all disabled:opacity-60"
    : "flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-all disabled:opacity-60";

  return (
    <div className="min-h-[88vh] flex items-center justify-center px-4 py-16 bg-muted-bg">
      <div className="w-full max-w-[500px]">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group mb-4">
            <LogoMark />
            <span className="text-xl font-black text-foreground group-hover:text-primary transition-colors">Моживо</span>
          </Link>
          <h1 className="text-xl font-bold text-foreground">Реєстрація організації</h1>
          <p className="text-sm text-muted mt-1">
            {isOfficial ? "Офіційна організація" : "Неформальна ініціатива"}
            {" · "}
            <button
              type="button"
              onClick={() => { setFormat(""); setStep(0); setErrors({}); }}
              className="text-primary hover:underline text-sm font-medium"
            >
              Змінити
            </button>
          </p>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-7">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                i < step
                  ? `${accentClass.split(" ").slice(0,2).join(" ")} ring-0`
                  : i === step
                  ? `${accentClass} ring-4`
                  : "bg-muted-bg border border-border text-muted"
              }`}>
                {i < step ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : i + 1}
              </div>
              <span className={`text-xs font-medium hidden sm:block ${i === step ? "text-foreground" : "text-muted"}`}>{label}</span>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? accentLine : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl border border-border shadow-sm p-7 flex flex-col gap-4">

            {/* ── OFFICIAL STEPS ─────────────────────────────── */}

            {isOfficial && step === 0 && (
              <>
                <h2 className="text-base font-bold text-foreground">Дані організації</h2>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Назва організації <span className="text-red-500">*</span></label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder='Фонд "Молодь України"' className={inp} />
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
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Реєстраційний номер / ЄДРПОУ
                    <span className="ml-1.5 text-xs font-normal text-muted">(необов'язково)</span>
                  </label>
                  <input value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} placeholder="12345678" className={inp} />
                  <p className="text-xs text-muted mt-1">Допомагає нам швидше перевірити вашу організацію</p>
                </div>
              </>
            )}

            {isOfficial && step === 1 && (
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
                    Опис відображатиметься на публічній сторінці вашої організації та у кожній програмі.
                  </p>
                </div>
              </>
            )}

            {/* ── INFORMAL STEPS ─────────────────────────────── */}

            {!isOfficial && step === 0 && (
              <>
                <h2 className="text-base font-bold text-foreground">Про вашу групу</h2>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Назва групи / ініціативи <span className="text-red-500">*</span></label>
                  <input value={name} onChange={(e) => setName(e.target.value)} placeholder='Молодіжна ініціатива "Разом"' className={inp} />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
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
                  <label className="block text-sm font-medium text-foreground mb-1.5">Соціальні мережі та сайт <span className="text-red-500">*</span></label>
                  <div className="flex flex-col gap-2">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">instagram.com/</span>
                      <input
                        value={instagram}
                        onChange={(e) => setInstagram(e.target.value)}
                        placeholder="yourgroup"
                        className={`${inp} pl-[7.5rem]`}
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">t.me/</span>
                      <input
                        value={telegram}
                        onChange={(e) => setTelegram(e.target.value)}
                        placeholder="yourgroup"
                        className={`${inp} pl-[3.5rem]`}
                      />
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">facebook.com/</span>
                      <input
                        value={facebook}
                        onChange={(e) => setFacebook(e.target.value)}
                        placeholder="yourgroup"
                        className={`${inp} pl-[8rem]`}
                      />
                    </div>
                    <input
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="Сайт (якщо є)"
                      className={inp}
                    />
                  </div>
                  {errors.socials && <p className="text-xs text-red-500 mt-1">{errors.socials}</p>}
                </div>
              </>
            )}

            {!isOfficial && step === 1 && (
              <>
                <h2 className="text-base font-bold text-foreground">Розкажіть про себе</h2>
                <p className="text-xs text-muted -mt-1">Ми розглянемо вашу заявку вручну. Чим більше деталей — тим швидше.</p>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Лист-заявка <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reviewLetter}
                    onChange={(e) => setReviewLetter(e.target.value)}
                    rows={8}
                    placeholder={
                      "Розкажіть:\n" +
                      "– Хто ви і чим займаєтесь?\n" +
                      "– Яка ваша місія чи мета?\n" +
                      "– З якою аудиторією працюєте?\n" +
                      "– Які активності або програми плануєте розміщувати?\n" +
                      "– Чому хочете бути на Моживо?"
                    }
                    className={`${inp} resize-none leading-relaxed`}
                  />
                  <p className="text-xs text-muted mt-1">{reviewLetter.length} символів · мінімум 100</p>
                  {errors.reviewLetter && <p className="text-xs text-red-500 mt-1">{errors.reviewLetter}</p>}
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-emerald-700 mb-1">Що буде далі?</p>
                  <p className="text-xs text-emerald-600 leading-relaxed">
                    Після реєстрації ми переглянемо ваш профіль і соцмережі та зв'яжемося з вами на email протягом 5 робочих днів.
                  </p>
                </div>
              </>
            )}

            {/* ── ACCOUNT STEP (shared) ───────────────────────── */}

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
              <button
                type="button"
                onClick={() => step === 0 ? setFormat("") : setStep((s) => s - 1)}
                className="text-sm text-muted hover:text-foreground transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Назад
              </button>

              {step < STEPS.length - 1 ? (
                <button type="button" onClick={next} className={btnClass}>
                  Далі
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button type="submit" disabled={status === "loading"} className={btnClass}>
                  {status === "loading" ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Реєстрація...
                    </>
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
