"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSaved } from "@/hooks/useSaved";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { label: "Можливості", href: "/opportunities" },
  { label: "Для організацій", href: "/organizations" },
  { label: "Про нас", href: "/about" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { saved } = useSaved();
  const { user, loading: authLoading, signOut } = useAuth();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 group">
            <span className="text-xl">⚡</span>
            <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-200">
              Моживо
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive(link.href)
                    ? "text-primary"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/saved"
              className={`relative text-sm font-medium transition-colors duration-200 flex items-center gap-1.5 ${
                isActive("/saved") ? "text-primary" : "text-muted hover:text-foreground"
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
                <span className="absolute -top-1.5 -right-3 min-w-[18px] h-[18px] bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                  {saved.length}
                </span>
              )}
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {!authLoading && user ? (
              <>
                <Link
                  href="/profile"
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 text-sm font-medium ${isActive("/profile") ? "border-primary text-primary bg-primary-light" : "border-border text-foreground hover:border-primary hover:text-primary"}`}
                >
                  <div className="w-5 h-5 rounded-full bg-primary-light flex items-center justify-center text-primary text-[10px] font-bold flex-shrink-0">
                    {(user.user_metadata?.first_name?.[0] ?? user.email?.[0] ?? "?").toUpperCase()}
                  </div>
                  <span className="max-w-[100px] truncate">{user.user_metadata?.first_name ?? user.email?.split("@")[0]}</span>
                </Link>
                <button
                  onClick={signOut}
                  className="text-sm font-medium px-4 py-2 rounded-xl border border-border text-muted hover:border-primary hover:text-primary transition-all duration-200"
                >
                  Вийти
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium px-4 py-2 rounded-xl border border-border text-foreground hover:border-primary hover:text-primary transition-all duration-200"
                >
                  Увійти
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-semibold px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary-dark transition-all duration-200 shadow-sm"
                >
                  Зареєструватись
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-muted-bg transition-colors duration-200"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Меню"
          >
            <span
              className={`block w-5 h-0.5 bg-foreground transition-all duration-200 ${
                menuOpen ? "rotate-45 translate-y-2" : ""
              }`}
            />
            <span
              className={`block w-5 h-0.5 bg-foreground transition-all duration-200 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block w-5 h-0.5 bg-foreground transition-all duration-200 ${
                menuOpen ? "-rotate-45 -translate-y-2" : ""
              }`}
            />
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-border py-4 flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-200 py-1 ${
                  isActive(link.href) ? "text-primary" : "text-muted hover:text-foreground"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/saved"
              className={`text-sm font-medium py-1 flex items-center gap-2 ${
                isActive("/saved") ? "text-primary" : "text-muted hover:text-foreground"
              }`}
              onClick={() => setMenuOpen(false)}
            >
              Збережені
              {saved.length > 0 && (
                <span className="bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {saved.length}
                </span>
              )}
            </Link>
            <Link
              href="/profile"
              className={`text-sm font-medium py-1 ${isActive("/profile") ? "text-primary" : "text-muted hover:text-foreground"}`}
              onClick={() => setMenuOpen(false)}
            >
              Мій профіль
            </Link>
            <Link
              href="/dashboard"
              className={`text-sm font-medium py-1 ${isActive("/dashboard") ? "text-primary" : "text-muted hover:text-foreground"}`}
              onClick={() => setMenuOpen(false)}
            >
              Панель координатора
            </Link>
            <div className="flex flex-col gap-2 pt-3 border-t border-border">
              <Link
                href="/login"
                className="text-sm font-medium px-4 py-2 rounded-xl border border-border text-foreground text-center hover:border-primary hover:text-primary transition-all duration-200"
                onClick={() => setMenuOpen(false)}
              >
                Увійти
              </Link>
              <Link
                href="/register"
                className="text-sm font-semibold px-4 py-2 rounded-xl bg-primary text-white text-center hover:bg-primary-dark transition-all duration-200"
                onClick={() => setMenuOpen(false)}
              >
                Зареєструватись
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
