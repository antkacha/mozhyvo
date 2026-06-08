"use client";

import Image from "next/image";
import { useState } from "react";

interface Props {
  src: string;
  alt: string;
}

export default function FounderImage({ src, alt }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) return null;

  return (
    <Image
      src={src}
      alt={alt}
      width={128}
      height={128}
      className="object-cover w-full h-full"
      onError={() => setFailed(true)}
    />
  );
}
