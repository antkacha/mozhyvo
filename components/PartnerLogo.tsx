"use client";

import { useEffect, useRef, useState } from "react";
import type { Partner } from "@/lib/partners";

const TILE =
  "flex-none flex items-center justify-center h-12 md:h-14 w-32 md:w-40 rounded-lg " +
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary";

/**
 * One partner tile: the uploaded color logo, or the name as text when there
 * is no logo or it fails to load. Links out only when the partner has a
 * link. `duplicate` marks the marquee's second copy — hidden from screen
 * readers and skipped by keyboard focus.
 */
export default function PartnerLogo({ partner, duplicate = false }: { partner: Partner; duplicate?: boolean }) {
  const [failed, setFailed] = useState(!partner.logoUrl);
  const imgRef = useRef<HTMLImageElement>(null);

  // An image that failed before hydration never fires React's onError.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);

  const content = failed ? (
    <span className="font-black text-gray-900 text-center leading-tight line-clamp-2">{partner.name}</span>
  ) : (
    // Plain <img>: the file is already resized WebP on Storage, and images
    // are unoptimized site-wide anyway.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={partner.logoUrl!}
      alt={partner.name}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      className="max-h-full max-w-full object-contain"
    />
  );

  if (!partner.linkUrl) {
    return <div className={TILE} title={partner.name}>{content}</div>;
  }
  return (
    <a
      href={partner.linkUrl}
      target="_blank"
      rel="noopener noreferrer"
      tabIndex={duplicate ? -1 : undefined}
      title={partner.name}
      className={TILE}
    >
      {content}
    </a>
  );
}
