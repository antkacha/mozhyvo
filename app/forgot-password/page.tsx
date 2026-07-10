"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const canSubmit = email.includes("@") && email.includes(".");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus("loading");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) {
      setErrorMsg(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left panel */}
      <div className="relative hidden lg:flex lg:w-[42%] xl:w-[38%] bg-primary flex-col justify-between p-10 xl:p-14 overflow-hidden flex-shrink-0">
        <div aria-hidden className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div aria-hidden className="absolute -top-20 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(255,214,0,0.13) 0%, transparent 60%)" }} />
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <span className="text-2xl font-black text-white group-hover:text-accent transition-colors">Моживо</span>
          </Link>
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl xl:text-4xl font-black text-white leading-tight mb-3">
            Відновлення<br /><span className="text-accent">паролю</span>
          </h2>
          <p className="text-white/55 text-sm leading-relaxed max-w-xs">
            Надішлемо посилання для скидання паролю на твій email
          </p>
        </div>
        <div className="relative z-10">
          <p className="text-white/40 text-xs">
            Згадав пароль?{" "}
            <Link href="/login" className="text-accent font-semibold hover:text-accent/80 transition-colors">
              Увійти →
            </Link>
          </p>
        </div>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto bg-[#f7f8fc]">
        <div className="lg:hidden bg-primary px-6 pt-8 pb-10 relative overflow-hidden">
          <div aria-hidden className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          <Link href="/" className="relative z-10 inline-flex items-center gap-1.5">
            <span className="text-xl font-black text-white">Моживо</span>
          </Link>
          <p className="relative z-10 text-white/55 text-sm mt-1">Відновлення паролю</p>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-5 py-10 lg:py-16 -mt-4 lg:mt-0">
          <div className="w-full max-w-[420px]">
            <div className="bg-white rounded-2xl shadow-sm border border-border/60 p-7 lg:p-8">
              {status === "sent" ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h1 className="text-lg font-bold text-foreground mb-2">Лист надіслано!</h1>
                  <p className="text-sm text-muted mb-1">Перевір пошту <span className="font-semibold text-foreground">{email}</span></p>
                  <p className="text-xs text-muted mb-6">Натисни посилання в листі, щоб встановити новий пароль. Якщо листа немає — перевір спам.</p>
                  <button
                    onClick={() => { setStatus("idle"); setEmail(""); }}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    Надіслати ще раз
                  </button>
                </div>
              ) : (
                <>
                  <h1 className="text-xl font-bold text-foreground mb-2 text-center">Забули пароль?</h1>
                  <p className="text-sm text-muted text-center mb-6">Введи свій email і ми надішлемо посилання для скидання</p>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setStatus("idle"); setErrorMsg(""); }}
                        placeholder="your@email.com"
                        required
                        autoFocus
                        autoComplete="email"
                        className="w-full px-4 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white"
                      />
                    </div>

                    {status === "error" && (
                      <p className="text-xs text-red-500 -mt-1">{errorMsg || "Помилка. Спробуй ще раз."}</p>
                    )}

                    <button
                      type="submit"
                      disabled={!canSubmit || status === "loading"}
                      className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {status === "loading" ? (
                        <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Надсилаємо...</>
                      ) : "Надіслати посилання"}
                    </button>
                  </form>
                </>
              )}
            </div>

            <p className="text-center text-sm text-muted mt-5">
              <Link href="/login" className="text-primary font-medium hover:underline">← Назад до входу</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
