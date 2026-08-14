"use client";

import { useRouter } from "next/navigation";

// A real <a href> (not a <button>) so it still works via native navigation
// before hydration, and middle-click/ctrl-click "open in new tab" behaves
// normally — onClick only intercepts a plain left click.
export default function BackToOpportunities() {
  const router = useRouter();

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // let the browser handle new-tab/new-window clicks
    e.preventDefault();

    // OpportunitiesCatalog keeps this updated with its current URL the
    // whole time it's mounted. Navigating to that remembered URL directly
    // sidesteps soft-navigation detection entirely — document.referrer
    // was tried here before and doesn't update across a Next.js <Link>
    // soft navigation, so it couldn't tell "came from the in-app list"
    // from "arrived from anywhere else" once more than one route away.
    let lastListUrl: string | null = null;
    if (typeof window !== "undefined") {
      try {
        lastListUrl = sessionStorage.getItem("mzv_last_list_url");
      } catch {
        lastListUrl = null; // private mode / storage disabled
      }
    }

    router.push(lastListUrl || "/opportunities");
  }

  return (
    <a
      href="/opportunities"
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 text-sm text-primary/70 hover:text-primary transition-colors mb-7 font-medium"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      Назад до можливостей
    </a>
  );
}
