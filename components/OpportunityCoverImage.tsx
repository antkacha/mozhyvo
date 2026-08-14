"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { typeEmoji, typeGradient, type OpportunityType } from "@/lib/data";

interface Props {
  photo?: string;
  title: string;
  type: OpportunityType;
  className?: string;
  // Real rendered width per breakpoint — without this next/image assumes
  // 100vw and serves a far bigger file than the card actually needs.
  sizes?: string;
  // The LCP candidate on a given page (detail-page hero, home hero, first
  // catalog card): loads eager + fetchpriority=high, and — unlike the rest
  // of the catalog, which stays lazy with a placeholder-then-fade so
  // scrolling into a still-loading card doesn't show blank space — renders
  // with NO gradient placeholder and NO fade-in. Any transition there would
  // itself be the "мерцання" this is meant to kill; priority images should
  // just be in place, not animate into place.
  priority?: boolean;
}

export default function OpportunityCoverImage({
  photo, title, type, className = "", sizes = "100vw", priority = false,
}: Props) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  const gradient = typeGradient[type] ?? "linear-gradient(135deg,#3B4FE8,#7C3AED)";

  useEffect(() => {
    setFailed(false);
    setLoaded(priority);
  }, [photo, priority]);

  useEffect(() => {
    // The <img> is server-rendered, so the browser can start (and finish,
    // for fast/cached failures) the request before hydration attaches
    // onError/onLoad — those events don't retroactively fire, and "error"
    // doesn't bubble either way. Catch both races by checking the
    // already-settled state on mount.
    const img = imgRef.current;
    if (!img || !img.complete) return;
    if (img.naturalWidth === 0) setFailed(true);
    else setLoaded(true);
  }, [photo]);

  // Cover-photo upload previews are blob:/data: URLs (canvas-resized files
  // not yet on Supabase Storage) — next/image's optimizer can't fetch
  // those, only real http(s) URLs matching next.config.js's remotePatterns.
  const isLocalPreview = photo?.startsWith("blob:") || photo?.startsWith("data:");

  if (photo && !failed) {
    const imgClassName = priority ? "object-cover" : `object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`;

    return (
      <div className={`relative w-full aspect-video overflow-hidden ${className}`}>
        {/* Placeholder underlay — only for lazy (non-priority) images, where
            the card can scroll into view mid-fetch. Priority images skip
            this: preload + fetchpriority=high already gets them in place
            immediately, and adding a placeholder here would just reintroduce
            a visible swap. */}
        {!priority && (
          <div
            aria-hidden
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: gradient }}
          >
            <span className="text-5xl opacity-90">{typeEmoji[type] ?? "✦"}</span>
          </div>
        )}
        {isLocalPreview ? (
          // eslint-disable-next-line @next/next/no-img-element -- local blob/data preview, not optimizable
          <img
            ref={imgRef}
            src={photo}
            alt={title}
            className={`absolute inset-0 w-full h-full ${imgClassName}`}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
        ) : (
          <Image
            ref={imgRef}
            src={photo}
            alt={title}
            fill
            sizes={sizes}
            priority={priority}
            className={imgClassName}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={`w-full aspect-video flex items-center justify-center ${className}`}
      style={{ background: gradient }}
    >
      <span className="text-5xl opacity-90" aria-hidden>{typeEmoji[type] ?? "✦"}</span>
    </div>
  );
}
