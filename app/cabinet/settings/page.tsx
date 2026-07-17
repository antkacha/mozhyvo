"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/contexts/ToastContext";

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
  const { toast } = useToast();
  const [notif, setNotif] = useState<NotifSettings>(DEFAULT_NOTIF);
  const [phone, setPhone] = useState("");
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");

  const isGoogleUser = !!(user?.identities?.length && user.identities.every((i) => i.provider !== "email"));

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

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.email) return;
    if (pwForm.next.length < 8) { setPwError("Новий пароль має бути не менше 8 символів"); return; }
    if (pwForm.next !== pwForm.confirm) { setPwError("Паролі не збігаються"); return; }

    setPwLoading(true);
    setPwError("");

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: pwForm.current,
    });
    if (authError) {
      setPwError("Невірний поточний пароль");
      setPwLoading(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: pwForm.next });
    if (updateError) {
      setPwError(updateError.message);
      setPwLoading(false);
      return;
    }

    toast("Пароль змінено", "success");
    setPwForm({ current: "", next: "", confirm: "" });
    setPwLoading(false);
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

        {isGoogleUser ? (
          <div className="flex items-center gap-3 px-4 py-3 bg-muted-bg rounded-xl">
            <svg className="w-5 h-5 text-muted flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <div>
              <p className="text-sm font-medium text-foreground">Ви увійшли через Google</p>
              <p className="text-xs text-muted">Пароль не використовується для цього акаунту</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePasswordChange} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Поточний пароль</label>
              <input
                type="password"
                value={pwForm.current}
                onChange={(e) => { setPwForm((p) => ({ ...p, current: e.target.value })); setPwError(""); }}
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Новий пароль</label>
              <input
                type="password"
                value={pwForm.next}
                onChange={(e) => { setPwForm((p) => ({ ...p, next: e.target.value })); setPwError(""); }}
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              {pwForm.next.length > 0 && pwForm.next.length < 8 && (
                <p className="text-xs text-amber-500 mt-1">Мінімум 8 символів</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">Підтвердіть новий пароль</label>
              <input
                type="password"
                value={pwForm.confirm}
                onChange={(e) => { setPwForm((p) => ({ ...p, confirm: e.target.value })); setPwError(""); }}
                required
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              {pwForm.confirm && pwForm.next !== pwForm.confirm && (
                <p className="text-xs text-red-500 mt-1">Паролі не збігаються</p>
              )}
            </div>
            {pwError && <p className="text-xs text-red-500">{pwError}</p>}
            <button
              type="submit"
              disabled={pwLoading || !pwForm.current || pwForm.next.length < 8 || pwForm.next !== pwForm.confirm}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark disabled:opacity-50 transition-all"
            >
              {pwLoading && <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
              {pwLoading ? "Зберігаємо..." : "Змінити пароль"}
            </button>
          </form>
        )}
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
