"use client";

import { useEffect } from "react";

export default function ViewTracker({ projectId }: { projectId: string }) {
  useEffect(() => {
    fetch(`/api/projects/${projectId}/view`, { method: "POST" }).catch(() => {});
  }, [projectId]);

  return null;
}
