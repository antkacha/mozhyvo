"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

// Module-level cache — shared across all hook instances in the same browser session.
// This means the second call to useOrgSession() returns data synchronously from cache
// instead of waiting for a fresh Supabase fetch → no layout shift on navigation.
let _cachedOrg: OrgProfile | null = null;
let _cachedReady = false;
let _cachedMemberRole: "owner" | "admin" | "reviewer" | null = null;
const _listeners = new Set<() => void>();

function notifyListeners() { _listeners.forEach((fn) => fn()); }

export interface OrgProfile {
  id: string;
  userId: string;
  slug: string;
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
  orgFormat: "official" | "informal";
  registrationNumber: string;
  status: "pending" | "verified" | "rejected" | "blocked";
  createdAt: string;
}

function fromRow(row: Record<string, unknown>): OrgProfile {
  return {
    id:           (row.id as string) ?? "",
    userId:       (row.user_id as string) ?? "",
    slug:         (row.slug as string) ?? "",
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
    socials:             (row.socials as OrgProfile["socials"]) ?? {},
    orgFormat:           ((row.org_format as string) ?? "official") as OrgProfile["orgFormat"],
    registrationNumber:  (row.registration_number as string) ?? "",
    status:              (row.status as OrgProfile["status"]) ?? "pending",
    createdAt:           (row.created_at as string) ?? "",
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
  const [org, setOrg] = useState<OrgProfile | null>(_cachedOrg);
  const [ready, setReady] = useState(_cachedReady);
  const [memberRole, setMemberRole] = useState<"owner" | "admin" | "reviewer" | null>(_cachedMemberRole);

  // Keep local state in sync with module cache
  useEffect(() => {
    const sync = () => {
      setOrg(_cachedOrg);
      setReady(_cachedReady);
      setMemberRole(_cachedMemberRole);
    };
    _listeners.add(sync);
    return () => { _listeners.delete(sync); };
  }, []);

  const setCache = useCallback((o: OrgProfile | null, r: boolean, role: "owner" | "admin" | "reviewer" | null = null) => {
    _cachedOrg = o; _cachedReady = r; _cachedMemberRole = role; notifyListeners();
  }, []);

  const load = useCallback(async () => {
    try {
      // Use server-side API to bypass RLS restrictions on orgs table
      const res = await fetch("/api/me/org");
      if (!res.ok) { setCache(null, true); return; }
      const json = await res.json() as { org: Record<string, unknown> | null; role?: string };
      if (json.org) {
        const role = (json.role ?? "owner") as "owner" | "admin" | "reviewer";
        setCache(fromRow(json.org), true, role);
      } else {
        setCache(null, true, null);
      }
    } catch (err) {
      console.error("[useOrgSession] load error:", err);
      setCache(null, true);
    }
  }, [setCache]);

  useEffect(() => {
    // Guard: only start a load if nobody else is already loading
    if (!_cachedReady) { load(); }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        // Reset ready so the load completes before any component acts on ready=true
        _cachedReady = false;
        load();
      } else if (event === "SIGNED_OUT") {
        setCache(null, true, null);
      }
    });
    return () => subscription.unsubscribe();
  }, [load, supabase, setCache]);

  const update = useCallback(async (data: Partial<OrgProfile>) => {
    const res = await fetch("/api/me/org", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toRow(data)),
    });
    if (!res.ok) {
      const json = await res.json() as { error?: string };
      throw new Error(json.error ?? "Save failed");
    }
    // Update cache from the actual saved DB row, not just the form values.
    // This catches silent 0-row updates and confirms the data is really persisted.
    const json = await res.json() as { ok: boolean; org?: Record<string, unknown> };
    if (json.org) {
      setCache(fromRow(json.org), true, _cachedMemberRole);
    } else {
      setCache(_cachedOrg ? { ..._cachedOrg, ...data } : null, true);
    }
  }, [setCache]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setCache(null, true);
  }, [supabase, setCache]);

  const reload = useCallback(() => {
    _cachedOrg = null;
    _cachedReady = false;
    _cachedMemberRole = null;
    notifyListeners();
    load();
  }, [load]);

  // login() kept for backward compat — no-op in Supabase mode
  const login = useCallback((_profile: OrgProfile) => {}, []);

  const isOwner = memberRole === "owner";

  return { org, ready, reload, login, update, logout, memberRole, isOwner };
}
