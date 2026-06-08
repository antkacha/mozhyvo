import { Suspense } from "react";
import type { Metadata } from "next";
import SavedList from "./SavedList";

export const metadata: Metadata = {
  title: "Збережені — Моживо",
  description: "Твої збережені можливості на Моживо.",
};

export default function SavedPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3">
          Збережені
        </h1>
        <p className="text-muted text-lg">
          Можливості, які ти відклав для перегляду.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-64 bg-muted-bg rounded-2xl" />
            ))}
          </div>
        }
      >
        <SavedList />
      </Suspense>
    </div>
  );
}
