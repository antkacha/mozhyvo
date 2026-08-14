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
  // Only the LCP candidate (first visible card) should skip lazy loading.
  priority?: boolean;
}

export default function OpportunityCoverImage({
  photo, title, type, className = "", sizes = "100vw", priority = false,
}: Props) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setFailed(false);
  }, [photo]);

  useEffect(() => {
    // The <img> is server-rendered, so the browser can start (and finish,
    // for fast/cached failures) the request before hydration attaches
    // onError — the "error" event doesn't bubble and gets missed. Catch
    // that race by checking the already-settled state on mount.
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) {
      setFailed(true);
    }
  }, [photo]);

  // Cover-photo upload previews are blob:/data: URLs (canvas-resized files
  // not yet on Supabase Storage) — next/image's optimizer can't fetch
  // those, only real http(s) URLs matching next.config.js's remotePatterns.
  const isLocalPreview = photo?.startsWith("blob:") || photo?.startsWith("data:");

  if (photo && !failed) {
    return (
      <div className={`relative w-full aspect-video ${className}`}>
        {isLocalPreview ? (
          // eslint-disable-next-line @next/next/no-img-element -- local blob/data preview, not optimizable
          <img
            ref={imgRef}
            src={photo}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
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
            className="object-cover"
            onError={() => setFailed(true)}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={`w-full aspect-video flex items-center justify-center ${className}`}
      style={{ background: typeGradient[type] ?? "linear-gradient(135deg,#3B4FE8,#7C3AED)" }}
    >
      <span className="text-5xl opacity-90" aria-hidden>{typeEmoji[type] ?? "✦"}</span>
    </div>
  );
}
