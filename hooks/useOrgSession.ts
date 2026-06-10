"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

export interface OrgProfile {
  id: string;
  userId: string;
  name: string;
  type: string;
  country: string;
  city: string;
  website: string;
  phone: string;
  contactEmail: string;
  description: string;
  mission: string;
  founded: string;
  logo: string | null;
  coverImage: string | null;
  coverVideo: string | null;
  brandColor: string;
  focusAreas: string[];
  socials: {
    telegram?: string;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
  };
  status: "pending" | "verified" | "rejected" | "blocked";
  createdAt: string;
}

function fromRow(row: Record<string, unknown>): OrgProfile {
  return {
    id:           (row.id as string) ?? "",
    userId:       (row.user_id as string) ?? "",
    name:         (row.name as string) ?? "",
    type:         (row.type as string) ?? "",
    country:      (row.country as string) ?? "",
    city:         (row.city as string) ?? "",
    website:      (row.website as string) ?? "",
    phone:        (row.phone as string) ?? "",
    contactEmail: (row.contact_email as string) ?? "",
    description:  (row.description as string) ?? "",
    mission:      (row.mission as string) ?? "",
    founded:      (row.founded as string) ?? "",
    logo:         (row.logo_url as string | null) ?? null,
    coverImage:   (row.cover_image_url as string | null) ?? null,
    coverVideo:   (row.cover_video_url as string | null) ?? null,
    brandColor:   (row.brand_color as string) ?? "#3B4FE8",
    focusAreas:   (row.focus_areas as string[]) ?? [],
    socials:      (row.socials as OrgProfile["socials"]) ?? {},
    status:       (row.status as OrgProfile["status"]) ?? "pending",
    createdAt:    (row.created_at as string) ?? "",
  };
}

function toRow(data: Partial<OrgProfile>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (data.name         !== undefined) row.name            = data.name;
  if (data.type         !== undefined) row.type            = data.type;
  if (data.country      !== undefined) row.country         = data.country;
  if (data.city         !== undefined) row.city            = data.city;
  if (data.website      !== undefined) row.website         = data.website;
  if (data.phone        !== undefined) row.phone           = data.phone;
  if (data.contactEmail !== undefined) row.contact_email   = data.contactEmail;
  if (data.description  !== undefined) row.description     = data.description;
  if (data.mission      !== undefined) row.mission         = data.mission;
  if (data.founded      !== undefined) row.founded         = data.founded;
  if (data.logo         !== undefined) row.logo_url        = data.logo;
  if (data.coverImage   !== undefined) row.cover_image_url = data.coverImage;
  if (data.coverVideo   !== undefined) row.cover_video_url = data.coverVideo;
  if (data.brandColor   !== undefined) row.brand_color     = data.brandColor;
  if (data.focusAreas   !== undefined) row.focus_areas     = data.focusAreas;
  if (data.socials      !== undefined) row.socials         = data.socials;
  return row;
}

export function useOrgSession() {
  const supabase = useMemo(() => createClient(), []);
  const [org, setOrg] = useState<OrgProfile | null>(null);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setOrg(null); setReady(true); return; }

    const { data } = await supabase
      .from("orgs")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setOrg(fromRow(data as Record<string, unknown>));
      setReady(true);
      return;
    }

    // First login after email confirmation — bootstrap org from auth metadata
    const meta = user.user_metadata ?? {};
    if ((meta.role === "org" || meta.role === "coordinator") && meta.org_name) {
      const { data: created } = await supabase
        .from("orgs")
        .insert({
          user_id:       user.id,
          name:          meta.org_name as string,
          type:          (meta.org_type as string) ?? "",
          country:       (meta.org_country as string) ?? "",
          city:          (meta.org_city as string) ?? "",
          website:       (meta.org_website as string) ?? "",
          contact_email: user.email ?? "",
          description:   (meta.org_description as string) ?? "",
          status:        "pending",
        })
        .select()
        .single();

      await supabase
        .from("profiles")
        .upsert({ id: user.id, role: "org" }, { onConflict: "id" });

      setOrg(created ? fromRow(created as Record<string, unknown>) : null);
    } else {
      setOrg(null);
    }
    setReady(true);
  }, [supabase]);

  useEffect(() => {
    load();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") load();
      else if (event === "SIGNED_OUT") { setOrg(null); setReady(true); }
    });
    return () => subscription.unsubscribe();
  }, [load, supabase]);

  const update = useCallback(async (data: Partial<OrgProfile>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("orgs").update(toRow(data)).eq("user_id", user.id);
    if (!error) setOrg((prev) => prev ? { ...prev, ...data } : prev);
  }, [supabase]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setOrg(null);
  }, [supabase]);

  // login() kept for backward compat — no-op in Supabase mode
  const login = useCallback((_profile: OrgProfile) => {}, []);

  return { org, ready, login, update, logout };
}
