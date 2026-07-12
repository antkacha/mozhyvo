"use client";

import { useState } from "react";
import { useProfile } from "@/hooks/useProfile";

export default function NewsletterSubscribe() {
  const [email, setEmail]     = useState("");
  const [name, setName]       = useState("");
  const [status, setStatus]   = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errMsg, setErrMsg]   = useState("");
  const { profile } = useProfile();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      setErrMsg("Введіть коректний email");
      return;
    }
    setStatus("loading");
    setErrMsg("");
    const firstName = profile.firstName || name.trim() || undefined;
    try {
      const res = await fetch("/api/subscribe", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, firstName }),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        const data = await res.json();
        setErrMsg(data.error ?? "Сталася помилка");
        setStatus("error");
      }
    } catch {
      setErrMsg("Немає зʼєднання з сервером");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-3 py-3">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-foreground">
          Підписка оформлена! Перевір пошту.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
      <div className="flex-1 relative">
        <input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setErrMsg(""); }}
          placeholder="твій@email.com"
          className={`w-full px-4 py-3 text-sm rounded-xl border bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${
            errMsg ? "border-red-300" : "border-border"
          }`}
        />
        {errMsg && <p className="absolute -bottom-5 left-0 text-xs text-red-500">{errMsg}</p>}
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className="px-5 py-3 bg-primary text-white font-semibold text-sm rounded-xl hover:bg-primary-dark disabled:opacity-50 transition-all flex-shrink-0 flex items-center gap-2"
      >
        {status === "loading" && (
          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        )}
        Підписатись
      </button>
    </form>
  );
}
