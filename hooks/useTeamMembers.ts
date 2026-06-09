"use client";

import { useState, useEffect, useCallback } from "react";

export type TeamRole = "owner" | "admin" | "reviewer";
export type TeamStatus = "active" | "pending";

export interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: TeamRole;
  status: TeamStatus;
  joinedAt: string;
}

const KEY = "mozhyvo_team_members";

const SEED: TeamMember[] = [
  { id: "member-001", email: "org@mozhyvo.org", name: "Власник акаунту", role: "owner", status: "active", joinedAt: "2025-05-10" },
];

function load(): TeamMember[] {
  try { const s = localStorage.getItem(KEY); return s ? JSON.parse(s) : []; } catch { return []; }
}
function save(m: TeamMember[]) { localStorage.setItem(KEY, JSON.stringify(m)); }

export function useTeamMembers() {
  const [members, setMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    let all = load();
    if (all.length === 0) { all = SEED; save(all); }
    setMembers(all);
  }, []);

  const invite = useCallback((email: string, role: TeamRole, name?: string): boolean => {
    const all = load();
    if (all.some((m) => m.email === email)) return false;
    const m: TeamMember = {
      id: `member-${Date.now()}`,
      email,
      name: name?.trim() || email.split("@")[0],
      role,
      status: "pending",
      joinedAt: new Date().toISOString().split("T")[0],
    };
    const updated = [...all, m];
    save(updated);
    setMembers(updated);
    return true;
  }, []);

  const remove = useCallback((id: string) => {
    const updated = load().filter((m) => m.id !== id);
    save(updated);
    setMembers(updated);
  }, []);

  const updateRole = useCallback((id: string, role: TeamRole) => {
    const updated = load().map((m) => (m.id === id ? { ...m, role } : m));
    save(updated);
    setMembers(updated);
  }, []);

  return { members, invite, remove, updateRole };
}
