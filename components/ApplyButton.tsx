"use client";

import Link from "next/link";
import { useApplications } from "@/hooks/useApplications";

export default function ApplyButton({ slug }: { slug: string }) {
  const { hasApplied, ready } = useApplications();

  if (ready && hasApplied(slug)) {
    return (
      <div className="flex items-center justify-center gap-2 w-full py-3 px-6 bg-green-50 text-green-700 font-semibold rounded-xl text-sm border border-green-200">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
        Заявку подано
      </div>
    );
  }

  return (
    <Link
      href={`/opportunities/${slug}/apply`}
      className="block w-full text-center py-3 px-6 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all duration-200 shadow-sm shadow-primary/20 text-sm"
    >
      Подати заявку →
    </Link>
  );
}
