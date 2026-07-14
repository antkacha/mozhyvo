"use client";

import { useEffect } from "react";

export default function ViewTracker({ projectId }: { projectId: string }) {
  useEffect(() => {
    const key = `viewed_${projectId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    fetch(`/api/projects/${projectId}/view`, { method: "POST" }).catch(() => {});
  }, [projectId]);

  return null;
}
