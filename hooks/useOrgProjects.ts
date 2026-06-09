"use client";

import { useState, useEffect, useCallback } from "react";

export interface OrgProject {
  id: string;
  orgId: string;
  title: string;
  type: string;
  typeName: string;
  shortDescription: string;
  fullDescription: string;
  requirements: string[];
  benefits: string[];
  tags: string[];
  deadline: string;
  deadlineDisplay: string;
  country: string;
  city: string;
  location: string;
  flag: string;
  format: "online" | "offline" | "hybrid";
  funding: "fully-funded" | "partially-funded" | "self-funded";
  fundingDetails?: string;
  duration?: string;
  languages: string[];
  ageMin?: number;
  ageMax?: number;
  status: "draft" | "published" | "closed";
  views: number;
  saves: number;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "mozhyvo_org_projects";
export const DEMO_ORG_ID = "demo-org-001";

const SEED: OrgProject[] = [
  {
    id: "proj-001",
    orgId: DEMO_ORG_ID,
    title: "Молодіжний обмін «Разом до змін»",
    type: "exchange",
    typeName: "Обмін",
    shortDescription: "Двотижневий обмін для молодих активістів з України та країн ЄС.",
    fullDescription: "Програма «Разом до змін» — це унікальна можливість для молодих лідерів обмінятися досвідом та напрацювати спільні рішення актуальних проблем. Учасники проведуть 14 днів у Варшаві разом з однодумцями з 8 країн.",
    requirements: ["Вік 18–28 років", "Рівень англійської B1+", "Досвід волонтерської або громадської діяльності", "Громадянство або проживання в Україні"],
    benefits: ["Повне фінансування (переліт, проживання, харчування)", "Культурна програма та екскурсії", "Сертифікат учасника Erasmus+", "Нетворкінг з активістами з 8 країн"],
    tags: ["Молодь", "Обмін", "ЄС", "Лідерство"],
    deadline: "2025-08-15",
    deadlineDisplay: "15 серп 2025",
    country: "Польща",
    city: "Варшава",
    location: "Варшава, Польща",
    flag: "🇵🇱",
    format: "offline",
    funding: "fully-funded",
    fundingDetails: "Перельоти, проживання, харчування",
    duration: "14 днів",
    languages: ["Англійська"],
    ageMin: 18,
    ageMax: 28,
    status: "published",
    views: 124,
    saves: 18,
    createdAt: "2025-04-10",
    updatedAt: "2025-04-10",
  },
  {
    id: "proj-002",
    orgId: DEMO_ORG_ID,
    title: "Мікрогранти для молодіжних ініціатив",
    type: "grant",
    typeName: "Грант",
    shortDescription: "Конкурс мікрогрантів до 5 000 грн для соціальних проектів молоді.",
    fullDescription: "Фонд «Молодь України» оголошує конкурс мікрогрантів для підтримки ініціатив молодих людей. Пріоритет — проекти у сферах екології, освіти та громадянського суспільства.",
    requirements: ["Вік 16–30 років", "Наявність готової ідеї соціального проекту", "Реєстрація або проживання в Україні", "Команда мінімум 2 особи"],
    benefits: ["Фінансування до 5 000 грн", "Менторська підтримка протягом реалізації", "Публікація проекту в медіа фонду", "Можливість отримати наступний грант"],
    tags: ["Грант", "Молодь", "Соціальний проект", "Україна"],
    deadline: "2025-09-01",
    deadlineDisplay: "1 вер 2025",
    country: "Україна",
    city: "Онлайн",
    location: "Онлайн",
    flag: "🇺🇦",
    format: "online",
    funding: "fully-funded",
    fundingDetails: "До 5 000 грн",
    languages: ["Українська"],
    ageMin: 16,
    ageMax: 30,
    status: "published",
    views: 89,
    saves: 22,
    createdAt: "2025-05-01",
    updatedAt: "2025-05-01",
  },
  {
    id: "proj-003",
    orgId: DEMO_ORG_ID,
    title: "Літня школа лідерства 2025",
    type: "conference",
    typeName: "Школа",
    shortDescription: "7-денна інтенсивна програма для майбутніх лідерів громадянського суспільства.",
    fullDescription: "Літня школа лідерства — це 7 днів інтенсивного навчання, нетворкінгу та практики для тих, хто хоче розвинути навички адвокасі, управління проектами та публічних комунікацій.",
    requirements: ["Вік 20–30 років", "Мотиваційний лист (до 500 слів)", "Досвід у громадянському суспільстві від 1 року"],
    benefits: ["Навчання від топ-тренерів", "Проживання та харчування у Львові", "Мережа випускників", "Доступ до бібліотеки матеріалів"],
    tags: ["Лідерство", "Навчання", "Громадянське суспільство"],
    deadline: "2025-07-01",
    deadlineDisplay: "1 лип 2025",
    country: "Україна",
    city: "Львів",
    location: "Львів",
    flag: "🇺🇦",
    format: "offline",
    funding: "fully-funded",
    duration: "7 днів",
    languages: ["Українська"],
    ageMin: 20,
    ageMax: 30,
    status: "draft",
    views: 0,
    saves: 0,
    createdAt: "2025-05-15",
    updatedAt: "2025-05-15",
  },
];

function loadAll(): OrgProject[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as OrgProject[]) : [];
  } catch {
    return [];
  }
}

function saveAll(projects: OrgProject[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function useOrgProjects(orgId?: string) {
  const [projects, setProjects] = useState<OrgProject[]>([]);
  const [ready, setReady] = useState(false);

  const reload = useCallback(() => {
    let all = loadAll();
    if (all.length === 0 && orgId === DEMO_ORG_ID) {
      all = SEED;
      saveAll(all);
    }
    setProjects(orgId ? all.filter((p) => p.orgId === orgId) : all);
    setReady(true);
  }, [orgId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const create = useCallback(
    (data: Omit<OrgProject, "id" | "createdAt" | "updatedAt" | "views" | "saves">): OrgProject => {
      const now = new Date().toISOString().split("T")[0];
      const project: OrgProject = {
        ...data,
        id: `proj-${Date.now()}`,
        views: 0,
        saves: 0,
        createdAt: now,
        updatedAt: now,
      };
      const all = loadAll();
      const updated = [...all, project];
      saveAll(updated);
      setProjects(orgId ? updated.filter((p) => p.orgId === orgId) : updated);
      return project;
    },
    [orgId]
  );

  const update = useCallback(
    (id: string, data: Partial<OrgProject>) => {
      const all = loadAll();
      const updated = all.map((p) =>
        p.id === id
          ? { ...p, ...data, updatedAt: new Date().toISOString().split("T")[0] }
          : p
      );
      saveAll(updated);
      setProjects(orgId ? updated.filter((p) => p.orgId === orgId) : updated);
    },
    [orgId]
  );

  const remove = useCallback(
    (id: string) => {
      const all = loadAll();
      const updated = all.filter((p) => p.id !== id);
      saveAll(updated);
      setProjects(orgId ? updated.filter((p) => p.orgId === orgId) : updated);
    },
    [orgId]
  );

  return { projects, ready, create, update, remove, reload };
}
