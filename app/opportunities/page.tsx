import { Suspense } from "react";
import type { Metadata } from "next";
import OpportunitiesCatalog from "@/components/OpportunitiesCatalog";
import GuestBanner from "@/components/GuestBanner";
import OpportunitiesHero from "@/components/OpportunitiesHero";

export const metadata: Metadata = {
  title: "Можливості для молоді України — гранти, стипендії, обміни",
  description:
    "Гранти, стипендії, стажування та програми обміну для молоді України. Erasmus+, DAAD, Фулбрайт та сотні інших — в одному місці.",
  keywords: [
    "гранти молодь Україна", "стипендії для студентів", "Erasmus+ Україна",
    "програми обміну студентів", "стажування за кордоном", "волонтерство Україна",
  ],
  alternates: { canonical: "https://mozhyvo.ua/opportunities" },
  openGraph: {
    title: "Можливості для молоді України",
    description: "Гранти, стипендії та обміни в одному місці",
    url: "https://mozhyvo.ua/opportunities",
    images: [{ url: "https://mozhyvo.ua/opengraph-image", width: 1200, height: 630 }],
  },
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
      <OpportunitiesHero />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <GuestBanner />
        <Suspense fallback={<CatalogSkeleton />}>
          <OpportunitiesCatalog />
        </Suspense>
      </div>
    </>
  );
}
