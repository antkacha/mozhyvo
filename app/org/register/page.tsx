"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

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

const inp = "w-full px-4 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white";

// ─── Left brand panel ──────────────────────────────────────────────────────

function LeftPanel({ format }: { format: Format }) {
  const features =
    format === "informal"
      ? [
          { icon: "🤝", text: "Реєстрація без офіційних документів" },
          { icon: "📣", text: "Розміщуйте активності та події безкоштовно" },
          { icon: "✅", text: "Ручна перевірка — ми зв'яжемось особисто" },
        ]
      : [
          { icon: "🏆", text: "Верифікований значок підвищує довіру учасників" },
          { icon: "📋", text: "Заявки від кандидатів в одному кабінеті" },
          { icon: "🚀", text: "Публікуйте програми для тисяч молодих людей" },
        ];

  return (
    <div className="relative hidden lg:flex lg:w-[42%] xl:w-[38%] bg-primary flex-col justify-between p-10 xl:p-14 overflow-hidden flex-shrink-0">
      {/* Dot grid */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Yellow glow */}
      <div
        aria-hidden
        className="absolute -top-20 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,214,0,0.13) 0%, transparent 60%)" }}
      />
      {/* White glow */}
      <div
        aria-hidden
        className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 65%)" }}
      />

      {/* Logo */}
      <div className="relative z-10">
        <Link href="/" className="inline-block">
          <Image
            src="/logo.png"
            alt="Моживо"
            width={120}
            height={40}
            className="h-9 w-auto brightness-0 invert"
          />
        </Link>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col gap-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/20 bg-white/10 text-white/80 text-xs font-semibold mb-5">
            <span className="text-accent">✦</span>
            {format === "informal" ? "Для неформальних ініціатив" : "Для організацій"}
          </div>
          <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight">
            Розміщуйте<br />
            <span className="text-accent">свої програми</span>
          </h2>
          <p className="text-white/55 text-sm mt-3 leading-relaxed max-w-xs">
            Тисячі молодих людей шукають можливості саме зараз. Станьте частиною платформи.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {features.map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-base flex-shrink-0">
                {icon}
              </div>
              <p className="text-white/70 text-sm">{text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10">
        <p className="text-white/40 text-xs">
          Вже є акаунт?{" "}
          <Link href="/login" className="text-accent font-semibold hover:text-accent/80 transition-colors">
            Увійти →
          </Link>
        </p>
      </div>
    </div>
  );
}

// ─── Mobile top header ─────────────────────────────────────────────────────

