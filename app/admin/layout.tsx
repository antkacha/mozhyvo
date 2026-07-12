"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

const NAV = [
  { href: "/admin",                  label: "Огляд",         exact: true,
    icon: <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
  },
  { href: "/admin/users",            label: "Користувачі",   exact: false,
    icon: <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
  },
  { href: "/admin/organizations",    label: "Організації",   exact: false,
    icon: <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
  },
  { href: "/admin/opportunities",    label: "Можливості",    exact: false,
    icon: <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
  },
  { href: "/admin/broadcasts",       label: "Розсилки",      exact: false,
    icon: <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
  },
];

const MOZHYVO_NAV = { href: "/dashboard", label: "Кабінет Моживо" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, signOut } = useAuth();
  const { profile, ready: profileReady } = useProfile();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?next=/admin");
      return;
    }
    if (!loading && profileReady && profile.role !== "admin") {
      router.replace("/");
    }
  }, [loading, user, profileReady, profile.role, router]);

  if (loading || !user || !profileReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (profile.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:flex flex-col w-56 border-r border-border bg-white shrink-0">
        <div className="px-5 py-4 border-b border-border">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">A</span>
            </div>
            <span className="font-black text-foreground">Адмін</span>
          </Link>
        </div>

        <nav className="flex-1 py-3 px-3">
          {NAV.map(({ href, label, icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-0.5 transition-all ${
                  active ? "bg-red-50 text-red-600" : "text-muted hover:bg-muted-bg hover:text-foreground"
                }`}>
                <span className={active ? "text-red-500" : "text-muted"}>{icon}</span>
                {label}
              </Link>
            );
          })}
          <Link href={MOZHYVO_NAV.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary-dark transition-all mt-1">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {MOZHYVO_NAV.label}
          </Link>
        </nav>

        <div className="px-3 py-3 border-t border-border space-y-1">
          <Link href="/" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-muted hover:bg-muted-bg transition-all">
            ← На сайт
          </Link>
          <button onClick={signOut} className="flex w-full items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-muted hover:bg-red-50 hover:text-red-600 transition-all">
            Вийти
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-border">
          <Link href="/admin" className="font-black text-foreground">Адмін-панель</Link>
          <Link href="/" className="text-xs text-muted">← Сайт</Link>
        </header>
        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border flex">
          {NAV.map(({ href, label, icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors ${
                  active ? "text-red-600" : "text-muted"
                }`}>
                <span className={`[&>svg]:w-5 [&>svg]:h-5 ${active ? "text-red-500" : "text-muted"}`}>{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">{children}</main>
      </div>
    </div>
  );
}
