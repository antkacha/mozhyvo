"use client";

import { useState, useEffect, useMemo } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export function useAuth() {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If a recovery token is still being processed from the URL (stale
    // emails using the old Supabase-hosted verify link land here with the
    // session in the hash), skip the initial fetch so we never resolve
    // `loading=false` with the recovery user before RecoveryGate redirects.
    // Header renders its logged-out nav while loading stays true — never
    // the signed-in one, not even for a frame.
    const isRecoveryLink =
      window.location.hash.includes("type=recovery") ||
      new URLSearchParams(window.location.search).get("type") === "recovery";

    if (!isRecoveryLink) {
      supabase.auth.getUser().then(({ data: { user } }) => {
        setUser(user);
        setLoading(false);
      });
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // A recovery-link session is not a real login — RecoveryGate redirects
      // it to /auth/reset-password. Treating it as signed-in would flash
      // cabinet nav for anyone holding a password-reset link.
      if (event === "PASSWORD_RECOVERY") return;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return { user, loading, signOut };
}