function MobileHeader() {
  return (
    <div className="lg:hidden bg-primary px-6 pt-8 pb-10 relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      <Link href="/" className="relative z-10 inline-block">
        <Image src="/logo.png" alt="Моживо" width={100} height={32} className="h-8 w-auto brightness-0 invert" />
      </Link>
      <p className="relative z-10 text-white/55 text-sm mt-1">Реєстрація організації</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────

export default function OrgRegisterPage() {
  const supabase = useMemo(() => createClient(), []);

  const [format, setFormat] = useState<Format>("");
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [type, setType] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [description, setDescription] = useState("");

  const [instagram, setInstagram] = useState("");
  const [telegram, setTelegram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [reviewLetter, setReviewLetter] = useState("");

  const STEPS = format === "official" ? STEPS_OFFICIAL : STEPS_INFORMAL;
  const isOfficial = format === "official";

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (isOfficial) {
      if (step === 0) {
        if (!name.trim()) e.name = "Вкажіть назву організації";
        if (!type) e.type = "Оберіть тип";
        if (!country.trim()) e.country = "Вкажіть країну";
      }
      if (step === 1) {
        if (description.trim().length < 30) e.description = "Мінімум 30 символів";
      }
    } else {
      if (step === 0) {
        if (!name.trim()) e.name = "Вкажіть назву групи";
        if (!country.trim()) e.country = "Вкажіть країну";
        if (!instagram.trim() && !telegram.trim() && !facebook.trim() && !website.trim())
          e.socials = "Додайте хоча б одне посилання";
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setStatus("loading");
    setErrorMsg("");

    const metadata =
      isOfficial
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

    // Send branded verification email via Resend
    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        role: "org",
        orgName: name,
        orgFormat: format,
      }),
    }).catch(() => {});

    setStatus("success");
  }

  // ─── Shared layout wrapper ─────────────────────────────────────────────

  function Layout({ children }: { children: React.ReactNode }) {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row">
        <LeftPanel format={format} />
        <div className="flex-1 flex flex-col min-h-screen overflow-y-auto bg-[#f7f8fc]">
          <MobileHeader />
          <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 lg:py-16 -mt-4 lg:mt-0">
            <div className="w-full max-w-[500px]">
              {children}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Success ──────────────────────────────────────────────────────────────

  if (status === "success") {
    return (
      <Layout>
        <div className="bg-white rounded-2xl shadow-sm border border-border/60 p-8">
          {isOfficial ? (
            <>
              <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h1 className="text-xl font-black text-foreground text-center mb-1">Акаунт створено!</h1>
              <p className="text-sm text-muted text-center leading-relaxed mb-6">
                Підтвердіть email, перейшовши за посиланням у листі на{" "}
                <strong className="text-foreground">{email}</strong>. Після підтвердження ваш профіль потрапить на верифікацію.
              </p>
              <div className="flex flex-col gap-3 mb-6">
                {[
                  { icon: "✉️", text: "Підтвердіть email за посиланням у листі" },
                  { icon: "🔍", text: "Наша команда перевірить дані вашої організації" },
                  { icon: "⏱️", text: "Верифікація займає 1–3 робочих дні" },
                  { icon: "🎉", text: "Після верифікації зможете публікувати програми" },
                ].map(({ icon, text }, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-[#f7f8fc] rounded-xl">
                    <span className="text-base flex-shrink-0">{icon}</span>
                    <p className="text-xs text-muted leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-700">
                Якщо у нас виникнуть питання — зв&apos;яжемось з вами на вказаний email.
              </div>
            </>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-xl font-black text-foreground text-center mb-1">Запит отримано!</h1>
              <p className="text-sm text-muted text-center leading-relaxed mb-6">
                Ми отримали вашу заявку і розглянемо її вручну. Очікуйте відповіді на{" "}
                <strong className="text-foreground">{email}</strong>.
              </p>
              <div className="flex flex-col gap-3 mb-6">
                {[
                  { icon: "✉️", text: "Підтвердіть email за посиланням у листі" },
                  { icon: "👀", text: "Наша команда перегляне вашу заявку та соцмережі" },
                  { icon: "📬", text: "Ви отримаєте листа з рішенням на вказаний email" },
                  { icon: "🚀", text: "Після схвалення зможете розміщувати активності" },
                ].map(({ icon, text }, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-[#f7f8fc] rounded-xl">
                    <span className="text-base flex-shrink-0">{icon}</span>
                    <p className="text-xs text-muted leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-700">
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
      </Layout>
    );
  }

  // ─── Format selection ──────────────────────────────────────────────────────

  if (!format) {
    return (
      <Layout>
        <div className="bg-white rounded-2xl shadow-sm border border-border/60 p-7 lg:p-8">
          <h1 className="text-xl font-bold text-foreground mb-1">Реєстрація організації</h1>
          <p className="text-sm text-muted mb-6">Оберіть тип — від цього залежить процес верифікації</p>

          <div className="flex flex-col gap-3">
            {/* Official */}
            <button
              type="button"
              onClick={() => { setFormat("official"); setStep(0); }}
              className="group w-full text-left border-2 border-border hover:border-primary rounded-2xl p-5 transition-all hover:bg-primary-light/30"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-bold text-foreground text-sm">Офіційна організація</p>
                    <span className="text-xs bg-primary/10 text-primary font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0">
                      1–3 дні
                    </span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    НГО, фонд, університет — зареєстрована юридично, є офіційні документи.
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {["НГО", "Фонд", "Університет", "Держустанова"].map((t) => (
                      <span key={t} className="text-xs text-muted bg-[#f7f8fc] px-2 py-0.5 rounded-md border border-border">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </button>

            {/* Informal */}
            <button
              type="button"
              onClick={() => { setFormat("informal"); setStep(0); }}
              className="group w-full text-left border-2 border-border hover:border-emerald-500 rounded-2xl p-5 transition-all hover:bg-emerald-50/50"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-100 transition-colors">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="font-bold text-foreground text-sm">Неформальна ініціатива</p>
                    <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0">
                      Ручна перевірка
                    </span>
                  </div>
                  <p className="text-xs text-muted leading-relaxed">
                    Молодіжна група, команда волонтерів чи спільнота без офіційної реєстрації.
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {["Волонтери", "Спільнота", "Молодіжна група", "Ініціатива"].map((t) => (
                      <span key={t} className="text-xs text-muted bg-[#f7f8fc] px-2 py-0.5 rounded-md border border-border">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            </button>
          </div>

          <p className="text-center text-sm text-muted mt-6">
            Вже є акаунт?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">Увійти</Link>
          </p>
        </div>
      </Layout>
    );
  }

  // ─── Multi-step form ───────────────────────────────────────────────────────

  const stepDotActive = isOfficial
    ? "bg-primary text-white ring-4 ring-primary/20"
    : "bg-emerald-600 text-white ring-4 ring-emerald-500/20";
  const stepDotDone = isOfficial ? "bg-primary text-white" : "bg-emerald-600 text-white";
  const stepLine = isOfficial ? "bg-primary" : "bg-emerald-500";
  const btnPrimary = isOfficial
    ? "flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-all disabled:opacity-60"
    : "flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm hover:bg-emerald-700 transition-all disabled:opacity-60";

  return (
    <Layout>
      {/* Track label + change */}
      <div className="flex items-center justify-between mb-5 px-1">
        <p className="text-sm text-muted">
          <span className="font-semibold text-foreground">
            {isOfficial ? "Офіційна організація" : "Неформальна ініціатива"}
          </span>
        </p>
        <button
          type="button"
          onClick={() => { setFormat(""); setStep(0); setErrors({}); }}
          className="text-xs text-primary hover:underline font-medium"
        >
          Змінити
        </button>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mb-5">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
              i < step ? stepDotDone : i === step ? stepDotActive : "bg-white border border-border text-muted"
            }`}>
              {i < step ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i === step ? "text-foreground" : "text-muted"}`}>
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 rounded transition-all ${i < step ? stepLine : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-2xl shadow-sm border border-border/60 p-7 lg:p-8 flex flex-col gap-4">

          {/* ── OFFICIAL step 0 ─────────────────────────── */}
          {isOfficial && step === 0 && (
            <>
              <div className="mb-1">
                <h2 className="text-lg font-bold text-foreground">Дані організації</h2>
                <p className="text-xs text-muted mt-0.5">Ці дані будуть відображатись публічно</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Назва організації <span className="text-red-500">*</span>
                </label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder='Фонд "Молодь України"' className={inp} />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Тип організації <span className="text-red-500">*</span>
                </label>
                <select value={type} onChange={(e) => setType(e.target.value)} className={inp}>
                  <option value="">Оберіть тип...</option>
                  {ORG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Країна <span className="text-red-500">*</span>
                  </label>
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
                  <span className="ml-1.5 text-xs font-normal text-muted">(необов&apos;язково)</span>
                </label>
                <input value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} placeholder="12345678" className={inp} />
                <p className="text-xs text-muted mt-1">Допомагає прискорити верифікацію</p>
              </div>
            </>
          )}

          {/* ── OFFICIAL step 1 ─────────────────────────── */}
          {isOfficial && step === 1 && (
            <>
              <div className="mb-1">
                <h2 className="text-lg font-bold text-foreground">Опис організації</h2>
                <p className="text-xs text-muted mt-0.5">Відображатиметься на вашій публічній сторінці</p>
              </div>
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
              <div className="bg-primary-light/50 border border-primary/10 rounded-xl p-3.5">
                <p className="text-xs text-primary font-semibold mb-0.5">Після верифікації</p>
                <p className="text-xs text-muted leading-relaxed">
                  Опис побачать учасники на сторінці організації та в кожній програмі.
                </p>
              </div>
            </>
          )}

          {/* ── INFORMAL step 0 ─────────────────────────── */}
          {!isOfficial && step === 0 && (
            <>
              <div className="mb-1">
                <h2 className="text-lg font-bold text-foreground">Про вашу групу</h2>
                <p className="text-xs text-muted mt-0.5">Розкажіть, хто ви і де вас знайти</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Назва групи / ініціативи <span className="text-red-500">*</span>
                </label>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder='Молодіжна ініціатива "Разом"' className={inp} />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Країна <span className="text-red-500">*</span>
                  </label>
                  <input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Україна" className={inp} />
                  {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Місто</label>
                  <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Київ" className={inp} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Соціальні мережі <span className="text-red-500">*</span>
                  <span className="ml-1.5 text-xs font-normal text-muted">хоча б одне</span>
                </label>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center border border-border rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
                    <span className="px-3 text-xs text-muted bg-[#f7f8fc] border-r border-border py-2.5 flex-shrink-0 whitespace-nowrap">instagram.com/</span>
                    <input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="yourgroup" className="flex-1 px-3 py-2.5 text-sm outline-none bg-white" />
                  </div>
                  <div className="flex items-center border border-border rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
                    <span className="px-3 text-xs text-muted bg-[#f7f8fc] border-r border-border py-2.5 flex-shrink-0">t.me/</span>
                    <input value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder="yourgroup" className="flex-1 px-3 py-2.5 text-sm outline-none bg-white" />
                  </div>
                  <div className="flex items-center border border-border rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all">
                    <span className="px-3 text-xs text-muted bg-[#f7f8fc] border-r border-border py-2.5 flex-shrink-0 whitespace-nowrap">facebook.com/</span>
                    <input value={facebook} onChange={(e) => setFacebook(e.target.value)} placeholder="yourgroup" className="flex-1 px-3 py-2.5 text-sm outline-none bg-white" />
                  </div>
                  <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="Сайт (якщо є)" className={inp} />
                </div>
                {errors.socials && <p className="text-xs text-red-500 mt-1">{errors.socials}</p>}
              </div>
            </>
          )}

          {/* ── INFORMAL step 1 ─────────────────────────── */}
          {!isOfficial && step === 1 && (
            <>
              <div className="mb-1">
                <h2 className="text-lg font-bold text-foreground">Розкажіть про себе</h2>
                <p className="text-xs text-muted mt-0.5">Ми розглянемо заявку вручну — чим більше деталей, тим краще</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Лист-заявка <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reviewLetter}
                  onChange={(e) => setReviewLetter(e.target.value)}
                  rows={8}
                  placeholder={"Розкажіть:\n– Хто ви і чим займаєтесь?\n– Яка ваша місія або мета?\n– З якою аудиторією працюєте?\n– Які активності плануєте розміщувати?\n– Чому хочете бути на Моживо?"}
                  className={`${inp} resize-none leading-relaxed`}
                />
                <p className="text-xs text-muted mt-1">{reviewLetter.length} символів · мінімум 100</p>
                {errors.reviewLetter && <p className="text-xs text-red-500 mt-1">{errors.reviewLetter}</p>}
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5">
                <p className="text-xs font-semibold text-emerald-700 mb-0.5">Що буде далі?</p>
                <p className="text-xs text-emerald-600 leading-relaxed">
                  Після реєстрації ми переглянемо ваш профіль і соцмережі та зв&apos;яжемося з вами протягом 5 робочих днів.
                </p>
              </div>
            </>
          )}

          {/* ── ACCOUNT step 2 (shared) ──────────────────── */}
          {step === 2 && (
            <>
              <div className="mb-1">
                <h2 className="text-lg font-bold text-foreground">Дані для входу</h2>
                <p className="text-xs text-muted mt-0.5">На цей email прийде підтвердження</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Email <span className="text-red-500">*</span>
                </label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@your-org.com" autoComplete="email" className={inp} />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Пароль <span className="text-red-500">*</span>
                </label>
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
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Підтвердити пароль <span className="text-red-500">*</span>
                </label>
                <input
                  type={showPass ? "text" : "password"}
                  value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторіть пароль" autoComplete="new-password"
                  className={inp}
                />
                {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
              </div>
              {errorMsg && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 leading-relaxed">
                  {errorMsg}
                </div>
              )}
            </>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-3 border-t border-border mt-1">
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
              <button type="button" onClick={next} className={btnPrimary}>
                Далі
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button type="submit" disabled={status === "loading"} className={btnPrimary}>
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
    </Layout>
  );
}
