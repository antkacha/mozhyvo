"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";

interface NotifSettings {
  emailNewOpportunities: boolean;
  emailReminders: boolean;
  emailStatusUpdates: boolean;
  emailWeeklyDigest: boolean;
  smsStatusUpdates: boolean;
  smsDeadlineReminders: boolean;
}

const DEFAULT_NOTIF: NotifSettings = {
  emailNewOpportunities: true,
  emailReminders: true,
  emailStatusUpdates: true,
  emailWeeklyDigest: false,
  smsStatusUpdates: false,
  smsDeadlineReminders: false,
};

const EMAIL_ITEMS: { key: keyof NotifSettings; label: string; desc: string }[] = [
  { key: "emailNewOpportunities", label: "Нові можливості",       desc: "Отримуй листи про нові програми за твоїми інтересами" },
  { key: "emailReminders",        label: "Нагадування",           desc: "Нагадування про наближення дедлайнів збережених програм" },
  { key: "emailStatusUpdates",    label: "Оновлення статусу",     desc: "Коли статус твоєї заявки змінюється" },
  { key: "emailWeeklyDigest",     label: "Щотижневий дайджест",   desc: "Огляд нових можливостей кожного понеділка" },
];

const SMS_ITEMS: { key: keyof NotifSettings; label: string; desc: string }[] = [
  { key: "smsStatusUpdates",      label: "Оновлення статусу",     desc: "SMS коли організація змінює статус твоєї заявки" },
  { key: "smsDeadlineReminders",  label: "Нагадування дедлайнів", desc: "SMS за день до закінчення подачі збережених програм" },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? "bg-primary" : "bg-muted-bg"}`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} />
    </button>
  );
}

export default function CabinetSettingsPage() {
  const { user, signOut } = useAuth();
  const supabase = useMemo(() => createClient(), []);
  const [notif, setNotif] = useState<NotifSettings>(DEFAULT_NOTIF);
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [pwResetSent, setPwResetSent] = useState(false);
  const [pwResetLoading, setPwResetLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (user?.user_metadata?.notification_settings) {
      setNotif((prev) => ({ ...prev, ...user.user_metadata.notification_settings as Partial<NotifSettings> }));
    }
  }, [user]);

  const smsEnabled = notif.smsStatusUpdates || notif.smsDeadlineReminders;

  async function handleDeleteAccount() {
    setDeleting(true);
    setDeleteError("");
    try {
      const res = await fetch("/api/user/delete", { method: "POST" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({})) as { error?: string };
        setDeleteError(json.error ?? "Не вдалося видалити акаунт. Спробуй ще раз або напиши нам на mozhyvo@gmail.com");
        setDeleting(false);
        return;
      }
    } catch {
      setDeleteError("Помилка мережі. Перевір з'єднання та спробуй ще раз.");
      setDeleting(false);
      return;
    }
    await signOut();
    window.location.href = "/";
  }

  function toggle(key: keyof NotifSettings) {
    setNotif((p) => ({ ...p, [key]: !p[key] }));
    setSaved(false);
  }

  async function handlePasswordReset() {
    if (!user?.email) return;
    setPwResetLoading(true);
    await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setPwResetLoading(false);
    setPwResetSent(true);
    setTimeout(() => setPwResetSent(false), 5000);
  }

  async function handleSave() {
    await supabase.auth.updateUser({ data: { notification_settings: notif } });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-foreground">Налаштування</h1>
        <p className="text-sm text-muted mt-0.5">Управляй сповіщеннями та акаунтом</p>
      </div>

      {/* Email notifications */}
      <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
        <h2 className="text-sm font-bold text-foreground">Email-сповіщення</h2>
        <div className="space-y-4">
          {EMAIL_ITEMS.map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted mt-0.5">{desc}</p>
              </div>
              <Toggle checked={notif[key]} onChange={() => toggle(key)} />
            </div>
          ))}
        </div>
        <button onClick={handleSave}
          className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${saved ? "bg-green-500 text-white" : "bg-primary text-white hover:bg-primary-dark"}`}>
          {saved ? "✓ Збережено" : "Зберегти"}
        </button>
      </div>

      {/* SMS notifications */}
      <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-foreground">SMS-сповіщення</h2>
            <p className="text-xs text-muted mt-0.5">Потрібен номер телефону для отримання SMS</p>
          </div>
          <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex-shrink-0">Незабаром</span>
        </div>

        {/* Phone input */}
        <div>
          <label className="block text-xs font-medium text-muted mb-1.5">Номер телефону</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+380 XX XXX XX XX"
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="space-y-4">
          {SMS_ITEMS.map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted mt-0.5">{desc}</p>
              </div>
              <Toggle checked={notif[key]} onChange={() => toggle(key)} />
            </div>
          ))}
        </div>

        {smsEnabled && !phone && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-xl px-3 py-2">
            Введи номер телефону, щоб отримувати SMS
          </p>
        )}

        <button onClick={handleSave}
          className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${saved ? "bg-green-500 text-white" : "bg-primary text-white hover:bg-primary-dark"}`}>
          {saved ? "✓ Збережено" : "Зберегти"}
        </button>
      </div>

      {/* Password change */}
      <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
        <h2 className="text-sm font-bold text-foreground">Безпека</h2>
        {pwResetSent ? (
          <div className="flex items-center gap-2.5 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
            <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-sm text-green-700">Лист надіслано на <span className="font-semibold">{user?.email}</span></p>
          </div>
        ) : (
          <p className="text-sm text-muted">Ми надішлемо посилання для зміни паролю на {user?.email ? <span className="font-medium text-foreground">{user.email}</span> : "твою пошту"}</p>
        )}
        <button
          onClick={handlePasswordReset}
          disabled={pwResetLoading || pwResetSent}
          className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-xl text-sm font-medium text-foreground hover:border-primary hover:text-primary transition-all disabled:opacity-60"
        >
          {pwResetLoading && <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
          {pwResetSent ? "✓ Лист надіслано" : "Змінити пароль"}
        </button>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl border border-red-200 p-6 space-y-4">
        <h2 className="text-sm font-bold text-red-600">Небезпечна зона</h2>
        {!deleteConfirm ? (
          <>
            <p className="text-sm text-muted">Видалення акаунту незворотнє. Всі дані будуть знищені.</p>
            <button onClick={() => setDeleteConfirm(true)}
              className="px-5 py-2.5 border border-red-200 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 transition-all">
              Видалити акаунт
            </button>
          </>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Введіть <span className="text-red-600">ВИДАЛИТИ</span> для підтвердження</p>
            <input
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="ВИДАЛИТИ"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-red-200 focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400"
            />
            {deleteError && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">{deleteError}</p>
            )}
            <div className="flex gap-3">
              <button
                disabled={deleteInput !== "ВИДАЛИТИ" || deleting}
                onClick={handleDeleteAccount}
                className="px-5 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-40 transition-all flex items-center gap-2"
              >
                {deleting ? (
                  <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Видалення...</>
                ) : "Підтвердити видалення"}
              </button>
              <button onClick={() => { setDeleteConfirm(false); setDeleteInput(""); }}
                className="px-5 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-muted-bg transition-all">
                Скасувати
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
