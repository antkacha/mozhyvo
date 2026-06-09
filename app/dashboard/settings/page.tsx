"use client";

import { useState } from "react";
import { useOrgSession } from "@/hooks/useOrgSession";
import { useTeamMembers, TeamRole } from "@/hooks/useTeamMembers";
import { useNotificationSettings } from "@/hooks/useNotificationSettings";
import OrgShell from "@/components/OrgShell";

// ── Tab types ──────────────────────────────────────────────────────────
const TABS = [
  { id: "general", label: "Загальні" },
  { id: "team", label: "Команда" },
  { id: "notifications", label: "Сповіщення" },
  { id: "security", label: "Безпека" },
] as const;
type TabId = typeof TABS[number]["id"];

const ROLE_LABEL: Record<TeamRole, string> = { owner: "Власник", admin: "Адмін", reviewer: "Рецензент" };
const ROLE_DESC: Record<TeamRole, string> = { owner: "Повний доступ", admin: "Управління проектами та заявками", reviewer: "Перегляд та коментування заявок" };

// ── Toggle switch ─────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${checked ? "bg-primary" : "bg-muted-bg"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`}
      />
    </button>
  );
}

// ── Tabs ──────────────────────────────────────────────────────────────
function GeneralTab() {
  const { org, update: updateProfile } = useOrgSession();
  const [form, setForm] = useState({
    name: org?.name ?? "",
    description: org?.description ?? "",
    website: org?.website ?? "",
    phone: org?.phone ?? "",
    country: org?.country ?? "",
    city: org?.city ?? "",
  });
  const [saved, setSaved] = useState(false);

  function handleSave() {
    updateProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const input = "w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-border p-6">
        <h2 className="text-sm font-bold text-foreground mb-4">Інформація про організацію</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">Назва організації</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Назва організації" className={input} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">Опис</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Короткий опис організації" rows={3} className={input + " resize-none"} />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">Сайт</label>
            <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://..." className={input} />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">Телефон</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+380..." className={input} />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">Країна</label>
            <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="Україна" className={input} />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">Місто</label>
            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Київ" className={input} />
          </div>
        </div>
        <div className="mt-5 flex items-center gap-3">
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm shadow-primary/20"
          >
            {saved ? "✓ Збережено" : "Зберегти зміни"}
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-2xl border border-red-100 p-6">
        <h2 className="text-sm font-bold text-red-600 mb-1">Небезпечна зона</h2>
        <p className="text-xs text-muted mb-4">Незворотні дії для акаунту організації</p>
        <button
          onClick={() => alert("Видалення акаунту — в процесі розробки")}
          className="px-4 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 transition-all"
        >
          Видалити акаунт організації
        </button>
      </div>
    </div>
  );
}

