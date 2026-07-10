"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-16 bg-[#f7f8fc]">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-black text-foreground mb-2">Щось пішло не так</h1>
        <p className="text-sm text-muted mb-8 leading-relaxed">
          Виникла непередбачена помилка. Спробуй ще раз або поверніться на головну.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm shadow-primary/20"
          >
            Спробувати ще раз
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 border border-border text-foreground rounded-xl text-sm font-medium hover:border-primary/50 hover:text-primary transition-all"
          >
            На головну
          </Link>
        </div>
        {error.digest && (
          <p className="text-[11px] text-muted/60 mt-6 font-mono">ID: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
