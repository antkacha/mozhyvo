"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { type UserProfile, DEFAULT_PROFILE } from "@/lib/types";

export type { UserProfile };

function fromRow(row: Record<string, unknown>, email?: string): UserProfile {
  return {
    id: (row.id as string) ?? undefined,
    firstName: (row.first_name as string) ?? "",
    lastName: (row.last_name as string) ?? "",
    email: email ?? (row.email as string) ?? "",
    phone: (row.phone as string) ?? "",
    country: (row.country as string) ?? "",
    city: (row.city as string) ?? "",
    institution: (row.institution as string) ?? "",
    degree: (row.degree as string) ?? "",
    graduationYear: (row.graduation_year as string) ?? "",
    languages: (row.languages as string[]) ?? [],
    bio: (row.bio as string) ?? "",
    avatarUrl: (row.avatar_url as string) ?? "",
    cvUrl: (row.cv_url as string) ?? "",
    linkedinUrl: (row.linkedin_url as string) ?? "",
    telegram: (row.telegram as string) ?? "",
    interests: (row.interests as string[]) ?? [],
    role: ((row.role as string) === "admin" ? "admin" : "user"),
    onboardingDone: (row.onboarding_done as boolean) ?? false,
  };
}

function toRow(data: Partial<UserProfile>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (data.firstName    !== undefined) row.first_name       = data.firstName;
  if (data.lastName     !== undefined) row.last_name        = data.lastName;
  if (data.phone        !== undefined) row.phone            = data.phone;
  if (data.country      !== undefined) row.country          = data.country;
  if (data.city         !== undefined) row.city             = data.city;
  if (data.institution  !== undefined) row.institution      = data.institution;
  if (data.degree       !== undefined) row.degree           = data.degree;
  if (data.graduationYear!== undefined) row.graduation_year = data.graduationYear;
  if (data.languages    !== undefined) row.languages        = data.languages;
  if (data.bio          !== undefined) row.bio              = data.bio;
  if (data.avatarUrl    !== undefined) row.avatar_url       = data.avatarUrl;
  if (data.cvUrl        !== undefined) row.cv_url           = data.cvUrl;
  if (data.linkedinUrl  !== undefined) row.linkedin_url     = data.linkedinUrl;
  if (data.telegram     !== undefined) row.telegram         = data.telegram;
  if (data.interests    !== undefined) row.interests        = data.interests;
  if (data.onboardingDone !== undefined) row.onboarding_done = data.onboardingDone;
  row.updated_at = new Date().toISOString();
  return row;
}

export function useProfile() {
  const supabase = useMemo(() => createClient(), []);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setProfile(DEFAULT_PROFILE);
      setReady(true);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    setProfile(data ? fromRow(data, user.email) : { ...DEFAULT_PROFILE, email: user.email ?? "" });
    setReady(true);
  }, [supabase]);

  useEffect(() => {
    load();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") load();
      else if (event === "SIGNED_OUT") { setProfile(DEFAULT_PROFILE); setReady(true); }
    });
    return () => subscription.unsubscribe();
  }, [load, supabase]);

  const save = useCallback(async (data: Partial<UserProfile>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, ...toRow(data) }, { onConflict: "id" });
    if (!error) setProfile((prev) => ({ ...prev, ...data }));
    return error;
  }, [supabase]);

  return { profile, save, ready };
}
