import { Suspense } from "react";
import type { Metadata } from "next";
import OpportunitiesCatalog, { CatalogSkeleton } from "@/components/OpportunitiesCatalog";
import OpportunitiesHero from "@/components/OpportunitiesHero";

export const metadata: Metadata = {
  title: "Можливості для молоді України — гранти, стипендії, обміни",
  description:
    "Гранти, стипендії, стажування та програми обміну для молоді України. Erasmus+, DAAD, Фулбрайт та сотні інших — в одному місці.",
  keywords: [
    "гранти молодь Україна", "стипендії для студентів", "Erasmus+ Україна",
    "програми обміну студентів", "стажування за кордоном", "волонтерство Україна",
  ],
  alternates: { canonical: "https://www.mozhyvo.com.ua/opportunities" },
  openGraph: {
    title: "Можливості для молоді України",
    description: "Гранти, стипендії та обміни в одному місці",
    url: "https://www.mozhyvo.com.ua/opportunities",
    images: [{ url: "https://www.mozhyvo.com.ua/opengraph-image", width: 1200, height: 630 }],
  },
};

export default function OpportunitiesPage() {
  return (
    <>
      <OpportunitiesHero />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Suspense fallback={<CatalogSkeleton />}>
          <OpportunitiesCatalog />
        </Suspense>
      </div>
    </>
  );
}
