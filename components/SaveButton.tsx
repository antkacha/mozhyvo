"use client";

import { useSaved } from "@/hooks/useSaved";

export default function SaveButton({ slug }: { slug: string }) {
  const { isSaved, toggle, ready } = useSaved();
  const saved = isSaved(slug);

  return (
    <button
      onClick={() => toggle(slug)}
      disabled={!ready}
      className={`flex items-center justify-center gap-2 w-full py-3 px-6 border rounded-xl font-medium text-sm transition-all duration-200 ${
        saved
          ? "border-primary bg-primary-light text-primary"
          : "border-border text-foreground hover:border-primary hover:text-primary"
      } disabled:opacity-50`}
    >
      <svg
        className="w-4 h-4 flex-shrink-0"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
      {saved ? "Збережено" : "Зберегти"}
    </button>
  );
}
