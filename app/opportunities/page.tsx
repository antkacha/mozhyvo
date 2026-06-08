import { Suspense } from "react";
import type { Metadata } from "next";
import OpportunitiesCatalog from "@/components/OpportunitiesCatalog";
import GuestBanner from "@/components/GuestBanner";

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
    <>
      {/* ── Hero header ─────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/25 bg-white text-primary text-xs font-semibold shadow-sm mb-6">
            <span>✦</span>
            Всі можливості в одному місці
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-[1.05] mb-4">
            Можливості
          </h1>
          <p className="text-gray-500 text-lg max-w-xl">
            Гранти, стипендії, стажування, обміни та більше — для молоді України.
          </p>

          <div className="flex items-stretch gap-8 mt-8">
            <div>
              <p className="text-3xl font-black text-primary leading-none">1200+</p>
              <p className="text-sm text-gray-500 mt-1.5">можливостей</p>
            </div>
            <div className="w-px bg-gray-100" />
            <div>
              <p className="text-3xl font-black text-primary leading-none">40+</p>
              <p className="text-sm text-gray-500 mt-1.5">країн</p>
            </div>
            <div className="w-px bg-gray-100" />
            <div>
              <p className="text-3xl font-black text-primary leading-none">0₴</p>
              <p className="text-sm text-gray-500 mt-1.5">завжди безкоштовно</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Catalog ─────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <GuestBanner />
        <Suspense fallback={<CatalogSkeleton />}>
          <OpportunitiesCatalog />
        </Suspense>
      </div>
    </>
  );
}
