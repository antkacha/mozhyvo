"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { useOrgSession } from "@/hooks/useOrgSession";
import { useOrgProjects } from "@/hooks/useOrgProjects";
import { useOrgApplications } from "@/hooks/useOrgApplications";
import { DEMO_ORG_EMAIL } from "@/lib/demo-org";

const NAV = [
  { href: "/dashboard", label: "Огляд", icon: "🏠", exact: true },
  { href: "/dashboard/projects", label: "Проекти", icon: "📋" },
  { href: "/dashboard/applications", label: "Заявки", icon: "📩" },
  { href: "/dashboard/profile", label: "Профіль", icon: "👤" },
];

function Sidebar() {
  const pathname = usePathname();
  const { org, update, logout } = useOrgSession();
  const { projects } = useOrgProjects(org?.id);
  const { applications } = useOrgApplications();

  if (!org) return null;

  const initials = org.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const newApps = applications.filter((a) => a.status === "new").length;
  const publishedProjects = projects.filter((p) => p.status === "published").length;

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <aside className="hidden lg:flex flex-col w-60 flex-shrink-0 bg-white border-r border-gray-100 sticky top-16 self-start min-h-[calc(100vh-64px)]">
      {/* Org header */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-primary-light flex items-center justify-center flex-shrink-0">
            {org.logo ? (
              <Image src={org.logo} alt={org.name} width={40} height={40} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-black text-primary">{initials}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 leading-tight truncate">{org.name}</p>
            <span className={`inline-flex items-center text-xs font-medium mt-0.5 ${
              org.status === "verified" ? "text-green-600" : "text-yellow-600"
            }`}>
              {org.status === "verified" ? "✅ Верифіковано" : "⏳ На перевірці"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <div className="flex flex-col gap-0.5">
          {NAV.map((item) => {
            const active = isActive(item.href, item.exact);
            const count = item.href === "/dashboard/projects"
              ? publishedProjects || undefined
              : item.href === "/dashboard/applications"
              ? newApps || undefined
              : undefined;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span>{item.icon}</span>
                  {item.label}
                </span>
                {count !== undefined && count > 0 && (
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                    active ? "bg-white/20 text-white" : "bg-primary-light text-primary"
                  }`}>
                    {count}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-100">
        {/* Dev toggle */}
        {org.contactEmail === DEMO_ORG_EMAIL && (
          <div className="mb-2 p-2 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-[10px] text-gray-400 font-mono mb-1.5">🛠 demo mode</p>
            <div className="flex gap-1.5">
              <button
                onClick={() => update({ status: "pending" })}
                className={`flex-1 text-xs font-semibold py-1 rounded-lg transition-all ${
                  org.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-400 hover:bg-yellow-50"
                }`}
              >
                ⏳
              </button>
              <button
                onClick={() => update({ status: "verified" })}
                className={`flex-1 text-xs font-semibold py-1 rounded-lg transition-all ${
                  org.status === "verified" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400 hover:bg-green-50"
                }`}
              >
                ✅
              </button>
            </div>
          </div>
        )}

        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Вийти
        </button>
      </div>
    </aside>
  );
}

function MobileNav() {
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="lg:hidden flex items-center gap-1 px-4 py-2 bg-white border-b border-gray-100 overflow-x-auto">
      {NAV.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
            isActive(item.href, item.exact)
              ? "bg-primary text-white"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          {item.icon} {item.label}
        </Link>
      ))}
    </div>
  );
}

export default function OrgShell({ children }: { children: React.ReactNode }) {
  const { org, ready } = useOrgSession();
  const router = useRouter();

  useEffect(() => {
    if (ready && !org) router.replace("/login");
  }, [ready, org, router]);

  if (!ready || !org) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <MobileNav />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 min-w-0 min-h-[calc(100vh-64px)] bg-gray-50 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </>
  );
}
