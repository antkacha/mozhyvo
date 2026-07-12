"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useOrgApplications, OrgApplication } from "@/hooks/useOrgApplications";
import { useActivityLog } from "@/hooks/useActivityLog";
import { useAppNotes } from "@/hooks/useAppNotes";
import { useOrgSession } from "@/hooks/useOrgSession";

// ── Status config ─────────────────────────────────────────────────────
const STATUSES: OrgApplication["status"][] = ["new", "reviewing", "selected", "rejected"];
const STATUS_LABEL: Record<OrgApplication["status"], string> = { new: "Нова", reviewing: "Розглядається", selected: "Відібрано", rejected: "Відхилено" };
const STATUS_CHIP: Record<OrgApplication["status"], string> = { new: "bg-blue-50 text-blue-600", reviewing: "bg-amber-50 text-amber-600", selected: "bg-green-50 text-green-700", rejected: "bg-red-50 text-red-500" };
const STATUS_BTN: Record<OrgApplication["status"], string> = {
  new: "bg-blue-500 text-white hover:bg-blue-600",
  reviewing: "bg-amber-400 text-white hover:bg-amber-500",
  selected: "bg-green-500 text-white hover:bg-green-600",
  rejected: "bg-red-400 text-white hover:bg-red-500",
};
const STATUS_BTN_OUTLINE: Record<OrgApplication["status"], string> = {
  new: "border-blue-200 text-blue-600 hover:bg-blue-50",
  reviewing: "border-amber-200 text-amber-600 hover:bg-amber-50",
  selected: "border-green-200 text-green-600 hover:bg-green-50",
  rejected: "border-red-200 text-red-500 hover:bg-red-50",
};

