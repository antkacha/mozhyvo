"use client";

import { useState } from "react";

type Segment = "all" | "users" | "orgs";
type BroadcastStatus = "draft" | "sent" | "scheduled";

interface Broadcast {
  id: string;
  subject: string;
  segment: Segment;
  status: BroadcastStatus;
  recipientCount: number;
  sentAt: string | null;
}

const DEMO_BROADCASTS: Broadcast[] = [
  { id: "1", subject: "Нові можливості на Моживо — Червень 2026", segment: "all",   status: "sent",   recipientCount: 1247, sentAt: "2026-06-01" },
  { id: "2", subject: "Дедлайн нагадування: Erasmus+",            segment: "users", status: "sent",   recipientCount: 892,  sentAt: "2026-05-25" },
  { id: "3", subject: "Оновлення для організацій",                  segment: "orgs",  status: "draft",  recipientCount: 0,    sentAt: null },
];

const SEGMENT_LABELS: Record<Segment, string> = {
  all:   "Всі користувачі", users: "Тільки учасники", orgs: "Тільки організації"
};

export default function AdminBroadcastsPage() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>(DEMO_BROADCASTS);
  const [composing, setComposing] = useState(false);
  const [subject, setSubject]     = useState("");
  const [body, setBody]           = useState("");
  const [segment, setSegment]     = useState<Segment>("all");
  const [sending, setSending]     = useState(false);

  async function handleSend() {
    if (!subject.trim() || !body.trim()) return;
    setSending(true);
    await new Promise((r) => setTimeout(r, 1200));
    setBroadcasts((prev) => [{
      id:             String(Date.now()),
      subject,
      segment,
      status:         "sent",
      recipientCount: segment === "all" ? 1247 : segment === "users" ? 892 : 89,
      sentAt:         new Date().toISOString().split("T")[0],
    }, ...prev]);
    setSubject(""); setBody(""); setComposing(false); setSending(false);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-foreground">Email-розсилки</h1>
          <p className="text-sm text-muted mt-0.5">Надсилай повідомлення сегментам користувачів</p>
        </div>
        <button onClick={() => setComposing(true)}
          className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-dark transition-all">
          + Нова розсилка
        </button>
      </div>

      {/* History */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-bold text-foreground">Попередні розсилки</h2>
        </div>
        <div className="divide-y divide-border">
          {broadcasts.map((b) => (
            <div key={b.id} className="flex items-center justify-between px-5 py-4 gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{b.subject}</p>
                <p className="text-xs text-muted mt-0.5">{SEGMENT_LABELS[b.segment]} · {b.sentAt ?? "чернетка"}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {b.status === "sent" && (
                  <span className="text-xs text-muted">{b.recipientCount.toLocaleString()} одержувачів</span>
                )}
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  b.status === "sent" ? "bg-green-50 text-green-700" : b.status === "draft" ? "bg-muted-bg text-muted" : "bg-blue-50 text-blue-600"
                }`}>
                  {b.status === "sent" ? "Надіслано" : b.status === "draft" ? "Чернетка" : "Заплановано"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compose modal */}
      {composing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setComposing(false)} />
          <div className="relative bg-white w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-border px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <h2 className="text-base font-bold text-foreground">Нова розсилка</h2>
              <button onClick={() => setComposing(false)} className="p-2 rounded-xl hover:bg-muted-bg text-muted">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="px-6 py-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Сегмент</label>
                <div className="flex gap-2">
                  {(["all", "users", "orgs"] as const).map((s) => (
                    <button key={s} onClick={() => setSegment(s)}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        segment === s ? "bg-primary text-white border-primary" : "border-border text-muted hover:border-primary hover:text-primary"
                      }`}>
                      {SEGMENT_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Тема листа</label>
                <input value={subject} onChange={(e) => setSubject(e.target.value)}
                  placeholder="Введіть тему..."
                  className="w-full px-3.5 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Текст листа</label>
                <textarea value={body} onChange={(e) => setBody(e.target.value)}
                  rows={8} placeholder="Напишіть текст повідомлення..."
                  className="w-full px-3.5 py-2.5 text-sm border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button onClick={() => setComposing(false)}
                  className="px-5 py-2.5 border border-border rounded-xl text-sm text-muted hover:bg-muted-bg transition-all">
                  Скасувати
                </button>
                <button onClick={handleSend}
                  disabled={!subject.trim() || !body.trim() || sending}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark disabled:opacity-50 transition-all flex items-center gap-2">
                  {sending && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
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
