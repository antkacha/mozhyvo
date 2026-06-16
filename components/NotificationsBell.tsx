"use client";

import { useState, useRef, useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";

const TYPE_ICON: Record<string, string> = {
  team_invite: "👥",
  status_update: "📋",
  default: "🔔",
};

export default function NotificationsBell() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-9 h-9 rounded-xl flex items-center justify-center text-muted hover:text-foreground hover:bg-muted-bg transition-all"
        aria-label="Сповіщення"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl border border-border shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <p className="text-sm font-bold text-foreground">Сповіщення</p>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                Прочитати всі
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <p className="text-3xl mb-2">🔔</p>
              <p className="text-sm text-muted">Поки немає сповіщень</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto divide-y divide-border">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-muted-bg transition-colors flex gap-3 items-start ${!n.read ? "bg-primary-light/50" : ""}`}
                >
                  <span className="text-xl flex-shrink-0 mt-0.5">{TYPE_ICON[n.type] ?? TYPE_ICON.default}</span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground leading-snug">{n.title}</p>
                    <p className="text-xs text-muted mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-muted/60 mt-1">
                      {new Date(n.createdAt).toLocaleDateString("uk-UA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
