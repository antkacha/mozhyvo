"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { OrgProfile } from "@/lib/demo-org";

type Role = "user" | "org";

const ORG_TYPES = [
  "НГО / Громадська організація",
  "Університет / Освітня установа",
  "Міжнародний фонд / Донор",
  "Компанія / Стартап",
  "Державна установа",
  "Інше",
];

const COUNTRIES = [
  "Україна", "Польща", "Германія", "США", "Велика Британія",
  "Франція", "Нідерланди", "Швеція", "Норвегія", "Данія",
  "Канада", "Австралія", "Інша",
];

function PasswordInput({
  value, onChange, placeholder, autoComplete,
}: {
  value: string; onChange: (v: string) => void; placeholder: string; autoComplete: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full px-4 py-2.5 pr-11 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
      >
        {show ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </button>
    </div>
  );
}

function Field({ label, error, hint, children }: {
  label: string; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-muted mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [role, setRole] = useState<Role>("user");

  // Step 2 — account
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  // Step 3 — org profile
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("");
  const [orgCountry, setOrgCountry] = useState("");
  const [orgCity, setOrgCity] = useState("");
  const [orgWebsite, setOrgWebsite] = useState("");
  const [orgDescription, setOrgDescription] = useState("");
  const [orgLogo, setOrgLogo] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [serverError, setServerError] = useState("");

  const totalSteps = role === "org" ? 3 : 2;

  const selectRole = (r: Role) => {
    setRole(r);
    setStep(2);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setOrgLogo(dataUrl);
      setLogoPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const validateStep2 = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Вкажи ім'я";
    if (!email.includes("@")) e.email = "Вкажи коректний email";
    if (password.length < 8) e.password = "Мінімум 8 символів";
    if (password !== confirmPassword) e.confirmPassword = "Паролі не збігаються";
    if (!agreed) e.agreed = "Необхідно погодитись з умовами";
    return e;
  };

  const validateStep3 = () => {
    const e: Record<string, string> = {};
    if (!orgName.trim()) e.orgName = "Вкажи назву організації";
    if (!orgType) e.orgType = "Обери тип організації";
    if (!orgCountry) e.orgCountry = "Вкажи країну";
    if (!orgCity.trim()) e.orgCity = "Вкажи місто";
    if (!orgDescription.trim()) e.orgDescription = "Додай короткий опис";
    return e;
  };

  const handleStep2Next = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateStep2();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    if (role === "org") {
      setStep(3);
    } else {
      handleSubmitUser();
    }
  };

  const handleSubmitUser = async () => {
    setStatus("loading");
    setServerError("");
    const nameParts = name.trim().split(" ");
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: nameParts[0] ?? "",
          last_name: nameParts.slice(1).join(" ") ?? "",
          role: "seeker",
        },
      },
    });
    if (error) {
      setServerError(
        error.message === "User already registered"
          ? "Цей email вже зареєстрований."
          : "Помилка реєстрації. Перевір дані і спробуй знову."
      );
      setStatus("error");
    } else {
      setStatus("success");
      setTimeout(() => router.push("/"), 2000);
    }
  };

  const handleSubmitOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateStep3();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setStatus("loading");
    setServerError("");

    const nameParts = name.trim().split(" ");
    const { data: authData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: nameParts[0] ?? "",
          last_name: nameParts.slice(1).join(" ") ?? "",
          role: "coordinator",
          org_name: orgName,
          org_type: orgType,
        },
      },
    });

    if (error) {
      setServerError(
        error.message === "User already registered"
          ? "Цей email вже зареєстрований."
          : "Помилка реєстрації. Перевір дані і спробуй знову."
      );
      setStatus("error");
      return;
    }

    // Save org profile to localStorage
    const orgProfile: OrgProfile = {
      id: authData.user?.id ?? `org-${Date.now()}`,
      name: orgName,
      type: orgType,
      country: orgCountry,
      city: orgCity,
      website: orgWebsite,
      contactEmail: email,
      description: orgDescription,
      logo: orgLogo,
      status: "pending",
      createdAt: new Date().toISOString().split("T")[0],
    };
    localStorage.setItem("mozhyvo_org_profile", JSON.stringify(orgProfile));

    setStatus("success");
    setTimeout(() => router.push("/dashboard"), 2000);
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center px-4 py-16 bg-muted-bg">
      <div className="w-full max-w-[480px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-1 group">
            <span className="text-2xl">⚡</span>
            <span className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">Моживо</span>
          </Link>
          <p className="text-sm text-muted mt-2">Приєднуйся до спільноти</p>
        </div>

        {/* Step indicators */}
        {step > 1 && (
          <div className="flex items-center justify-center gap-2 mb-6">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step > s ? "bg-primary text-white" : step === s ? "bg-primary text-white" : "bg-muted-bg border border-border text-muted"
                }`}>
                  {step > s ? (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : s}
                </div>
                {s < totalSteps && (
                  <div className={`w-10 h-0.5 transition-all ${step > s ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-border shadow-sm p-7">

          {/* ── Step 1: Role ── */}
          {step === 1 && (
            <>
              <h1 className="text-xl font-bold text-foreground mb-2 text-center">
                Як плануєш використовувати Моживо?
              </h1>
              <p className="text-sm text-muted text-center mb-6">Обери роль — від неї залежать можливості акаунту</p>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => selectRole("user")} className="group flex flex-col items-center gap-3 p-5 border-2 border-border rounded-2xl hover:border-primary hover:bg-primary-light transition-all duration-200">
                  <span className="text-4xl">👤</span>
                  <div className="text-center">
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">Шукаю можливості</p>
                    <p className="text-xs text-muted mt-1 leading-tight">Студент, активіст, волонтер</p>
                  </div>
                </button>
                <button onClick={() => selectRole("org")} className="group flex flex-col items-center gap-3 p-5 border-2 border-border rounded-2xl hover:border-primary hover:bg-primary-light transition-all duration-200">
                  <span className="text-4xl">🏢</span>
                  <div className="text-center">
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">Представляю організацію</p>
                    <p className="text-xs text-muted mt-1 leading-tight">НГО, фонд, університет</p>
                  </div>
                </button>
              </div>
            </>
          )}

          {/* ── Step 2: Account ── */}
          {step === 2 && status !== "success" && (
            <>
              <div className="flex items-center gap-3 mb-5">
                <button onClick={() => setStep(1)} className="text-muted hover:text-foreground transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-xl font-bold text-foreground">Створи акаунт</h1>
              </div>
              <form onSubmit={handleStep2Next} className="flex flex-col gap-4">
                <Field label="Ім'я та прізвище" error={errors.name}>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder={role === "org" ? "Ім'я представника" : "Іванна Шевченко"}
                    autoComplete="name"
                    className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white ${errors.name ? "border-red-400" : "border-border"}`}
                  />
                </Field>
                <Field label="Email" error={errors.email}>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com" autoComplete="email"
                    className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white ${errors.email ? "border-red-400" : "border-border"}`}
                  />
                </Field>
                <Field label="Пароль" error={errors.password}>
                  <PasswordInput value={password} onChange={setPassword} placeholder="Мінімум 8 символів" autoComplete="new-password" />
                </Field>
                <Field label="Підтвердити пароль" error={errors.confirmPassword}>
                  <PasswordInput value={confirmPassword} onChange={setConfirmPassword} placeholder="Повтори пароль" autoComplete="new-password" />
                </Field>
                <div>
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded border-border accent-primary cursor-pointer flex-shrink-0"
                    />
                    <span className="text-xs text-muted leading-relaxed">
                      Я погоджуюсь з{" "}
                      <Link href="#" className="text-primary hover:underline">Умовами використання</Link>{" "}
                      та{" "}
                      <Link href="#" className="text-primary hover:underline">Політикою конфіденційності</Link>
                    </span>
                  </label>
                  {errors.agreed && <p className="text-xs text-red-500 mt-1">{errors.agreed}</p>}
                </div>
                {serverError && <p className="text-xs text-red-500 text-center">{serverError}</p>}
                <button type="submit" disabled={status === "loading"}
                  className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
                >
                  {status === "loading" ? (
                    <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Реєструємо...</>
                  ) : role === "org" ? "Далі →" : "Зареєструватись"}
                </button>
              </form>
            </>
          )}

          {/* ── Step 3: Org Profile ── */}
          {step === 3 && status !== "success" && (
            <>
              <div className="flex items-center gap-3 mb-5">
                <button onClick={() => setStep(2)} className="text-muted hover:text-foreground transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Про організацію</h1>
                  <p className="text-xs text-muted mt-0.5">Ці дані побачать користувачі на платформі</p>
                </div>
              </div>

              <form onSubmit={handleSubmitOrg} className="flex flex-col gap-4">
                {/* Logo upload */}
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Логотип організації</p>
                  <div className="flex items-center gap-4">
                    <div
                      onClick={() => logoInputRef.current?.click()}
                      className="w-16 h-16 rounded-2xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary-light transition-all overflow-hidden flex-shrink-0"
                    >
                      {logoPreview ? (
                        <Image src={logoPreview} alt="Logo" width={64} height={64} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">🏢</span>
                      )}
                    </div>
                    <div>
                      <button type="button" onClick={() => logoInputRef.current?.click()}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {logoPreview ? "Змінити фото" : "Завантажити логотип"}
                      </button>
                      <p className="text-xs text-muted mt-0.5">PNG або JPG, до 2 МБ. Необов&apos;язково.</p>
                    </div>
                  </div>
                  <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                </div>

                <Field label="Назва організації" error={errors.orgName}>
                  <input type="text" value={orgName} onChange={(e) => setOrgName(e.target.value)}
                    placeholder="Офіційна назва"
                    className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white ${errors.orgName ? "border-red-400" : "border-border"}`}
                  />
                </Field>

                <Field label="Тип організації" error={errors.orgType}>
                  <select value={orgType} onChange={(e) => setOrgType(e.target.value)}
                    className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white ${errors.orgType ? "border-red-400" : "border-border"}`}
                  >
                    <option value="">Оберіть тип...</option>
                    {ORG_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Країна" error={errors.orgCountry}>
                    <select value={orgCountry} onChange={(e) => setOrgCountry(e.target.value)}
                      className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white ${errors.orgCountry ? "border-red-400" : "border-border"}`}
                    >
                      <option value="">Країна...</option>
                      {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Місто" error={errors.orgCity}>
                    <input type="text" value={orgCity} onChange={(e) => setOrgCity(e.target.value)}
                      placeholder="Київ"
                      className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white ${errors.orgCity ? "border-red-400" : "border-border"}`}
                    />
                  </Field>
                </div>

                <Field label="Сайт організації" hint="Необов'язково">
                  <input type="url" value={orgWebsite} onChange={(e) => setOrgWebsite(e.target.value)}
                    placeholder="https://your-org.org"
                    className="w-full px-4 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white"
                  />
                </Field>

                <Field label="Опис організації" error={errors.orgDescription} hint="Коротко — що ви робите і для кого">
                  <textarea value={orgDescription} onChange={(e) => setOrgDescription(e.target.value)}
                    placeholder="Коротко опишіть організацію та її місію (2-4 речення)"
                    rows={3}
                    className={`w-full px-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white resize-none ${errors.orgDescription ? "border-red-400" : "border-border"}`}
                  />
                </Field>

                {serverError && <p className="text-xs text-red-500 text-center">{serverError}</p>}

                <button type="submit" disabled={status === "loading"}
                  className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
                >
                  {status === "loading" ? (
                    <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Реєструємо...</>
                  ) : "Зареєструвати організацію"}
                </button>
              </form>
            </>
          )}

          {/* Success */}
          {status === "success" && (
            <div className="text-center py-8">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="font-bold text-foreground text-lg">
                {role === "org" ? "Організацію зареєстровано!" : "Акаунт створено!"}
              </p>
              <p className="text-sm text-muted mt-2 leading-relaxed">
                {role === "org"
                  ? "Ваш профіль передано на перевірку. Перенаправляємо до кабінету..."
                  : "Перевір email — ми надіслали підтвердження."}
              </p>
            </div>
          )}
        </div>

        {step === 1 && (
          <p className="text-center text-sm text-muted mt-5">
            Вже є акаунт?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">Увійти</Link>
          </p>
        )}
      </div>
    </div>
  );
}
