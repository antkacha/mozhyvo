"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

export function useSaved() {
  const supabase = useMemo(() => createClient(), []);
  const [saved, setSaved] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaved([]);
      setReady(true);
      return;
    }
    const { data } = await supabase
      .from("saved_opportunities")
      .select("opportunity_slug")
      .eq("user_id", user.id);
    setSaved(data ? data.map((r: { opportunity_slug: string }) => r.opportunity_slug) : []);
    setReady(true);
  }, [supabase]);

  useEffect(() => {
    load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") load();
      else if (event === "SIGNED_OUT") {
        setSaved([]);
        setReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [load, supabase]);

  const toggle = useCallback(
    async (slug: string) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }
      if (saved.includes(slug)) {
        await supabase
          .from("saved_opportunities")
          .delete()
          .eq("user_id", user.id)
          .eq("opportunity_slug", slug);
        setSaved((prev) => prev.filter((s) => s !== slug));
      } else {
        await supabase
          .from("saved_opportunities")
          .insert({ user_id: user.id, opportunity_slug: slug });
        setSaved((prev) => [...prev, slug]);
      }
    },
    [saved, supabase]
  );

  const isSaved = useCallback((slug: string) => saved.includes(slug), [saved]);

  return { saved, isSaved, toggle, ready };
}
