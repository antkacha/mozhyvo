"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function VerifiedInner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createClient();
    const code = searchParams.get("code");
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type");
    const next = searchParams.get("next") ?? "/";

    let navigated = false;

    function go(role: string | undefined) {
      if (navigated) return;
      navigated = true;
      const isOrg = role === "org" || role === "coordinator";
      const dest =
        next !== "/"
          ? next
          : isOrg
          ? "/dashboard"
          : "/cabinet";
      window.location.href = dest;
    }

    // Listen for SIGNED_IN — catches hash-fragment sessions that Supabase
    // browser client detects automatically on page load (#access_token=...)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (
          (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") &&
          session
        ) {
          go(session.user.user_metadata?.role);
        }
      }
    );

    async function handle() {
      // 1. PKCE code exchange (browser client has verifier in localStorage)
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          const { data: { user } } = await supabase.auth.getUser();
          go(user?.user_metadata?.role);
          return;
        }
      }

      // 2. Token hash (server couldn't verify — try client side)
      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as "signup" | "recovery" | "invite" | "email",
        });
        if (!error) {
          const { data: { user } } = await supabase.auth.getUser();
          go(user?.user_metadata?.role);
          return;
        }
      }

      // 3. Existing session (email was auto-confirmed, or user already logged in)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        go(session.user.user_metadata?.role);
        return;
      }

      // 4. Wait up to 3s for Supabase to process hash fragment asynchronously
      setTimeout(() => {
        if (!navigated) window.location.href = "/login?error=auth";
      }, 3000);
    }

    handle();

    return () => {
      subscription.unsubscribe();
      navigated = true;
    };
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-muted">Підтвердження email...</p>
      </div>
    </div>
  );
}

export default function VerifiedPage() {
  return (
    <Suspense>
      <VerifiedInner />
    </Suspense>
  );
}
