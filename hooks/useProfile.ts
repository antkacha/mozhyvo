"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  institution: string;
  degree: string;
  languages: string[];
  bio: string;
}

const DEFAULT: UserProfile = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  country: "",
  institution: "",
  degree: "",
  languages: [],
  bio: "",
};

function fromRow(row: Record<string, unknown>): UserProfile {
  return {
    firstName: (row.first_name as string) ?? "",
    lastName: (row.last_name as string) ?? "",
    email: (row.email as string) ?? "",
    phone: (row.phone as string) ?? "",
    country: (row.country as string) ?? "",
    institution: (row.institution as string) ?? "",
    degree: (row.degree as string) ?? "",
    languages: (row.languages as string[]) ?? [],
    bio: (row.bio as string) ?? "",
  };
}

export function useProfile() {
  const supabase = useMemo(() => createClient(), []);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setProfile(DEFAULT);
      setReady(true);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (data) {
      setProfile({
        ...fromRow(data),
        email: user.email ?? data.email ?? "",
      });
    }
    setReady(true);
  }, [supabase]);

  useEffect(() => {
    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") load();
      else if (event === "SIGNED_OUT") { setProfile(DEFAULT); setReady(true); }
    });

    return () => subscription.unsubscribe();
  }, [load, supabase]);

  const save = useCallback(
    async (data: Partial<UserProfile>) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const updates = {
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        country: data.country,
        institution: data.institution,
        degree: data.degree,
        languages: data.languages,
        bio: data.bio,
        updated_at: new Date().toISOString(),
      };
      // Remove undefined keys
      Object.keys(updates).forEach(
        (k) => (updates as Record<string, unknown>)[k] === undefined && delete (updates as Record<string, unknown>)[k]
      );

      await supabase.from("profiles").update(updates).eq("id", user.id);
      setProfile((prev) => ({ ...prev, ...data }));
    },
    [supabase]
  );

  return { profile, save, ready };
}
