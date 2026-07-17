"use client";

import Link from "next/link";
import { useProfile } from "@/hooks/useProfile";
import { useApplications } from "@/hooks/useApplications";
import { useSaved } from "@/hooks/useSaved";
import { profileCompleteness } from "@/lib/types";
import { getRecommendations, getDaysUntilDeadline } from "@/lib/recommendations";
import { usePublicOrgProjects } from "@/hooks/usePublicOrgProjects";
import StatusBadge from "@/components/StatusBadge";

const STAT_CLS = "bg-white rounded-2xl border border-border p-5 flex flex-col gap-1";

export default function CabinetOverviewPage() {
  const { profile, ready: profileReady } = useProfile();
  const { applications, ready: appsReady } = useApplications();
  const { saved, ready: savedReady } = useSaved();

  const { projects: liveProjects, ready: projectsReady } = usePublicOrgProjects();
  const completeness = profileReady ? profileCompleteness(profile) : 0;
  const recentApps   = applications.slice(0, 5);
  const recommendations = (profileReady && projectsReady) ? getRecommendations(liveProjects, profile, 4) : [];
  const upcoming = applications
    .filter((a) => getDaysUntilDeadline(a.deadline) > 0 && getDaysUntilDeadline(a.deadline) <= 14)
    .sort((a, b) => getDaysUntilDeadline(a.deadline) - getDaysUntilDeadline(b.deadline))
    .slice(0, 3);

  const stats = [
    { label: "Усього заявок",  value: appsReady  ? applications.length : "–",  color: "text-primary" },
    { label: "Прийнято",       value: appsReady  ? applications.filter((a) => a.status === "accepted").length : "–",  color: "text-green-600" },
    { label: "Збережено",      value: savedReady ? saved.length : "–",          color: "text-amber-600" },
    { label: "На розгляді",    value: appsReady  ? applications.filter((a) => a.status === "reviewing").length : "–", color: "text-blue-600" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-black text-foreground">
          {profile.firstName ? `Привіт, ${profile.firstName} 👋` : "Мій кабінет"}
        </h1>
        <p className="text-sm text-muted mt-1">Відстежуй заявки та знаходь нові можливості</p>
      </div>

      {/* Onboarding banner — soft prompt, only for new users */}
      {profileReady && !profile.onboardingDone && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-amber-900">Налаштуй свій профіль за 1 хвилину</p>
            <p className="text-xs text-amber-700 mt-0.5">Вкажи інтереси, рівень освіти та мови — отримуй підходящі рекомендації</p>
          </div>
          <Link
            href="/onboarding"
            className="flex-shrink-0 px-4 py-2 bg-amber-500 text-white text-xs font-semibold rounded-xl hover:bg-amber-600 transition-all"
          >
            Налаштувати →
          </Link>
        </div>
      )}

      {/* Profile completeness */}
      {profileReady && completeness < 100 && (
        <div className="bg-primary-light border border-primary/20 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-bold text-foreground">Заповни профіль</p>
              <p className="text-xs text-muted mt-0.5">Повний профіль збільшує шанси на прийняття</p>
            </div>
            <span className="text-2xl font-black text-primary">{completeness}%</span>
          </div>
          <div className="h-2 bg-white rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${completeness}%` }} />
          </div>
          <Link href="/cabinet/profile"
            className="mt-3 inline-block text-xs font-semibold text-primary hover:underline">
            Заповнити профіль →
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map(({ label, value, color }) => (
          <div key={label} className={STAT_CLS}>
            <span className={`text-3xl font-black ${color}`}>{value}</span>
            <span className="text-xs text-muted">{label}</span>
          </div>
        ))}
      </div>

      {/* Upcoming deadlines */}
      {upcoming.length > 0 && (
        <section>
          <h2 className="text-base font-bold text-foreground mb-3">⏰ Найближчі дедлайни</h2>
          <div className="flex flex-col gap-2">
            {upcoming.map((a) => {
              const days = getDaysUntilDeadline(a.deadline);
              return (
                <div key={a.id} className={`flex items-center justify-between gap-3 p-4 rounded-2xl border ${days <= 3 ? "border-red-200 bg-red-50" : "border-amber-200 bg-amber-50"}`}>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{a.opportunityTitle}</p>
                    <p className="text-xs text-muted">{a.org}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-lg font-black ${days <= 3 ? "text-red-600" : "text-amber-600"}`}>{days}д</p>
                    <p className="text-[10px] text-muted">залишилось</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Recent applications */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-foreground">Останні заявки</h2>
          <Link href="/cabinet/applications" className="text-xs font-semibold text-primary hover:underline">Всі заявки →</Link>
        </div>
        {!appsReady ? (
          <div className="flex gap-2">{Array.from({length: 3}).map((_,i) => <div key={i} className="h-16 flex-1 bg-muted-bg rounded-xl animate-pulse" />)}</div>
        ) : recentApps.length === 0 ? (
          <div className="bg-white border border-border rounded-2xl p-8 text-center">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-sm font-semibold text-foreground mb-1">Заявок ще немає</p>
            <p className="text-xs text-muted mb-4">Подай першу заявку на програму мрії</p>
            <Link href="/opportunities" className="text-xs font-semibold text-primary hover:underline">Переглянути можливості →</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {recentApps.map((a) => (
              <div key={a.id} className="bg-white border border-border rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{a.opportunityTitle}</p>
                  <p className="text-xs text-muted">{a.org} · {new Date(a.submittedAt).toLocaleDateString("uk-UA")}</p>
                </div>
                <StatusBadge status={a.status} size="sm" />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-foreground">✨ Рекомендовано для тебе</h2>
            <Link href="/opportunities" className="text-xs font-semibold text-primary hover:underline">Всі →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recommendations.map((opp) => {
              const days = getDaysUntilDeadline(opp.deadline);
              return (
                <Link key={opp.slug} href={`/opportunities/${opp.slug}`}
                  className="bg-white border border-border rounded-2xl p-4 hover:border-primary/30 hover:shadow-sm transition-all group">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold text-muted">{opp.typeName}</span>
                    {days <= 7 && <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">⏰ {days}д</span>}
                  </div>
                  <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug mb-1">{opp.title}</p>
                  <p className="text-xs text-muted">{opp.flag} {opp.location}</p>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
