"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { typeEmoji, typeGradient, type OpportunityType } from "@/lib/data";
import { getCoverThumbUrl } from "@/lib/cover-url";

// Must match next.config.js's images.remotePatterns hostname — that's the
// only host next/image is actually allowed to fetch/optimize.
const SUPABASE_STORAGE_HOST = "lqtikyzevpjbtueajpsh.supabase.co";

function isSupabaseStorageUrl(url: string): boolean {
  try {
    return new URL(url).hostname === SUPABASE_STORAGE_HOST;
  } catch {
    return false; // blob:, data:, or anything unparseable as an absolute URL
  }
}

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
  // Small card grids only: load the 640x360 cover-thumb.jpg next to the
  // cover instead of the full 1280x720 file. If the thumb is missing (not
  // backfilled yet, or its upload failed) the full cover is used instead —
  // once; a failure of the full cover then shows the gradient as before.
  thumb?: boolean;
}

export default function OpportunityCoverImage({
  photo, title, type, className = "", sizes = "100vw", priority = false, thumb = false,
}: Props) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(priority);
  const [thumbFailed, setThumbFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const gradient = typeGradient[type] ?? "linear-gradient(135deg,#3B4FE8,#7C3AED)";

  // What is actually requested: the thumb (when asked for and derivable),
  // else the cover itself. getCoverThumbUrl returns non-Storage URLs as-is.
  const src = thumb && !thumbFailed ? getCoverThumbUrl(photo) : photo;

  // Thumb → full cover exactly once; any error on the full cover (or when no
  // thumb was in play, src === photo) is final.
  function handleError() {
    if (src !== photo) setThumbFailed(true);
    else setFailed(true);
  }

  useEffect(() => {
    setFailed(false);
    setLoaded(priority);
    setThumbFailed(false);
  }, [photo, priority]);

  useEffect(() => {
    // The <img> is server-rendered, so the browser can start (and finish,
    // for fast/cached failures) the request before hydration attaches
    // onError/onLoad — those events don't retroactively fire, and "error"
    // doesn't bubble either way. Catch both races by checking the
    // already-settled state on mount.
    const img = imgRef.current;
    if (!img || !img.complete) return;
    if (img.naturalWidth === 0) handleError();
    else setLoaded(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  // next/image can only optimize URLs matching next.config.js's
  // remotePatterns (our Supabase Storage host) — anything else throws a
  // hard "Invalid src prop... hostname is not configured" error at render
  // time, not a catchable onError. That covers more than blob:/data: local
  // previews: CoverPhotoUpload's "За посиланням" mode sets photo to a real
  // http(s) URL too, but an EXTERNAL one, before it's been fetched down to
  // our Storage by the server — same problem, needs the same plain <img>
  // fallback. Only skip next/image once the URL is actually ours.
  const isOptimizable = photo ? isSupabaseStorageUrl(photo) : false;

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
        {!isOptimizable ? (
          // eslint-disable-next-line @next/next/no-img-element -- not on our Storage yet, not optimizable
          <img
            ref={imgRef}
            src={src}
            alt={title}
            className={`absolute inset-0 w-full h-full ${imgClassName}`}
            onLoad={() => setLoaded(true)}
            onError={handleError}
          />
        ) : (
          <Image
            ref={imgRef}
            src={src!}
            alt={title}
            fill
            sizes={sizes}
            priority={priority}
            quality={85}
            className={imgClassName}
            onLoad={() => setLoaded(true)}
            onError={handleError}
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
