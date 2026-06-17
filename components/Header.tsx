"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSaved } from "@/hooks/useSaved";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import NotificationsBell from "@/components/NotificationsBell";

const navLinks = [
  { label: "Головна", href: "/" },
  { label: "Про нас", href: "/about" },
  { label: "Можливості", href: "/opportunities" },
  { label: "Для організацій", href: "/organizations" },
];

function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <Image src="/logo-icon.png" alt="Моживо" width={size} height={size} className="flex-shrink-0" style={{ width: size, height: size }} />
  );
}

export { LogoMark };

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { saved } = useSaved();
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile } = useProfile();
  const isAdmin = profile.role === "admin";
  // org owner by metadata; invited members get has_org_access flag in metadata
  const isOrg = user?.user_metadata?.role === "org"
    || user?.user_metadata?.role === "coordinator"
    || user?.user_metadata?.has_org_access === true;
  const cabinetHref = isOrg ? "/dashboard" : "/cabinet";

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 bg-background px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto py-2.5">
        {/* ── Floating island ─────────────────────────────────────── */}
        <div className="bg-white/92 backdrop-blur-xl border border-border/70 rounded-2xl shadow-lg shadow-black/[0.05] flex items-center justify-between px-5 h-14">

          {/* Logo */}
          <Link href="/" className="flex items-center group">
            <div className="group-hover:scale-95 transition-transform duration-150">
              <Image src="/logo.png" alt="Моживо" width={120} height={40} className="h-8 w-auto" />
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium px-3.5 py-2 rounded-xl transition-all duration-150 ${
                  isActive(link.href)
                    ? "bg-primary-light text-primary font-semibold"
                    : "text-muted hover:text-foreground hover:bg-muted-bg"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/saved"
              className={`relative text-sm font-medium px-3.5 py-2 rounded-xl transition-all duration-150 flex items-center gap-1.5 ${
                isActive("/saved")
                  ? "bg-primary-light text-primary font-semibold"
                  : "text-muted hover:text-foreground hover:bg-muted-bg"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill={isActive("/saved") ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              Збережені
              {saved.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
                  {saved.length}
                </span>
              )}
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            {!authLoading && user ? (
              <>
                <NotificationsBell />
                <Link
                  href={cabinetHref}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-150 ${
                    isActive(cabinetHref)
                      ? "border-primary text-primary bg-primary-light"
                      : "border-border text-foreground hover:border-primary/50 hover:text-primary"
                  }`}
                >
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0 leading-none">
                    {(user.user_metadata?.first_name?.[0] ?? user.email?.[0] ?? "?").toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate">
                    {user.user_metadata?.first_name ?? user.email?.split("@")[0]}
                  </span>
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-all duration-150"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Адмін
                  </Link>
                )}
                <button
                  onClick={signOut}
                  className="text-sm font-medium px-3.5 py-2 rounded-xl border border-border text-muted hover:border-primary/50 hover:text-primary transition-all duration-150"
                >
                  Вийти
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium px-4 py-2 rounded-xl border border-border text-foreground hover:border-primary/50 hover:text-primary transition-all duration-150"
                >
                  Увійти
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-semibold px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary-dark transition-all duration-150 shadow-sm shadow-primary/20"
                >
                  Зареєструватись
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-xl hover:bg-muted-bg transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Меню"
          >
            <span className={`block w-5 h-0.5 bg-foreground transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-0.5 bg-foreground transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-foreground transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile menu — second floating island */}
      {menuOpen && (
        <div className="md:hidden max-w-7xl mx-auto mb-2">
          <div className="bg-white/95 backdrop-blur-xl border border-border/70 rounded-2xl shadow-lg px-4 py-4 flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm py-2.5 px-3 rounded-xl transition-colors ${
                  isActive(link.href)
                    ? "text-primary font-semibold bg-primary-light"
                    : "text-muted font-medium hover:text-foreground hover:bg-muted-bg"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/saved"
              className={`text-sm py-2.5 px-3 flex items-center gap-2 rounded-xl transition-colors ${
                isActive("/saved")
                  ? "text-primary font-semibold bg-primary-light"
                  : "text-muted font-medium hover:text-foreground hover:bg-muted-bg"
              }`}
              onClick={() => setMenuOpen(false)}
            >
              Збережені
              {saved.length > 0 && (
                <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold leading-none">
                  {saved.length}
                </span>
              )}
            </Link>
            <div className="flex flex-col gap-2 pt-3 mt-1 border-t border-border">
              {!authLoading && user ? (
                <>
                  <Link
                    href={cabinetHref}
                    className="text-sm font-medium px-4 py-2.5 rounded-xl border border-border text-foreground text-center hover:border-primary hover:text-primary transition-all"
                    onClick={() => setMenuOpen(false)}
                  >
                    {isOrg ? "Панель організації" : "Мій кабінет"}
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all"
                      onClick={() => setMenuOpen(false)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Адмін-панель
                    </Link>
                  )}
                  <button
                    onClick={() => { signOut(); setMenuOpen(false); }}
                    className="text-sm font-medium px-4 py-2.5 rounded-xl border border-border text-muted text-center hover:border-primary hover:text-primary transition-all"
                  >
                    Вийти
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium px-4 py-2.5 rounded-xl border border-border text-foreground text-center hover:border-primary hover:text-primary transition-all"
                    onClick={() => setMenuOpen(false)}
                  >
                    Увійти
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm font-semibold px-4 py-2.5 rounded-xl bg-primary text-white text-center hover:bg-primary-dark transition-all"
                    onClick={() => setMenuOpen(false)}
                  >
                    Зареєструватись
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