const ACTION_ICON: Record<string, string> = {
  status_changed: "🔄",
  note_added: "📝",
  exported: "📤",
  viewed: "👁",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" });
}
function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("uk-UA", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
function avatarGradient() { return "linear-gradient(135deg,#3B4FE8,#7C3AED)"; }

// ── Detail page ───────────────────────────────────────────────────────
function ApplicationDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { org } = useOrgSession();
  const { applications, updateApp, ready } = useOrgApplications(org?.id);
  const { entries, addEntry } = useActivityLog(id);
  const { notes, addNote, deleteNote } = useAppNotes(id);

  const [newNote, setNewNote] = useState("");
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const app = useMemo(() => applications.find((a) => a.id === id), [applications, id]);

  // Prev / next navigation
  const allIds = useMemo(() => applications.map((a) => a.id), [applications]);
  const currentIndex = allIds.indexOf(id);
  const prevId = currentIndex > 0 ? allIds[currentIndex - 1] : null;
  const nextId = currentIndex < allIds.length - 1 ? allIds[currentIndex + 1] : null;

  const appLog = useMemo(() => [...entries].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [entries]);
  const appNotes = useMemo(() => [...notes].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [notes]);

  // Record view
  useEffect(() => {
    if (app) {
      addEntry({ applicationId: id, action: "viewed", detail: "Заявку переглянуто", author: org?.name ?? "Організація" });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleStatusChange(status: OrgApplication["status"]) {
    if (!app || app.status === status) return;
    setSavingStatus(true);
    const prev = app.status;
    try {
      await updateApp(id, { status });
    } catch {
      setSavingStatus(false);
      return;
    }
    addEntry({
      applicationId: id,
      action: "status_changed",
      detail: `${STATUS_LABEL[prev]} → ${STATUS_LABEL[status]}`,
      author: org?.name ?? "Організація",
    });
    setStatusMsg(`Статус змінено на «${STATUS_LABEL[status]}»`);
    setTimeout(() => { setSavingStatus(false); setStatusMsg(null); }, 2000);
  }

  function handleAddNote() {
    if (!newNote.trim()) return;
    addNote(newNote.trim(), org?.name ?? "Організація");
    addEntry({ applicationId: id, action: "note_added", detail: "Додано нотатку", author: org?.name ?? "Організація" });
    setNewNote("");
  }

  if (!ready) {
    return <div className="flex items-center justify-center min-h-[60vh]"><div className="w-8 h-8 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" /></div>;
  }

  if (!app) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-lg font-semibold text-foreground mb-2">Заявку не знайдено</p>
        <Link href="/dashboard/applications" className="text-sm text-primary hover:underline">← Назад до заявок</Link>
      </div>
    );
  }

  return (
    <div className="page-transition max-w-5xl mx-auto">
      {/* Breadcrumb + navigation */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-muted">
          <Link href="/dashboard/applications" className="hover:text-primary transition-colors font-medium">Заявки</Link>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-foreground font-semibold">{app.firstName} {app.lastName}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => prevId && router.push(`/dashboard/applications/${prevId}`)}
            disabled={!prevId}
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl border border-border hover:border-primary/30 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            <span className="hidden sm:inline">Попередня</span>
          </button>
          <span className="text-xs text-muted font-medium">{currentIndex + 1} / {allIds.length}</span>
          <button
            onClick={() => nextId && router.push(`/dashboard/applications/${nextId}`)}
            disabled={!nextId}
            className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl border border-border hover:border-primary/30 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <span className="hidden sm:inline">Наступна</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-5 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-sm flex-shrink-0"
            style={{ background: avatarGradient() }}
          >
            {app.firstName[0]}{app.lastName[0]}
          </div>
          <div>
            <h1 className="text-xl font-black text-foreground">{app.firstName} {app.lastName}</h1>
            {(app.institution || app.degree) && (
              <p className="text-sm text-muted mt-0.5">
                {[app.institution, app.degree].filter(Boolean).join(" · ")}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_CHIP[app.status]}`}>{STATUS_LABEL[app.status]}</span>
              <span className="text-xs text-muted">{app.country}</span>
              <span className="text-xs text-muted">· Подано {formatDate(app.submittedAt)}</span>
            </div>
          </div>
        </div>

        {/* Status actions */}
        <div className="flex flex-col items-end gap-2">
          <p className="text-xs text-muted font-medium">Змінити статус:</p>
          <div className="flex items-center gap-1.5">
            {STATUSES.filter((s) => s !== app.status).map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                disabled={savingStatus}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all disabled:opacity-50 ${STATUS_BTN_OUTLINE[s]}`}
              >
                {STATUS_LABEL[s]}
              </button>
            ))}
          </div>
          {statusMsg && <p className="text-xs font-semibold text-green-600 animate-pulse">{statusMsg}</p>}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Left: motivation + documents + activity */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Motivation */}
          {app.motivation && (
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary-light rounded-lg flex items-center justify-center">✍️</span>
                Мотиваційний лист
              </h2>
              <div className="border-l-4 border-primary/30 pl-4">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line break-words">{app.motivation}</p>
              </div>
            </div>
          )}

          {/* Details — only render if there's something to show */}
          {(app.languages.length > 0 || app.degree || app.internalNote) && (
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary-light rounded-lg flex items-center justify-center text-xs">📋</span>
                Деталі заявки
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {app.languages.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">Мови</p>
                    <div className="flex flex-wrap gap-1">
                      {app.languages.map((l) => (
                        <span key={l} className="text-xs font-medium bg-muted-bg text-foreground px-2.5 py-1 rounded-lg">{l}</span>
                      ))}
                    </div>
                  </div>
                )}
                {app.degree && (
                  <div>
                    <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">Ступінь</p>
                    <p className="text-sm font-medium text-foreground">{app.degree}</p>
                  </div>
                )}
                {app.internalNote && (
                  <div className="col-span-2">
                    <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-1.5">Внутрішня нотатка</p>
                    <p className="text-sm text-foreground leading-relaxed">{app.internalNote}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Documents */}
          {(app.cvUrl || app.portfolioUrl) && (
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary-light rounded-lg flex items-center justify-center text-xs">📎</span>
                Документи
              </h2>
              <div className="flex flex-col gap-3">
                {app.cvUrl && (
                  <a href={app.cvUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 bg-muted-bg rounded-xl hover:bg-primary-light hover:text-primary transition-all group">
                    <svg className="w-4 h-4 text-muted group-hover:text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    <span className="text-sm font-medium">Резюме / CV</span>
                    <span className="text-xs text-muted ml-auto truncate max-w-48">{app.cvUrl}</span>
                  </a>
                )}
                {app.portfolioUrl && (
                  <a href={app.portfolioUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 bg-muted-bg rounded-xl hover:bg-primary-light hover:text-primary transition-all group">
                    <svg className="w-4 h-4 text-muted group-hover:text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                    <span className="text-sm font-medium">Портфоліо</span>
                    <span className="text-xs text-muted ml-auto truncate max-w-48">{app.portfolioUrl}</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Custom answers */}
          {app.customAnswers && Object.keys(app.customAnswers).length > 0 && (
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                <span className="w-6 h-6 bg-primary-light rounded-lg flex items-center justify-center text-xs">❓</span>
                Відповіді на питання організатора
              </h2>
              <div className="flex flex-col gap-4">
                {Object.entries(app.customAnswers).map(([key, value]) => (
                  <div key={key} className="border-b border-border pb-4 last:border-0 last:pb-0">
                    <p className="text-xs font-semibold text-muted mb-1.5 break-words">{key}</p>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap break-words">
                      {Array.isArray(value) ? value.join(", ") : value || "—"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activity log */}
          <div className="bg-white rounded-2xl border border-border p-6">
            <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-primary-light rounded-lg flex items-center justify-center text-xs">📜</span>
              Журнал активності
            </h2>
            {appLog.length === 0 ? (
              <p className="text-sm text-muted text-center py-6">Поки що немає записів</p>
            ) : (
              <div className="space-y-0">
                {appLog.map((entry, i) => (
                  <div key={entry.id} className={`flex items-start gap-3 py-3 ${i < appLog.length - 1 ? "border-b border-border" : ""}`}>
                    <div className="w-7 h-7 rounded-xl bg-muted-bg flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                      {ACTION_ICON[entry.action] ?? "•"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground font-medium">{entry.detail}</p>
                      <p className="text-xs text-muted mt-0.5">{entry.author} · {formatDateTime(entry.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: contact + notes */}
        <div className="flex flex-col gap-5">

          {/* Contact info */}
          <div className="bg-white rounded-2xl border border-border p-5">
            <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-primary-light rounded-lg flex items-center justify-center text-xs">👤</span>
              Контакти
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-muted-bg rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted uppercase font-semibold tracking-wider">Email</p>
                  <a href={`mailto:${app.email}`} className="text-sm font-medium text-primary hover:underline truncate block">{app.email}</a>
                </div>
              </div>
              {app.phone && (
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 bg-muted-bg rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted uppercase font-semibold tracking-wider">Телефон</p>
                    <p className="text-sm font-medium text-foreground truncate">{app.phone}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-muted-bg rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted uppercase font-semibold tracking-wider">Країна</p>
                  <p className="text-sm font-medium text-foreground truncate">{app.country}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-muted-bg rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <div className="min-w-0">
                  <p className="text-[11px] text-muted uppercase font-semibold tracking-wider">Заклад</p>
                  <p className="text-sm font-medium text-foreground truncate">{app.institution}</p>
                </div>
              </div>
            </div>

            {/* Project */}
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-[11px] text-muted uppercase font-semibold tracking-wider mb-1.5">Проєкт</p>
              <p className="text-sm font-semibold text-foreground">{app.projectTitle}</p>
              <Link href={`/dashboard/projects/${app.projectId}`} className="text-xs text-primary hover:underline mt-0.5 inline-block">
                Відкрити проєкт →
              </Link>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl border border-border p-5">
            <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="w-6 h-6 bg-primary-light rounded-lg flex items-center justify-center text-xs">📝</span>
              Нотатки команди
            </h2>

            {/* Existing notes */}
            {appNotes.length > 0 && (
              <div className="space-y-3 mb-4">
                {appNotes.map((note) => (
                  <div key={note.id} className="bg-muted-bg rounded-xl p-3 relative group">
                    <p className="text-sm text-foreground leading-relaxed pr-6">{note.content}</p>
                    <p className="text-[11px] text-muted mt-2">{note.authorName} · {formatDateTime(note.createdAt)}</p>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="absolute top-3 right-3 w-5 h-5 rounded-full bg-border/70 text-muted hover:bg-red-100 hover:text-red-500 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"
                      title="Видалити"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add note */}
            <div className="space-y-2">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Додати нотатку для команди..."
                rows={3}
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-border bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all placeholder:text-muted"
              />
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="w-full py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Зберегти нотатку
              </button>
            </div>
          </div>

          {/* Quick status change card */}
          <div className="bg-white rounded-2xl border border-border p-5">
            <h2 className="text-sm font-bold text-foreground mb-3">Поточний статус</h2>
            <div className="flex flex-col gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  disabled={app.status === s || savingStatus}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:cursor-default ${
                    app.status === s
                      ? STATUS_BTN[s] + " shadow-sm"
                      : "border " + STATUS_BTN_OUTLINE[s]
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s === "new" ? "bg-blue-400" : s === "reviewing" ? "bg-amber-400" : s === "selected" ? "bg-green-400" : "bg-red-400"} ${app.status === s ? "bg-white/60" : ""}`} />
                  {STATUS_LABEL[s]}
                  {app.status === s && <svg className="w-3.5 h-3.5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ApplicationDetailPage() {
  return <ApplicationDetail />;
}
