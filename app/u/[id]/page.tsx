"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import UserAvatar from "@/components/UserAvatar";

interface PublicProfile {
  first_name: string;
  last_name: string;
  country: string;
  city: string;
  institution: string;
  degree: string;
  graduation_year: string;
  languages: string[];
  bio: string;
  avatar_url: string;
  linkedin_url: string;
  cv_url: string;
  telegram: string;
  interests: string[];
}

// ── Icons ──────────────────────────────────────────────────────────────────────
function LinkedInIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

function CVIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/users/${id}/profile`, { cache: "no-store" })
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => {
        if (data?.profile) setProfile(data.profile as PublicProfile);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-lg font-bold text-foreground">Профіль не знайдено</p>
        <Link href="/" className="text-sm text-primary hover:underline">На головну</Link>
      </div>
    );
  }

  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Учасник";
  const initials = [profile.first_name?.[0], profile.last_name?.[0]].filter(Boolean).join("").toUpperCase() || "?";
  const location = [profile.city, profile.country].filter(Boolean).join(", ");
  const education = [profile.institution, profile.degree, profile.graduation_year].filter(Boolean).join(" · ");

  const hasContacts = !!(profile.linkedin_url || profile.cv_url || profile.telegram);
  const hasInterests = (profile.interests ?? []).length > 0;
  const hasSidebar = hasContacts || hasInterests;

  return (
    <div className="page-transition min-h-screen bg-background">
      {/* Cover */}
      <div
        className="h-44 sm:h-52 w-full relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #3B4FE8 0%, #7C3AED 100%)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Avatar row */}
        <div className="-mt-12 mb-6 relative z-10">
          <UserAvatar
            url={profile.avatar_url}
            initials={initials}
            size={96}
            rounded="2xl"
            className="border-4 border-white shadow-xl sm:w-24 sm:h-24"
          />
        </div>

        {/* Name + meta */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-foreground leading-tight mb-2">
            {fullName}
          </h1>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            {location && (
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {location}
              </span>
            )}
            {education && (
              <>
                {location && <span className="text-border">·</span>}
                <span>{education}</span>
              </>
            )}
          </div>
        </div>

        {/* Content grid */}
        <div className={`grid grid-cols-1 gap-8 mb-16 ${hasSidebar ? "lg:grid-cols-3" : ""}`}>
          {/* Main */}
          <div className={`space-y-8 ${hasSidebar ? "lg:col-span-2" : ""}`}>
            {profile.bio && (
              <section>
                <h2 className="text-lg font-bold text-foreground mb-3">Про себе</h2>
                <p className="text-sm text-muted leading-relaxed whitespace-pre-line">{profile.bio}</p>
              </section>
            )}

            {(profile.languages ?? []).length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-foreground mb-3">Мови</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((lang) => (
                    <span key={lang} className="px-3 py-1.5 rounded-full bg-primary-light text-primary text-sm font-medium">
                      {lang}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {!profile.bio && (profile.languages ?? []).length === 0 && (
              <div className="bg-muted-bg rounded-2xl p-8 text-center">
                <p className="text-muted text-sm">Профіль ще не заповнено</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          {hasSidebar && (
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                {hasContacts && (
                  <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
                    <h3 className="font-bold text-foreground text-sm">Контакти</h3>

                    {profile.linkedin_url && (
                      <a
                        href={profile.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm text-muted hover:text-[#0A66C2] transition-colors group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-muted-bg flex items-center justify-center flex-shrink-0 group-hover:bg-[#0A66C2]/10">
                          <LinkedInIcon />
                        </div>
                        <span className="truncate">LinkedIn</span>
                      </a>
                    )}

                    {profile.cv_url && (
                      <a
                        href={profile.cv_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm text-muted hover:text-primary transition-colors group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-muted-bg flex items-center justify-center flex-shrink-0 group-hover:bg-primary-light">
                          <CVIcon />
                        </div>
                        <span className="truncate">CV / Резюме</span>
                      </a>
                    )}

                    {profile.telegram && (
                      <a
                        href={`https://t.me/${profile.telegram.replace(/^@/, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 text-sm text-muted hover:text-sky-600 transition-colors group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-muted-bg flex items-center justify-center flex-shrink-0 group-hover:bg-sky-50">
                          <TelegramIcon />
                        </div>
                        <span className="truncate">{profile.telegram.startsWith("@") ? profile.telegram : `@${profile.telegram}`}</span>
                      </a>
                    )}
                  </div>
                )}

                {hasInterests && (
                  <div className="bg-white rounded-2xl border border-border p-5">
                    <h3 className="font-bold text-foreground text-sm mb-3">Інтереси</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.interests.map((interest) => (
                        <span key={interest} className="px-3 py-1.5 rounded-full bg-muted-bg text-muted text-xs font-semibold">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer back link */}
      <div className="border-t border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Всі можливості
          </Link>
        </div>
      </div>
    </div>
  );
}
