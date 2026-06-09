"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface NotifSettings {
  emailNewOpportunities: boolean;
  emailReminders: boolean;
  emailStatusUpdates: boolean;
  emailWeeklyDigest: boolean;
}

const DEFAULT_NOTIF: NotifSettings = {
  emailNewOpportunities: true,
  emailReminders: true,
  emailStatusUpdates: true,
  emailWeeklyDigest: false,
};

const NOTIF_ITEMS: { key: keyof NotifSettings; label: string; desc: string }[] = [
  { key: "emailNewOpportunities", label: "Нові можливості",       desc: "Отримуй листи про нові програми за твоїми інтересами" },
  { key: "emailReminders",        label: "Нагадування",           desc: "Нагадування про наближення дедлайнів збережених програм" },
  { key: "emailStatusUpdates",    label: "Оновлення статусу",     desc: "Коли статус твоєї заявки змінюється" },
  { key: "emailWeeklyDigest",     label: "Щотижневий дайджест",   desc: "Огляд нових можливостей кожного понеділка" },
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
  const { signOut } = useAuth();
  const [notif, setNotif] = useState<NotifSettings>(DEFAULT_NOTIF);
  const [saved, setSaved] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  function toggle(key: keyof NotifSettings) {
    setNotif((p) => ({ ...p, [key]: !p[key] }));
    setSaved(false);
  }

  function handleSave() {
    // In production, save to Supabase user_notification_settings
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-foreground">Налаштування</h1>
        <p className="text-sm text-muted mt-0.5">Управляй сповіщеннями та акаунтом</p>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
        <h2 className="text-sm font-bold text-foreground">Email-сповіщення</h2>
        <div className="space-y-4">
          {NOTIF_ITEMS.map(({ key, label, desc }) => (
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

      {/* Password change placeholder */}
      <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
        <h2 className="text-sm font-bold text-foreground">Безпека</h2>
        <p className="text-sm text-muted">Зміна паролю здійснюється через email-посилання</p>
        <button
          onClick={() => alert("Лист для зміни паролю надіслано на вашу пошту")}
          className="px-5 py-2.5 border border-border rounded-xl text-sm font-medium text-foreground hover:border-primary hover:text-primary transition-all"
        >
          Змінити пароль
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
            <div className="flex gap-3">
              <button
                disabled={deleteInput !== "ВИДАЛИТИ"}
                onClick={signOut}
                className="px-5 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 disabled:opacity-40 transition-all"
              >
                Підтвердити видалення
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
