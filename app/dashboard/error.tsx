"use client";

import Link from "next/link";

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-sm px-4">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-foreground mb-2">Помилка завантаження</h2>
        <p className="text-sm text-muted mb-6">Не вдалося завантажити сторінку. Спробуй ще раз.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all">
            Повторити
          </button>
          <Link href="/dashboard" className="px-5 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted-bg transition-all">
            На головну
          </Link>
        </div>
      </div>
    </div>
  );
}