function TeamTab() {
  const { members, invite, remove, updateRole } = useTeamMembers();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamRole>("reviewer");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleInvite() {
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) { setError("Введіть коректний email"); return; }
    const ok = invite(inviteEmail.trim(), inviteRole);
    if (!ok) { setError("Цей email вже є в команді"); return; }
    setInviteEmail(""); setError("");
    setSuccess("Запрошення надіслано!");
    setTimeout(() => setSuccess(""), 3000);
  }

  const input = "px-3.5 py-2.5 text-sm rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";

  return (
    <div className="space-y-5">
      {/* Invite */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <h2 className="text-sm font-bold text-foreground mb-4">Запросити члена команди</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            value={inviteEmail}
            onChange={(e) => { setInviteEmail(e.target.value); setError(""); }}
            placeholder="email@example.com"
            className={input + " flex-1"}
          />
          <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value as TeamRole)} className={input + " flex-shrink-0"}>
            <option value="reviewer">Рецензент</option>
            <option value="admin">Адмін</option>
          </select>
          <button
            onClick={handleInvite}
            className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm shadow-primary/20 flex-shrink-0"
          >
            Запросити
          </button>
        </div>
        {error && <p className="text-xs text-red-500 font-medium mt-2">{error}</p>}
        {success && <p className="text-xs text-green-600 font-medium mt-2">✓ {success}</p>}

        {/* Role legend */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(["owner", "admin", "reviewer"] as TeamRole[]).map((r) => (
            <div key={r} className="bg-muted-bg rounded-xl p-3">
              <p className="text-xs font-bold text-foreground mb-0.5">{ROLE_LABEL[r]}</p>
              <p className="text-[11px] text-muted">{ROLE_DESC[r]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Member list */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-bold text-foreground">Члени команди</h2>
          <span className="text-xs font-semibold text-muted bg-muted-bg px-2.5 py-1 rounded-full">{members.length}</span>
        </div>
        {members.length === 0 ? (
          <p className="text-sm text-muted text-center py-8">Поки що немає членів команди</p>
        ) : (
          <div className="divide-y divide-border">
            {members.map((m) => (
              <div key={m.id} className="flex items-center justify-between px-5 py-4 gap-4 hover:bg-muted-bg/40 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0"
                    style={{ background: "linear-gradient(135deg,#3B4FE8,#7C3AED)" }}
                  >
                    {m.name[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{m.name}</p>
                    <p className="text-xs text-muted truncate">{m.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 flex-shrink-0">
                  {m.status === "pending" && (
                    <span className="text-[11px] font-semibold bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">Очікує</span>
                  )}
                  {m.role === "owner" ? (
                    <span className="text-xs font-bold text-primary bg-primary-light px-2.5 py-1 rounded-full">{ROLE_LABEL[m.role]}</span>
                  ) : (
                    <select
                      value={m.role}
                      onChange={(e) => updateRole(m.id, e.target.value as TeamRole)}
                      className="text-xs font-semibold border border-border rounded-xl px-2.5 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                    >
                      <option value="admin">Адмін</option>
                      <option value="reviewer">Рецензент</option>
                    </select>
                  )}
                  {m.role !== "owner" && (
                    <button
                      onClick={() => remove(m.id)}
                      className="w-7 h-7 rounded-xl bg-muted-bg hover:bg-red-50 text-muted hover:text-red-500 flex items-center justify-center transition-all"
                      title="Видалити"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationsTab() {
  const { settings, update } = useNotificationSettings();
  const [saved, setSaved] = useState(false);
  const [email, setEmail] = useState(settings.digestEmail);

  function save() {
    update({ digestEmail: email });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-border p-6 space-y-5">
        <h2 className="text-sm font-bold text-foreground">Email-сповіщення</h2>

        {/* New application */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Нова заявка</p>
            <p className="text-xs text-muted mt-0.5">Отримуйте email щоразу, коли надходить нова заявка</p>
          </div>
          <Toggle checked={settings.newApplication} onChange={() => update({ newApplication: !settings.newApplication })} />
        </div>

        <div className="border-t border-border" />

        {/* Daily digest */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Щоденний дайджест</p>
            <p className="text-xs text-muted mt-0.5">Отримуйте зведений звіт про заявки о 9:00 кожного дня</p>
          </div>
          <Toggle checked={settings.dailyDigest} onChange={() => update({ dailyDigest: !settings.dailyDigest })} />
        </div>

        {/* Digest email */}
        {settings.dailyDigest && (
          <div className="pt-1">
            <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">Email для дайджесту</label>
            <div className="flex gap-2">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="org@example.com"
                className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
              <button
                onClick={save}
                className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all"
              >
                {saved ? "✓" : "Зберегти"}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <p className="text-sm font-semibold text-amber-700 mb-1">Email-інтеграція</p>
        <p className="text-xs text-amber-600">Для надсилання сповіщень потрібно підключити Resend API. Зверніться до вашого розробника або адміністратора.</p>
      </div>
    </div>
  );
}

function SecurityTab() {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleChange() {
    if (!form.current || !form.next || !form.confirm) { setError("Заповніть всі поля"); return; }
    if (form.next.length < 8) { setError("Пароль має бути не менше 8 символів"); return; }
    if (form.next !== form.confirm) { setError("Паролі не збігаються"); return; }
    setError("");
    setSuccess(true);
    setForm({ current: "", next: "", confirm: "" });
    setTimeout(() => setSuccess(false), 3000);
  }

  const input = "w-full px-3.5 py-2.5 text-sm rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-border p-6">
        <h2 className="text-sm font-bold text-foreground mb-4">Зміна паролю</h2>
        <div className="space-y-3 max-w-sm">
          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">Поточний пароль</label>
            <input type="password" value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} placeholder="••••••••" className={input} />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">Новий пароль</label>
            <input type="password" value={form.next} onChange={(e) => setForm({ ...form, next: e.target.value })} placeholder="••••••••" className={input} />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wider block mb-1.5">Підтвердіть новий пароль</label>
            <input type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} placeholder="••••••••" className={input} />
          </div>
          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
          {success && <p className="text-xs text-green-600 font-semibold">✓ Пароль успішно змінено</p>}
          <button
            onClick={handleChange}
            className="mt-1 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm shadow-primary/20"
          >
            Змінити пароль
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6">
        <h2 className="text-sm font-bold text-foreground mb-1">Двофакторна автентифікація</h2>
        <p className="text-xs text-muted mb-4">Додатковий захист для вашого акаунту</p>
        <button
          onClick={() => alert("2FA — в процесі розробки")}
          className="px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:border-primary/30 hover:text-primary transition-all"
        >
          Увімкнути 2FA
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-border p-6">
        <h2 className="text-sm font-bold text-foreground mb-1">Активні сесії</h2>
        <p className="text-xs text-muted mb-4">Управління входами до вашого акаунту</p>
        <div className="flex items-center justify-between py-3 border-t border-border">
          <div>
            <p className="text-sm font-semibold text-foreground">Поточна сесія</p>
            <p className="text-xs text-muted">Chrome · macOS · Активна зараз</p>
          </div>
          <span className="w-2 h-2 bg-green-400 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ── Main settings page ────────────────────────────────────────────────
function SettingsContent() {
  const [activeTab, setActiveTab] = useState<TabId>("general");

  return (
    <div className="page-transition max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-foreground">Налаштування</h1>
        <p className="text-sm text-muted mt-0.5">Управляйте своїм акаунтом та командою</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted-bg rounded-2xl mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-fit text-sm font-semibold px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-white text-primary shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "general" && <GeneralTab />}
      {activeTab === "team" && <TeamTab />}
      {activeTab === "notifications" && <NotificationsTab />}
      {activeTab === "security" && <SecurityTab />}
    </div>
  );
}

export default function SettingsPage() {
  return <OrgShell><SettingsContent /></OrgShell>;
}
