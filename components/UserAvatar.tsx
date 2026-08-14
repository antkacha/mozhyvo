"use client";

import { useState } from "react";
import Image from "next/image";

interface Props {
  url?: string | null;
  initials: string;
  size?: number;
  rounded?: "full" | "2xl";
  className?: string;
}

export default function UserAvatar({ url, initials, size = 40, rounded = "full", className = "" }: Props) {
  const [failed, setFailed] = useState(false);
  const shape = rounded === "2xl" ? "rounded-2xl" : "rounded-full";
  const fontSize = Math.max(Math.round(size * 0.3), 10);

  // Avatar-upload previews are blob:/data: URLs (local file, not yet
  // uploaded) — next/image's optimizer only handles real http(s) URLs.
  const isLocalPreview = url?.startsWith("blob:") || url?.startsWith("data:");

  if (url && !failed) {
    if (isLocalPreview) {
      return (
        // eslint-disable-next-line @next/next/no-img-element -- local blob/data preview, not optimizable
        <img
          src={url}
          alt={initials}
          width={size}
          height={size}
          className={`object-cover flex-shrink-0 ${shape} ${className}`}
          style={{ width: size, height: size }}
          onError={() => setFailed(true)}
        />
      );
    }
    return (
      <Image
        src={url}
        alt={initials}
        width={size}
        height={size}
        sizes={`${size}px`}
        className={`object-cover flex-shrink-0 ${shape} ${className}`}
        style={{ width: size, height: size }}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center text-white font-bold flex-shrink-0 ${shape} ${className}`}
      style={{ width: size, height: size, background: "linear-gradient(135deg,#3B4FE8,#7C3AED)", fontSize }}
    >
      {initials}
    </div>
  );
}
