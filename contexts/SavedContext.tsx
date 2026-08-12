"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { opportunities } from "@/lib/data";

const STATIC_SLUGS = new Set(opportunities.map((o) => o.slug));

interface SavedContextValue {
  saved: string[];
  isSaved: (slug: string) => boolean;
  toggle: (slug: string) => Promise<void>;
  clearAll: () => Promise<void>;
  ready: boolean;
}

// Filters raw saved_opportunities rows down to slugs that are still real,
// published, visible opportunities — the same "does this actually still
// exist and show up" rule the /saved and /cabinet/saved lists apply via
// usePublicOrgProjects. Without this, a deleted or unpublished project
// leaves an orphaned row that the list filters out but a naive count
// (saved.length) would still include, desyncing the header badge from
// what's actually shown.
async function filterVisible(slugs: string[]): Promise<string[]> {
  const staticVisible = slugs.filter((s) => STATIC_SLUGS.has(s));
  const dbSlugs = slugs.filter((s) => !STATIC_SLUGS.has(s));
  if (dbSlugs.length === 0) return staticVisible;

  try {
    const res = await fetch("/api/saved-opportunities/visible", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slugs: dbSlugs }),
    });
    if (!res.ok) return [...staticVisible, ...dbSlugs]; // fail open
    const { visible } = await res.json() as { visible: string[] };
    return [...staticVisible, ...visible];
  } catch {
    return [...staticVisible, ...dbSlugs]; // fail open — network hiccup, don't hide saves
  }
}

const SavedContext = createContext<SavedContextValue | null>(null);

export function SavedProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [saved, setSaved] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  // Track current user id to detect account switches
  const currentUserId = useRef<string | null>(null);

  const load = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      currentUserId.current = null;
      setSaved([]);
      setReady(true);
      return;
    }
    // If same user, no need to reload (unless first load)
    if (currentUserId.current === user.id && ready) return;
    currentUserId.current = user.id;
    const { data } = await supabase
      .from("saved_opportunities")
      .select("opportunity_slug")
      .eq("user_id", user.id);
    const rawSlugs = data ? data.map((r: { opportunity_slug: string }) => r.opportunity_slug) : [];
    setSaved(await filterVisible(rawSlugs));
    setReady(true);
  }, [supabase, ready]);

  useEffect(() => {
    load();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        currentUserId.current = null;
        setSaved([]);
        setReady(true);
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        // Force reload even if we think we know the user
        currentUserId.current = null;
        load();
      }
    });
    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  const toggle = useCallback(async (slug: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = "/login";
      return;
    }
    if (saved.includes(slug)) {
      const { error } = await supabase
        .from("saved_opportunities")
        .delete()
        .eq("user_id", user.id)
        .eq("opportunity_slug", slug);
      if (!error) setSaved((prev) => prev.filter((s) => s !== slug));
      else console.error("[saved] delete error:", error.message);
    } else {
      const { error } = await supabase
        .from("saved_opportunities")
        .insert({ user_id: user.id, opportunity_slug: slug });
      if (!error) setSaved((prev) => [...prev, slug]);
      else console.error("[saved] insert error:", error.message);
    }
  }, [saved, supabase]);

  const isSaved = useCallback((slug: string) => saved.includes(slug), [saved]);

  // Bulk delete for the whole user, not a loop over the (now visibility-
  // filtered) `saved` array — that also clears any orphaned rows the UI
  // can no longer see, instead of leaving them behind forever.
  const clearAll = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("saved_opportunities").delete().eq("user_id", user.id);
    if (!error) setSaved([]);
    else console.error("[saved] clearAll error:", error.message);
  }, [supabase]);

  return (
    <SavedContext.Provider value={{ saved, isSaved, toggle, clearAll, ready }}>
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSaved must be used inside SavedProvider");
  return ctx;
}
