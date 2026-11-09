"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { OpportunityType } from "@/lib/data";
import { getCoverThumbUrl } from "@/lib/cover-url";
import CoverPlaceholder from "@/components/CoverPlaceholder";

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
  // No longer affects rendering (the placeholder is the same for every type);
  // kept so call sites don't change.
  type: OpportunityType;
  className?: string;
  // Real rendered width per breakpoint — without this next/image assumes
  // 100vw and serves a far bigger file than the card actually needs.
  sizes?: string;
  // The LCP candidate on a given page (detail-page hero, home hero, first
  // catalog card): loads eager + fetchpriority=high and is NOT faded in —
  // any transition there would itself be the "мерцання" this is meant to
  // kill; priority images should just be in place, not animate into place.
  // Every other cover fades in over the placeholder.
  priority?: boolean;
  // Small card grids only: load the 640x360 cover-thumb.jpg next to the
  // cover instead of the full 1280x720 file. If the thumb is missing (not
  // backfilled yet, or its upload failed) the full cover is used instead —
  // once; a failure of the full cover then shows the placeholder.
  thumb?: boolean;
}

export default function OpportunityCoverImage({
  photo, title, className = "", sizes = "100vw", priority = false, thumb = false,
}: Props) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(priority);
  const [thumbFailed, setThumbFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // What is actually requested: the thumb (when asked for and derivable),
  // else the cover itself. getCoverThumbUrl returns non-Storage URLs as-is.
  const src = thumb && !thumbFailed ? getCoverThumbUrl(photo) : photo;

  // Fallback chain: thumb → full cover (exactly once) → placeholder. An error
  // on the full cover (or when no thumb was in play, src === photo) is final.
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

  // Same box in every state (loading, loaded, no cover, failed) — the
  // placeholder sits underneath, so nothing ever shifts.
  const box = `relative w-full aspect-video overflow-hidden ${className}`;

  if (photo && !failed) {
    const imgClassName = priority
      ? "object-cover"
      : `object-cover transition-opacity duration-300 motion-reduce:transition-none ${loaded ? "opacity-100" : "opacity-0"}`;

    return (
      <div className={box}>
        <CoverPlaceholder className="absolute inset-0" />
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
    <div className={box}>
      <CoverPlaceholder className="absolute inset-0" />
    </div>
  );
}
