"use client";

import { useEffect, useRef, useState } from "react";
import { typeEmoji, typeGradient, type OpportunityType } from "@/lib/data";

interface Props {
  photo?: string;
  title: string;
  type: OpportunityType;
  className?: string;
}

export default function OpportunityCoverImage({ photo, title, type, className = "" }: Props) {
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

  if (photo && !failed) {
    return (
      <img
        ref={imgRef}
        src={photo}
        alt={title}
        className={`w-full aspect-video object-cover ${className}`}
        onError={() => setFailed(true)}
      />
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
