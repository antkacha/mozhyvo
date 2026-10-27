"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Partner } from "@/lib/partners";

/**
 * One partner tile: the org's own color logo, or its name as text when it
 * has no logo or the image fails. `duplicate` marks the marquee's second
 * copy — hidden from screen readers and skipped by keyboard focus.
 */
export default function PartnerLogo({ partner, duplicate = false }: { partner: Partner; duplicate?: boolean }) {
  const [failed, setFailed] = useState(!partner.hasLogo);
  const imgRef = useRef<HTMLImageElement>(null);

  // An image that failed before hydration never fires React's onError.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  return (
    <Link
      href={`/organizations/${partner.slug}`}
      tabIndex={duplicate ? -1 : undefined}
      title={partner.name}
      className="flex-none flex items-center justify-center h-12 md:h-14 w-32 md:w-40 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
    >
      {failed ? (
        <span className="font-black text-gray-900 text-center leading-tight line-clamp-2">{partner.name}</span>
      ) : (
        // Plain <img>: the logo route already serves the original file with
        // long cache headers, and images are unoptimized site-wide anyway.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={`/api/public/orgs/${encodeURIComponent(partner.slug)}/logo`}
          alt={partner.name}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="max-h-full max-w-full object-contain"
        />
      )}
    </Link>
  );
}
