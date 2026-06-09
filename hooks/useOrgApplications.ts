"use client";

import { useState, useEffect, useCallback } from "react";

export interface OrgApplication {
  id: string;
  projectId: string;
  projectTitle: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  country: string;
  institution: string;
  degree: string;
  motivation: string;
  languages: string[];
  cvUrl?: string;
  portfolioUrl?: string;
  status: "new" | "reviewing" | "selected" | "rejected";
  internalNote?: string;
  submittedAt: string;
}

const STORAGE_KEY = "mozhyvo_org_applications";

const SEED: OrgApplication[] = [
  {
    id: "oa-001",
    projectId: "proj-001",
    projectTitle: "Молодіжний обмін «Разом до змін»",
    firstName: "Марія",
    lastName: "Коваленко",
    email: "maria.k@gmail.com",
    phone: "+380671234567",
    country: "Україна",
    institution: "КНУ ім. Тараса Шевченка",
    degree: "Бакалавр",
    motivation: "Я активно займаюся волонтерством вже 3 роки і хочу познайомитися з однодумцями з інших країн. Ця програма — чудова можливість обмінятися досвідом та навчитися новим підходам до вирішення соціальних проблем.",
    languages: ["Англійська (B2)", "Польська (A2)"],
    status: "new",
    submittedAt: "2025-05-20T10:30:00",
  },
  {
    id: "oa-002",
    projectId: "proj-001",
    projectTitle: "Молодіжний обмін «Разом до змін»",
    firstName: "Олексій",
    lastName: "Петренко",
    email: "o.petrenko@ukr.net",
    country: "Україна",
    institution: "Львівська Політехніка",
    degree: "Магістр",
    motivation: "Маю досвід організації молодіжних заходів та хочу вийти на міжнародний рівень. Програма відповідає моїм цілям розвитку в сфері громадянського суспільства.",
    languages: ["Англійська (C1)", "Французька (B1)"],
    cvUrl: "https://example.com/cv-petrenk.pdf",
    status: "reviewing",
    internalNote: "Сильний кандидат. Перевірити рекомендаційного листа.",
    submittedAt: "2025-05-18T14:15:00",
  },
  {
    id: "oa-003",
    projectId: "proj-001",
    projectTitle: "Молодіжний обмін «Разом до змін»",
    firstName: "Анна",
    lastName: "Мельник",
    email: "anna.m@yahoo.com",
    phone: "+380991234567",
    country: "Україна",
    institution: "НаУКМА",
    degree: "Бакалавр",
    motivation: "Цікавлюся питаннями євроінтеграції та хочу долучитися до мережі молодих лідерів ЄС. Маю досвід участі у двох міжнародних конференціях.",
    languages: ["Англійська (C1)", "Німецька (B2)"],
    portfolioUrl: "https://anna-portfolio.com",
    status: "selected",
    internalNote: "Відмінний профіль. Підтвердити участь.",
    submittedAt: "2025-05-17T09:00:00",
  },
  {
    id: "oa-004",
    projectId: "proj-002",
    projectTitle: "Мікрогранти для молодіжних ініціатив",
    firstName: "Тарас",
    lastName: "Гриценко",
    email: "taras.grytsenko@gmail.com",
    country: "Україна",
    institution: "Харківський університет",
    degree: "Студент 3 курсу",
    motivation: "Хочу реалізувати проект «Зелений двір» — облаштування шкільних дворів у Харкові після ремонту. Маємо команду 4 осіб та підтримку місцевої громади.",
    languages: ["Українська", "Англійська (B1)"],
    status: "reviewing",
    submittedAt: "2025-05-22T11:00:00",
  },
  {
    id: "oa-005",
    projectId: "proj-002",
    projectTitle: "Мікрогранти для молодіжних ініціатив",
    firstName: "Софія",
    lastName: "Бондаренко",
    email: "sofia.b@gmail.com",
    country: "Україна",
    institution: "Одеський університет",
    degree: "Магістр",
    motivation: "Наш проект — освітні гуртки для дітей ВПО у Одесі. Вже 6 місяців ми проводимо безкоштовні заняття для 30 дітей, але потребуємо коштів на матеріали.",
    languages: ["Українська", "Англійська (B2)", "Румунська"],
    status: "new",
    submittedAt: "2025-05-25T16:30:00",
  },
  {
    id: "oa-006",
    projectId: "proj-002",
    projectTitle: "Мікрогранти для молодіжних ініціатив",
    firstName: "Іван",
    lastName: "Романюк",
    email: "i.romanyuk@ukr.net",
    country: "Україна",
    institution: "КНЕУ",
    degree: "Бакалавр",
    motivation: "Проект цифрової грамотності для людей похилого віку. Хочемо провести 10 безкоштовних воркшопів у Києві та Борисполі.",
    languages: ["Українська", "Англійська (A2)"],
    status: "rejected",
    internalNote: "Проект цікавий, але не відповідає цільовій аудиторії (молодь 16-30 р.). Порадити інший грант.",
    submittedAt: "2025-05-19T08:45:00",
  },
  {
    id: "oa-007",
    projectId: "proj-001",
    projectTitle: "Молодіжний обмін «Разом до змін»",
    firstName: "Дарина",
    lastName: "Шевчук",
    email: "daryna.sh@gmail.com",
    phone: "+380662345678",
    country: "Україна",
    institution: "ЧНУ ім. Федьковича",
    degree: "Магістр",
    motivation: "Займаюся розвитком молодіжної політики на Буковині. Участь в обміні дозволить познайомитися з кращими практиками ЄС та адаптувати їх для нашого регіону.",
    languages: ["Англійська (B2)", "Румунська"],
    cvUrl: "https://example.com/cv-shevchuk.pdf",
    status: "new",
    submittedAt: "2025-05-26T13:00:00",
  },
];

function loadAll(): OrgApplication[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as OrgApplication[]) : [];
  } catch {
    return [];
  }
}

function saveAll(apps: OrgApplication[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
}

export function useOrgApplications(projectId?: string) {
  const [applications, setApplications] = useState<OrgApplication[]>([]);
  const [ready, setReady] = useState(false);

  const reload = useCallback(() => {
    let all = loadAll();
    if (all.length === 0) {
      all = SEED;
      saveAll(all);
    }
    setApplications(projectId ? all.filter((a) => a.projectId === projectId) : all);
    setReady(true);
  }, [projectId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const updateApp = useCallback(
    (id: string, data: Partial<OrgApplication>) => {
      const all = loadAll();
      const updated = all.map((a) => (a.id === id ? { ...a, ...data } : a));
      saveAll(updated);
      setApplications(projectId ? updated.filter((a) => a.projectId === projectId) : updated);
    },
    [projectId]
  );

  return { applications, ready, updateApp };
}
