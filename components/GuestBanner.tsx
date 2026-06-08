"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function GuestBanner() {
  const { user, loading } = useAuth();

  if (loading || user) return null;

  return (
    <div className="flex items-center justify-between gap-4 bg-primary-light border border-primary/20 rounded-2xl px-5 py-3.5 mb-8 flex-wrap">
      <p className="text-sm text-primary font-medium">
        Авторизуйтесь, щоб подати заявку на можливість та зберігати цікаві програми
      </p>
      <Link
        href="/login"
        className="flex-shrink-0 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark transition-all"
      >
        Увійти
      </Link>
    </div>
  );
}
