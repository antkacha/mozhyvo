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

interface SavedContextValue {
  saved: string[];
  isSaved: (slug: string) => boolean;
  toggle: (slug: string) => Promise<void>;
  ready: boolean;
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
    setSaved(data ? data.map((r: { opportunity_slug: string }) => r.opportunity_slug) : []);
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

  return (
    <SavedContext.Provider value={{ saved, isSaved, toggle, ready }}>
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSaved must be used inside SavedProvider");
  return ctx;
}
