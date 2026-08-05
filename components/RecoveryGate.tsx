"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Supabase (free tier) ignores emailRedirectTo for recovery links and always
// lands on the bare Site URL — i.e. this app's home page, not /auth/callback.
// The Supabase client auto-detects the recovery token from the URL (hash or
// PKCE code, whichever Supabase actually used) on any page and fires
// PASSWORD_RECOVERY instead of SIGNED_IN. This component listens for that
// event globally and redirects to the reset-password form before anything
// else treats the recovery session as a normal login.
export default function RecoveryGate() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" && pathname !== "/auth/reset-password") {
        router.replace("/auth/reset-password");
      }
    });

    return () => subscription.unsubscribe();
  }, [router, pathname]);

  return null;
}
