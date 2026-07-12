"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { useOrgSession } from "@/hooks/useOrgSession";
import { useOrgProjects } from "@/hooks/useOrgProjects";
import { useOrgApplications } from "@/hooks/useOrgApplications";
import { useProfile } from "@/hooks/useProfile";

// ── Icons ───────────────────────────────────────────────────────────
function IconGrid(p: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}
function IconFolder(p: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  );
}
function IconInbox(p: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-5.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-1.414 0l-2.414-2.414A1 1 0 006.586 13H2" />
    </svg>
  );
}
function IconUser(p: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}
function IconLogout(p: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}
function IconPlus(p: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}
function IconChart(p: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}
function IconSettings(p: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
function IconExternal(p: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...p} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

const NAV_TOP = [
  { href: "/dashboard", label: "Огляд", Icon: IconGrid, exact: true },
  { href: "/dashboard/projects", label: "Проекти", Icon: IconFolder },
  { href: "/dashboard/applications", label: "Заявки", Icon: IconInbox },
  { href: "/dashboard/analytics", label: "Аналітика", Icon: IconChart },
];
const NAV_BOTTOM: { href: string; label: string; Icon: (p: React.SVGProps<SVGSVGElement>) => React.ReactElement; exact?: boolean }[] = [
  { href: "/dashboard/profile", label: "Профіль", Icon: IconUser },
  { href: "/dashboard/settings", label: "Налаштування", Icon: IconSettings },
];

// ── Sidebar ─────────────────────────────────────────────────────────
function Sidebar() {
  const pathname = usePathname();
  const { org, logout, isOwner } = useOrgSession();
  const { profile } = useProfile();
  const { projects } = useOrgProjects(org?.id);
  const { applications } = useOrgApplications();

  if (!org) return null;

  const initials = org.name
    .split(" ")
    .filter((w) => w.length > 0)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const newApps = applications.filter((a) => a.status === "new").length;
  const publishedCount = projects.filter((p) => p.status === "published").length;

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="hidden lg:flex flex-col w-[240px] flex-shrink-0 bg-white border-r border-border sticky top-16 self-start h-[calc(100vh-64px)] overflow-y-auto">

      {/* Org identity */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 bg-primary-light flex items-center justify-center border border-border">
            {org.logo ? (
              <Image src={org.logo} alt={org.name} width={36} height={36} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-black text-primary">{initials}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground truncate leading-tight">{org.name}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${org.status === "verified" ? "bg-green-500" : "bg-amber-400"}`} />
              <span className={`text-[11px] font-medium ${org.status === "verified" ? "text-green-600" : "text-amber-600"}`}>
                {org.status === "verified" ? "Верифіковано" : "На перевірці"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 flex flex-col gap-4">
        <div className="flex flex-col gap-0.5">
          {NAV_TOP.map(({ href, label, Icon, exact }) => {
            const active = isActive(href, exact);
            const badge =
              href === "/dashboard/applications" && newApps > 0
                ? newApps
                : href === "/dashboard/projects" && publishedCount > 0
                ? publishedCount
                : undefined;

            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  active
                    ? "bg-primary-light text-primary font-semibold"
                    : "text-muted hover:text-foreground hover:bg-muted-bg font-medium"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </span>
                {badge !== undefined && (
                  <span className={`text-[11px] font-bold min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center ${
                    active ? "bg-primary text-white" : "bg-border text-muted"
                  }`}>
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="flex flex-col gap-0.5">
          <p className="px-3 text-[10px] font-semibold text-muted uppercase tracking-wider mb-1">Акаунт</p>
          {NAV_BOTTOM.map(({ href, label, Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  active
                    ? "bg-primary-light text-primary font-semibold"
                    : "text-muted hover:text-foreground hover:bg-muted-bg font-medium"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
          {org.slug && (
            <Link
              href={`/organizations/${org.slug}`}
              target="_blank"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-foreground hover:bg-muted-bg transition-all"
            >
              <IconExternal className="w-4 h-4 flex-shrink-0" />
              Публічний профіль
            </Link>
          )}
          <Link
            href="/"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-foreground hover:bg-muted-bg transition-all"
          >
            <IconExternal className="w-4 h-4 flex-shrink-0" />
            На сайт
          </Link>
          {profile.role === "admin" && (
            <Link
              href="/admin"
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Адмін-панель
            </Link>
          )}
        </div>

        {/* Quick action — owners only */}
        {isOwner && (
          <div className="pt-3 border-t border-border">
            <Link
              href="/dashboard/projects/new"
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-primary bg-primary-light hover:bg-primary/10 transition-all w-full"
            >
              <IconPlus className="w-4 h-4" />
              Новий проект
            </Link>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-border">
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-red-600 hover:bg-red-50 transition-all"
        >
          <IconLogout className="w-4 h-4" />
          Вийти
        </button>
      </div>
    </aside>
  );
}

// ── Mobile top nav ───────────────────────────────────────────────────
function MobileNav() {
  const pathname = usePathname();
  const { logout } = useOrgSession();
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="lg:hidden flex items-center gap-1 px-3 py-2 bg-white border-b border-border overflow-x-auto">
      {[...NAV_TOP, ...NAV_BOTTOM].map(({ href, label, Icon, exact }) => (
        <Link
          key={href}
          href={href}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
            isActive(href, exact)
              ? "bg-primary text-white"
              : "text-muted hover:bg-muted-bg hover:text-foreground"
          }`}
        >
          <Icon className="w-3.5 h-3.5" />
          {label}
        </Link>
      ))}
      <button
        onClick={logout}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 text-muted hover:bg-red-50 hover:text-red-600"
      >
        Вийти
      </button>
    </div>
  );
}

// ── Shell ────────────────────────────────────────────────────────────
export default function OrgShell({ children }: { children: React.ReactNode }) {
  const { org, ready, reload } = useOrgSession();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!ready || org) return;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.replace("/login");
      // if user exists but org is null — show error state (handled below)
    });
  }, [ready, org, router, supabase]);

  if (!ready) {
    return (
      <>
        <div className="lg:hidden h-12 bg-white border-b border-border" />
        <div className="flex min-h-[calc(100vh-64px)]">
          <aside className="hidden lg:flex flex-col w-[240px] flex-shrink-0 bg-white border-r border-border" />
          <main className="flex-1 min-w-0 bg-background">
            <div className="max-w-5xl mx-auto px-5 sm:px-7 py-7 lg:py-8">
              <div className="flex items-center justify-center py-24">
                <div className="w-7 h-7 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  if (!org) {
    return (
      <>
        <div className="lg:hidden h-12 bg-white border-b border-border" />
        <div className="flex min-h-[calc(100vh-64px)]">
          <aside className="hidden lg:flex flex-col w-[240px] flex-shrink-0 bg-white border-r border-border" />
          <main className="flex-1 min-w-0 bg-background">
            <div className="max-w-5xl mx-auto px-5 sm:px-7 py-7 lg:py-8">
              <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Не вдалося завантажити організацію</p>
                  <p className="text-xs text-muted mt-1">Перевірте з&apos;єднання або спробуйте ще раз</p>
                </div>
                <button
                  onClick={reload}
                  className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-dark transition-all"
                >
                  Повторити
                </button>
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <MobileNav />
      <div className="flex min-h-[calc(100vh-64px)]">
        <Sidebar />
        <main className="flex-1 min-w-0 bg-background">
          <div className="max-w-5xl mx-auto px-5 sm:px-7 py-7 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
