"use client";

import { useState, useEffect, useCallback } from "react";

export type TeamRole = "owner" | "admin" | "reviewer";
export type TeamStatus = "active" | "pending";

export interface TeamMember {
  id: string;
  userId: string;
  email: string;
  name: string;
  role: TeamRole;
  status: TeamStatus;
  joinedAt: string;
}

export function useTeamMembers() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/org/members");
      if (res.ok) {
        const { members: data } = await res.json();
        setMembers(data ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const invite = useCallback(async (email: string, role: TeamRole): Promise<{ ok: boolean; error?: string }> => {
    const res = await fetch("/api/org/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    const json = await res.json();
    if (!res.ok) return { ok: false, error: json.error ?? "Помилка при надсиланні запрошення" };
    await fetchMembers();
    return { ok: true };
  }, [fetchMembers]);

  const remove = useCallback(async (id: string) => {
    const member = members.find((m) => m.id === id);
    if (!member || member.role === "owner") return;
    await fetch(`/api/org/members/${member.userId}`, { method: "DELETE" });
    await fetchMembers();
  }, [members, fetchMembers]);

  const updateRole = useCallback(async (id: string, role: TeamRole) => {
    const member = members.find((m) => m.id === id);
    if (!member || member.role === "owner") return;
    await fetch(`/api/org/members/${member.userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    setMembers((prev) => prev.map((m) => m.id === id ? { ...m, role } : m));
  }, [members]);

  return { members, loading, invite, remove, updateRole };
}
