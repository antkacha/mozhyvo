"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";

const INTEREST_OPTIONS = [
  { value: "scholarship",  label: "Стипендії",     emoji: "🎓" },
  { value: "internship",   label: "Стажування",    emoji: "💼" },
  { value: "exchange",     label: "Обміни",        emoji: "✈️" },
  { value: "volunteering", label: "Волонтерство",  emoji: "🌿" },
  { value: "grant",        label: "Гранти",        emoji: "💰" },
  { value: "competition",  label: "Конкурси",      emoji: "🏆" },
  { value: "hackathon",    label: "Хакатони",      emoji: "💻" },
  { value: "conference",   label: "Конференції",   emoji: "🎤" },
];

const DEGREES = [
  { value: "Студент",  label: "Студент (бакалавр)" },
  { value: "Бакалавр", label: "Бакалавр" },
  { value: "Магістр",  label: "Магістр" },
  { value: "Аспірант", label: "Аспірант / PhD" },
  { value: "Інше",     label: "Інше" },
];

const LANGUAGES = [
  "Англійська", "Польська", "Німецька", "Французька",
  "Іспанська", "Чеська", "Словацька", "Нідерландська",
];

const STEPS = ["Інтереси", "Освіта", "Мови"] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { save } = useProfile();

  const [step, setStep] = useState(0);
  const [interests, setInterests]   = useState<string[]>([]);
  const [degree, setDegree]         = useState("");
  const [country, setCountry]       = useState("Україна");
  const [languages, setLanguages]   = useState<string[]>([]);
  const [saving, setSaving]         = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/register");
    }
  }, [loading, user, router]);

  if (loading || !user) return null;

  function toggleInterest(v: string) {
    setInterests((p) => p.includes(v) ? p.filter((i) => i !== v) : [...p, v]);
  }

  function toggleLang(lang: string) {
    setLanguages((p) => p.includes(lang) ? p.filter((l) => l !== lang) : [...p, lang]);
  }

  async function finish() {
    setSaving(true);
    try {
      await save({
        interests,
        degree,
        country,
        languages,
        onboardingDone: true,
      });
      router.push("/opportunities");
    } catch {
      setSaving(false);
    }
  }

  const canNext = [
    interests.length > 0,
    !!degree,
    languages.length > 0,
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 py-12">
      {/* Card */}
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
            <span className="text-white font-black text-2xl">М</span>
          </div>
          <h1 className="text-2xl font-black text-foreground">Ласкаво просимо!</h1>
          <p className="text-sm text-muted mt-1.5">3 швидкі питання — і ми налаштуємо рекомендації для тебе</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-8 h-8 rounded-full text-xs font-black flex items-center justify-center transition-all ${
                  i < step ? "bg-primary text-white" : i === step ? "bg-primary text-white ring-4 ring-primary/20" : "bg-muted-bg text-muted"
                }`}>
                  {i < step ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  ) : i + 1}
                </div>
                <span className={`text-[11px] font-semibold ${i === step ? "text-primary" : "text-muted"}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 mb-5 ${i < step ? "bg-primary" : "bg-muted-bg"}`} />}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="bg-white rounded-3xl border border-border p-8 shadow-sm">

          {/* Step 0: Interests */}
          {step === 0 && (
            <div>
              <h2 className="text-lg font-black text-foreground mb-1">Що тебе цікавить?</h2>
              <p className="text-sm text-muted mb-5">Обери один або кілька варіантів</p>
              <div className="grid grid-cols-2 gap-3">
                {INTEREST_OPTIONS.map(({ value, label, emoji }) => {
                  const active = interests.includes(value);
                  return (
                    <button key={value} onClick={() => toggleInterest(value)}
                      className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left transition-all ${
                        active ? "border-primary bg-primary-light" : "border-border hover:border-primary/40"
                      }`}>
                      <span className="text-xl">{emoji}</span>
                      <span className={`text-sm font-semibold ${active ? "text-primary" : "text-foreground"}`}>{label}</span>
                      {active && (
                        <svg className="w-4 h-4 text-primary ml-auto flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 1: Education */}
          {step === 1 && (
            <div>
              <h2 className="text-lg font-black text-foreground mb-1">Твій рівень освіти?</h2>
              <p className="text-sm text-muted mb-5">Це допоможе знайти підходящі програми</p>
              <div className="flex flex-col gap-2 mb-6">
                {DEGREES.map(({ value, label }) => (
                  <button key={value} onClick={() => setDegree(value)}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 text-left transition-all ${
                      degree === value ? "border-primary bg-primary-light" : "border-border hover:border-primary/40"
                    }`}>
                    <span className={`text-sm font-semibold ${degree === value ? "text-primary" : "text-foreground"}`}>{label}</span>
                    {degree === value && (
                      <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Країна проживання</label>
                <input value={country} onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
            </div>
          )}

          {/* Step 2: Languages */}
          {step === 2 && (
            <div>
              <h2 className="text-lg font-black text-foreground mb-1">Які мови ти знаєш?</h2>
              <p className="text-sm text-muted mb-5">Оберіть усі, якими можеш навчатись або спілкуватись</p>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => {
                  const active = languages.includes(lang);
                  return (
                    <button key={lang} onClick={() => toggleLang(lang)}
                      className={`px-4 py-2.5 rounded-full border-2 text-sm font-semibold transition-all ${
                        active ? "border-primary bg-primary text-white" : "border-border text-foreground hover:border-primary"
                      }`}>
                      {lang}
                    </button>
                  );
                })}
              </div>
              {languages.length > 0 && (
                <p className="text-xs text-primary mt-4 font-medium">✓ Вибрано: {languages.join(", ")}</p>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-5 gap-3">
          {step > 0 ? (
            <button onClick={() => setStep((s) => s - 1)}
              className="px-5 py-2.5 rounded-full border border-border text-sm font-medium text-foreground hover:bg-muted-bg transition-all">
              ← Назад
            </button>
          ) : (
            <button onClick={() => router.push("/opportunities")}
              className="text-sm text-muted hover:text-foreground transition-colors">
              Пропустити
            </button>
          )}

          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep((s) => s + 1)} disabled={!canNext[step]}
              className="px-7 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-40 transition-all shadow-sm shadow-primary/20">
              Далі →
            </button>
          ) : (
            <button onClick={finish} disabled={!canNext[step] || saving}
              className="px-7 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-40 transition-all shadow-sm shadow-primary/20 flex items-center gap-2">
              {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {saving ? "Зберігаємо..." : "Знайти можливості →"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
