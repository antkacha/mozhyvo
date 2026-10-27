"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Partner } from "@/lib/partners";

const TILE =
  "flex-none flex items-center justify-center h-12 md:h-14 w-32 md:w-40 rounded-lg " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary";

/**
 * One partner tile: the org's wide showcase logo, linking to its profile.
 * If the image fails to load, the org name is shown instead of a broken
 * image. `duplicate` marks the marquee's second copy, which is hidden from
 * screen readers and skipped by keyboard focus. `eager` is for marquee tiles:
 * browsers don't lazy-load images clipped by an overflow-hidden track, so
 * lazy tiles would pop in as they scroll into view.
 */
export default function PartnerLogo({ partner, duplicate = false, eager = false }: { partner: Partner; duplicate?: boolean; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
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
      className={TILE}
    >
      {failed ? (
        <span className="font-black text-gray-900 text-center leading-tight line-clamp-2">{partner.name}</span>
      ) : (
        // Plain <img>: the file is already a resized WebP on Storage.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={imgRef}
          src={partner.showcaseLogoUrl}
          alt={partner.name}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailed(true)}
          className="max-h-full max-w-full object-contain"
        />
      )}
    </Link>
  );
}
