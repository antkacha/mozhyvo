"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

// Sign-in prompt shown in the /opportunities hero (right side on desktop,
// under the heading on mobile). Renders nothing for signed-in users.
export default function GuestBanner() {
  const { user, loading } = useAuth();

  if (loading || user) return null;

  return (
    <div className="relative overflow-hidden bg-primary rounded-2xl p-5 shadow-lg shadow-primary/20 lg:w-[340px] flex-shrink-0">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)", backgroundSize: "20px 20px" }}
      />
      <div className="relative">
        <p className="text-sm text-white/85 leading-relaxed mb-4">
          Авторизуйтесь, щоб подати заявку на можливість та зберігати цікаві програми
        </p>
        <Link
          href="/login"
          className="inline-flex px-5 py-2 rounded-full bg-white text-primary text-sm font-semibold hover:bg-primary-light transition-all"
        >
          Увійти
        </Link>
      </div>
    </div>
  );
}
