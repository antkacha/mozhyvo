"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import UserAvatar from "@/components/UserAvatar";
import type { ActiveContext, OrgAccess } from "@/hooks/useAccountContext";

interface Props {
  avatarUrl?: string;
  initials: string;
  firstName: string;
  orgs: OrgAccess[];
  activeOrgId: string | null;
  activeContext: ActiveContext;
  error: boolean;
  retry: () => void;
  switchContext: (context: ActiveContext, orgId?: string) => void;
  onSignOut: () => void;
}

function roleLabel(org: OrgAccess) {
  if (org.isOwner) return "Власник";
  if (org.role === "admin") return "Адміністратор";
  return "Учасник";
}

const Check = () => (
  <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
  </svg>
);

export default function AccountSwitcher({
  avatarUrl, initials, firstName, orgs, activeOrgId, activeContext, error, retry, switchContext, onSignOut,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // A candidate with no org relationship at all gets the plain link this
  // button always used to be — no dropdown with a single option in it.
  // A failed lookup is NOT "no orgs": keep the dropdown so the error shows.
  if (!orgs.length && !error) {
    return (
      <Link
        href="/cabinet"
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-sm font-medium text-foreground hover:border-primary/50 hover:text-primary transition-all"
      >
        <UserAvatar url={avatarUrl} initials={initials} size={20} />
        <span className="max-w-[100px] truncate">{firstName}</span>
      </Link>
    );
  }

  const activeOrg = orgs.find((o) => o.id === activeOrgId) ?? null;
  const label = activeContext === "org" ? (activeOrg?.name ?? "Організація") : firstName;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
          open ? "border-primary text-primary bg-primary-light" : "border-border text-foreground hover:border-primary/50 hover:text-primary"
        }`}
      >
        <UserAvatar url={avatarUrl} initials={initials} size={20} />
        <span className="max-w-[120px] truncate">{label}</span>
        <svg className={`w-3.5 h-3.5 text-muted flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-64 bg-white rounded-2xl border border-border shadow-xl z-50 overflow-hidden py-1.5">
          <p className="px-4 pt-1.5 pb-1 text-[10px] font-semibold text-muted uppercase tracking-wider">Перемкнути на</p>

          <button
            onClick={() => { setOpen(false); switchContext("personal"); }}
            className="w-full text-left px-4 py-2.5 flex items-center gap-2.5 hover:bg-muted-bg transition-colors"
          >
            <UserAvatar url={avatarUrl} initials={initials} size={28} />
            <span className="min-w-0 flex-1">
              <span className={`block text-sm truncate ${activeContext === "personal" ? "font-semibold text-foreground" : "text-foreground"}`}>Особистий акаунт</span>
              <span className="block text-xs text-muted truncate">{firstName}</span>
            </span>
            {activeContext === "personal" && <Check />}
          </button>

          {orgs.map((o) => {
            const isActive = activeContext === "org" && o.id === activeOrgId;
            return (
              <button
                key={o.id}
                onClick={() => { setOpen(false); switchContext("org", o.id); }}
                className="w-full text-left px-4 py-2.5 flex items-center gap-2.5 hover:bg-muted-bg transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-primary-light flex items-center justify-center text-[10px] font-black text-primary flex-shrink-0">
                  {(o.name || "?").slice(0, 2).toUpperCase()}
                </div>
                <span className="min-w-0 flex-1">
                  <span className={`block text-sm truncate ${isActive ? "font-semibold text-foreground" : "text-foreground"}`}>{o.name}</span>
                  <span className="block text-xs text-muted truncate">{roleLabel(o)}</span>
                </span>
                {isActive && <Check />}
              </button>
            );
          })}

          {error && (
            <div className="px-4 py-2.5 text-xs text-muted">
              Не вдалося завантажити організації.{" "}
              <button onClick={retry} className="text-primary font-medium hover:underline">Спробувати ще раз</button>
            </div>
          )}

          <div className="border-t border-border mt-1 pt-1">
            <button
              onClick={onSignOut}
              className="w-full text-left px-4 py-2.5 text-sm text-muted hover:bg-muted-bg hover:text-foreground transition-colors"
            >
              Вийти
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
