import { Suspense } from "react";
import type { Metadata } from "next";
import OpportunitiesCatalog from "@/components/OpportunitiesCatalog";

export const metadata: Metadata = {
  title: "Можливості — Моживо",
  description:
    "Гранти, стипендії, стажування, обміни та більше — для молоді України. Фільтруй за типом, країною та форматом.",
};

function CatalogSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-11 bg-muted-bg rounded-xl mb-6 max-w-xl" />
      <div className="flex gap-8">
        <div className="hidden lg:block w-52 flex-shrink-0 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-5 bg-muted-bg rounded" />
          ))}
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-muted-bg rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function OpportunitiesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3">
          Можливості
        </h1>
        <p className="text-muted text-lg">
          Гранти, стипендії, стажування, обміни та більше — для молоді України.
        </p>
      </div>
      <Suspense fallback={<CatalogSkeleton />}>
        <OpportunitiesCatalog />
      </Suspense>
    </div>
  );
}
