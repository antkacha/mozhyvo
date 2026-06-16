"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function VerifiedInner() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createClient();
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/";

    async function handle() {
      // Try to exchange PKCE code — browser client has the verifier in its own storage
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          const { data: { user } } = await supabase.auth.getUser();
          return finish(user?.user_metadata?.role, next);
        }
      }

      // Code exchange failed or no code — check existing session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        return finish(session.user.user_metadata?.role, next);
      }

      // No session at all → login
      window.location.href = "/login?error=auth";
    }

    handle();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
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

function finish(role: string | undefined, next: string) {
  const destination = next !== "/"
    ? next
    : role === "org" ? "/dashboard" : "/cabinet";
  window.location.href = destination;
}
