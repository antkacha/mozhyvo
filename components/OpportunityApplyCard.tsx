"use client";

import { useState } from "react";
import Link from "next/link";
import type { Opportunity } from "@/lib/data";
import { useSaved } from "@/hooks/useSaved";
import { getDaysUntilDeadline } from "@/lib/recommendations";

function DeadlineCountdown({ deadline }: { deadline: string }) {
  const days = getDaysUntilDeadline(deadline);
  // No parseable deadline (rolling/ASAP/empty) — nothing to count down to.
  // The status text is already shown above this block via deadlineDisplay.
  if (days === null) return null;
  if (days < 0) return <span className="text-sm font-semibold text-muted">Завершено</span>;
  const urgent = days <= 7;
  const soon   = days <= 14;
  return (
    <div className={`rounded-xl px-4 py-3 text-center ${urgent ? "bg-red-50" : soon ? "bg-amber-50" : "bg-primary-light"}`}>
      <p className={`text-3xl font-black ${urgent ? "text-red-600" : soon ? "text-amber-600" : "text-primary"}`}>
        {days}
      </p>
      <p className={`text-xs font-semibold mt-0.5 ${urgent ? "text-red-500" : soon ? "text-amber-500" : "text-primary/70"}`}>
        {days === 1 ? "день залишився" : days < 5 ? "дні залишилось" : "днів залишилось"}
      </p>
      {urgent && <p className="text-[10px] font-bold text-red-500 mt-1 uppercase tracking-wider">⏰ Дедлайн спливає!</p>}
    </div>
  );
}

function ShareButton({ title, url }: { title: string; url: string }) {
  const [copied, setCopied] = useState(false);
  async function handleShare() {
    if (navigator.share) {
      await navigator.share({ title, url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }
  return (
    <button
      onClick={handleShare}
      className="flex items-center justify-center gap-2 w-full py-2.5 px-4 border border-border rounded-xl text-sm font-medium text-foreground hover:border-primary hover:text-primary transition-all"
    >
      {copied ? (
        <>
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
          Скопійовано!
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
          Поділитися
        </>
      )}
    </button>
  );
}

export default function OpportunityApplyCard({ opp }: { opp: Opportunity }) {
  const { isSaved, toggle, ready: savedReady } = useSaved();
  const isExternal = opp.applyUrl.startsWith("http");
  const saved = isSaved(opp.slug);
  const days = getDaysUntilDeadline(opp.deadline);
  // No parseable deadline (rolling/ASAP/empty) means it never "expires"
  // on its own — closing is manual (status) for those programs.
  const expired = days !== null && days < 0;

  const facts = [
    opp.location ? { label: "Місце", value: `${opp.flag} ${opp.location}` } : null,
    { label: "Формат", value: opp.format === "online" ? "Онлайн" : opp.format === "hybrid" ? "Гібрид" : "Офлайн" },
    opp.duration ? { label: "Тривалість", value: opp.duration } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="rounded-2xl overflow-hidden border border-border shadow-sm bg-white">
      <div className={`px-6 py-5 ${days !== null && days <= 7 && !expired ? "bg-red-600" : expired ? "bg-muted-bg" : "bg-primary"}`}>
        <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${expired ? "text-muted" : "text-white/70"}`}>
          Дедлайн подачі
        </p>
        <p className={`text-2xl font-black leading-tight ${expired ? "text-muted" : "text-white"}`}>
          {opp.deadlineDisplay}
        </p>
        {expired && <p className="text-sm text-muted mt-1">Прийом заявок завершено</p>}
      </div>

      {!expired && (
        <div className="px-5 py-4">
          <DeadlineCountdown deadline={opp.deadline} />
        </div>
      )}

      {facts.length > 0 && (
        <div className="px-5 py-4 border-t border-gray-100 flex flex-col gap-0">
          {facts.map((f) => (
            <div key={f.label} className="flex items-start justify-between gap-3 py-2 first:pt-0 last:pb-0">
              <span className="text-xs text-muted flex-shrink-0">{f.label}</span>
              <span className="text-xs font-semibold text-gray-800 text-right">{f.value}</span>
            </div>
          ))}
        </div>
      )}

      <div className="px-5 py-5 border-t border-gray-100 flex flex-col gap-3">
        {expired ? (
          <div className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-muted-bg text-muted font-semibold rounded-xl text-sm border border-border">
            Прийом завершено
          </div>
        ) : isExternal ? (
          <a
            href={opp.applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center py-3 px-6 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all shadow-sm shadow-primary/20 text-sm"
          >
            Заповнити форму →
          </a>
        ) : (
          <Link
            href={`/opportunities/${opp.slug}/apply`}
            className="block w-full text-center py-3 px-6 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all shadow-sm shadow-primary/20 text-sm"
          >
            Подати заявку →
          </Link>
        )}
        <button
          onClick={() => toggle(opp.slug)}
          disabled={!savedReady}
          className={`flex items-center justify-center gap-2 w-full py-2.5 px-6 border rounded-xl font-medium text-sm transition-all ${
            saved ? "border-primary bg-primary-light text-primary" : "border-border text-foreground hover:border-primary hover:text-primary"
          } disabled:opacity-50`}
        >
          <svg className="w-4 h-4 flex-shrink-0" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          {saved ? "Збережено" : "Зберегти"}
        </button>
        <ShareButton title={opp.title} url={typeof window !== "undefined" ? window.location.href : ""} />
        {opp.infoPackUrl && (
          <a
            href={opp.infoPackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-6 border border-border rounded-xl text-sm font-medium text-foreground hover:border-primary hover:text-primary transition-all"
          >
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Переглянути інфопак
          </a>
        )}
      </div>
    </div>
  );
}
