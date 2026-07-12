"use client";

import { useState } from "react";

type Segment = "all" | "users" | "orgs";

interface Broadcast {
  id: string;
  subject: string;
  segment: Segment;
  count: number;
  sentAt: string;
}

const SEGMENT_LABELS: Record<Segment, string> = {
  all:   "Всі користувачі",
  users: "Тільки учасники",
  orgs:  "Тільки організації",
};

export default function AdminBroadcastsPage() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [composing, setComposing]   = useState(false);
  const [subject, setSubject]       = useState("");
  const [body, setBody]             = useState("");
  const [segment, setSegment]       = useState<Segment>("all");
  const [sending, setSending]       = useState(false);
  const [error, setError]           = useState("");

  async function handleSend() {
    if (!subject.trim() || !body.trim()) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/admin/broadcasts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body, segment }),
      });
      const json = await res.json() as { success?: boolean; count?: number; error?: string };
      if (!res.ok || !json.success) {
        setError(json.error ?? "Помилка надсилання");
        return;
      }
      setBroadcasts((prev) => [{
        id:      String(Date.now()),
        subject,
        segment,
        count:   json.count ?? 0,
        sentAt:  new Date().toISOString().split("T")[0],
      }, ...prev]);
      setSubject("");
      setBody("");
      setComposing(false);
    } catch {
      setError("Мережева помилка");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground">Email-розсилки</h1>
          <p className="text-sm text-muted mt-0.5">Надсилай повідомлення сегментам користувачів через Resend</p>
        </div>
        <button
          onClick={() => { setComposing(true); setError(""); }}
          className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-dark transition-all"
        >
          + Нова розсилка
        </button>
      </div>

      {/* History */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-bold text-foreground">Надіслані розсилки</h2>
          <p className="text-xs text-muted mt-0.5">Тільки за поточну сесію — після перезавантаження скидається</p>
        </div>
        {broadcasts.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-sm text-muted">Ще жодної розсилки</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {broadcasts.map((b) => (
              <div key={b.id} className="flex items-center justify-between px-5 py-4 gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{b.subject}</p>
                  <p className="text-xs text-muted mt-0.5">{SEGMENT_LABELS[b.segment]} · {b.sentAt}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-xs text-muted">{b.count.toLocaleString("uk-UA")} одержувачів</span>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700">
                    Надіслано
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Compose modal */}
      {composing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !sending && setComposing(false)} />
          <div className="relative bg-white w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-base font-bold text-foreground">Нова розсилка</h2>
              <button onClick={() => !sending && setComposing(false)} className="p-2 rounded-xl hover:bg-muted-bg text-muted">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-6 space-y-5">
              {/* Segment */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Сегмент</label>
                <div className="flex gap-2">
                  {(["all", "users", "orgs"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSegment(s)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        segment === s
                          ? "bg-primary text-white border-primary"
                          : "border-border text-muted hover:border-primary hover:text-primary"
                      }`}
                    >
                      {SEGMENT_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Тема листа</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Введіть тему..."
                  className="w-full px-3.5 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Текст листа</label>
                <p className="text-xs text-muted mb-2">Розділяй абзаци порожнім рядком — кожен стане окремим параграфом</p>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={8}
                  placeholder="Напишіть текст повідомлення..."
                  className="w-full px-3.5 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                />
              </div>

              {error && (
                <p className="text-xs text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>
              )}

              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => setComposing(false)}
                  disabled={sending}
                  className="px-5 py-2.5 border border-border rounded-xl text-sm text-muted hover:bg-muted-bg transition-all disabled:opacity-40"
                >
                  Скасувати
                </button>
                <button
                  onClick={handleSend}
                  disabled={!subject.trim() || !body.trim() || sending}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {sending && (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  {sending ? "Надсилаємо..." : "Надіслати"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
