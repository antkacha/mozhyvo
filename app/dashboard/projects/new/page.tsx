"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOrgSession } from "@/hooks/useOrgSession";
import { useOrgProjects, OrgProject } from "@/hooks/useOrgProjects";
import OrgShell from "@/components/OrgShell";

type FormData = {
  title: string;
  type: OrgProject["type"];
  typeName: string;
  shortDescription: string;
  fullDescription: string;
  country: string;
  city: string;
  flag: string;
  format: OrgProject["format"];
  funding: OrgProject["funding"];
  fundingDetails: string;
  deadline: string;
  duration: string;
  ageMin: string;
  ageMax: string;
  languagesInput: string;
  tagsInput: string;
  requirementsInput: string;
  benefitsInput: string;
  status: OrgProject["status"];
};

const TYPE_OPTIONS = [
  { value: "exchange", label: "Обмін" },
  { value: "grant", label: "Грант" },
  { value: "internship", label: "Стажування" },
  { value: "volunteer", label: "Волонтерство" },
  { value: "conference", label: "Конференція / Школа" },
  { value: "competition", label: "Конкурс" },
  { value: "hackathon", label: "Хакатон" },
  { value: "training", label: "Тренінг" },
];

const FLAG_OPTIONS = [
  { value: "🇺🇦", label: "🇺🇦 Україна" },
  { value: "🇵🇱", label: "🇵🇱 Польща" },
  { value: "🇩🇪", label: "🇩🇪 Німеччина" },
  { value: "🇫🇷", label: "🇫🇷 Франція" },
  { value: "🇳🇱", label: "🇳🇱 Нідерланди" },
  { value: "🇦🇹", label: "🇦🇹 Австрія" },
  { value: "🇨🇿", label: "🇨🇿 Чехія" },
  { value: "🇸🇰", label: "🇸🇰 Словаччина" },
  { value: "🇱🇹", label: "🇱🇹 Литва" },
  { value: "🇱🇻", label: "🇱🇻 Латвія" },
  { value: "🇪🇪", label: "🇪🇪 Естонія" },
  { value: "🇬🇧", label: "🇬🇧 Великобританія" },
  { value: "🇺🇸", label: "🇺🇸 США" },
  { value: "🌍", label: "🌍 Онлайн / міжнародний" },
  { value: "🇪🇺", label: "🇪🇺 Євросоюз" },
];

function listToArray(text: string): string[] {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function NewProjectContent() {
  const router = useRouter();
  const { org } = useOrgSession();
  const { create } = useOrgProjects(org?.id);

  const [form, setForm] = useState<FormData>({
    title: "",
    type: "exchange",
    typeName: "Обмін",
    shortDescription: "",
    fullDescription: "",
    country: "",
    city: "",
    flag: "🇺🇦",
    format: "offline",
    funding: "fully-funded",
    fundingDetails: "",
    deadline: "",
    duration: "",
    ageMin: "",
    ageMax: "",
    languagesInput: "",
    tagsInput: "",
    requirementsInput: "",
    benefitsInput: "",
    status: "draft",
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  function set(field: keyof FormData, value: string) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "type") {
        const opt = TYPE_OPTIONS.find((o) => o.value === value);
        next.typeName = opt?.label ?? value;
      }
      return next;
    });
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.title.trim()) e.title = "Вкажіть назву";
    if (!form.shortDescription.trim()) e.shortDescription = "Вкажіть короткий опис";
    if (!form.country.trim()) e.country = "Вкажіть країну";
    if (!form.deadline) e.deadline = "Вкажіть дедлайн";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(status: OrgProject["status"]) {
    if (!validate() || !org) return;
    setSaving(true);

    const deadline = form.deadline;
    const deadlineDate = new Date(deadline);
    const deadlineDisplay = deadlineDate.toLocaleDateString("uk-UA", { day: "numeric", month: "short", year: "numeric" });

    const location = form.city ? `${form.city}, ${form.country}` : form.country;

    create({
      orgId: org.id,
      title: form.title.trim(),
      type: form.type,
      typeName: form.typeName,
      shortDescription: form.shortDescription.trim(),
      fullDescription: form.fullDescription.trim(),
      country: form.country.trim(),
      city: form.city.trim(),
      location,
      flag: form.flag,
      format: form.format,
      funding: form.funding,
      fundingDetails: form.fundingDetails.trim(),
      deadline,
      deadlineDisplay,
      duration: form.duration.trim(),
      languages: listToArray(form.languagesInput),
      tags: form.tagsInput.split(",").map((s) => s.trim()).filter(Boolean),
      requirements: listToArray(form.requirementsInput),
      benefits: listToArray(form.benefitsInput),
      ageMin: form.ageMin ? Number(form.ageMin) : undefined,
      ageMax: form.ageMax ? Number(form.ageMax) : undefined,
      status,
    });

    router.push("/dashboard/projects");
  }

  const inputBase = "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white";
  const errorClass = "border-red-300 focus:ring-red-200 focus:border-red-400";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-gray-100 transition-all text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Новий проект</h1>
          <p className="text-sm text-gray-500">Заповніть інформацію про вашу можливість</p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Основна інформація */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-black">1</span>
            Основна інформація
          </h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className={labelClass}>Назва проекту *</label>
              <input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Наприклад: Молодіжний обмін «Разом до змін»"
                className={`${inputBase} ${errors.title ? errorClass : ""}`}
              />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Тип можливості</label>
                <select value={form.type} onChange={(e) => set("type", e.target.value)} className={inputBase}>
                  {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Формат</label>
                <select value={form.format} onChange={(e) => set("format", e.target.value)} className={inputBase}>
                  <option value="offline">Офлайн</option>
                  <option value="online">Онлайн</option>
                  <option value="hybrid">Гібрид</option>
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Короткий опис (1–2 речення) *</label>
              <input
                value={form.shortDescription}
                onChange={(e) => set("shortDescription", e.target.value)}
                placeholder="Стислий опис, який бачать у каталозі"
                className={`${inputBase} ${errors.shortDescription ? errorClass : ""}`}
              />
              {errors.shortDescription && <p className="text-xs text-red-500 mt-1">{errors.shortDescription}</p>}
            </div>

            <div>
              <label className={labelClass}>Повний опис</label>
              <textarea
                value={form.fullDescription}
                onChange={(e) => set("fullDescription", e.target.value)}
                rows={5}
                placeholder="Детальний опис програми, цілі, що отримають учасники..."
                className={`${inputBase} resize-none`}
              />
            </div>
          </div>
        </section>

        {/* Місце і час */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-black">2</span>
            Місце і терміни
          </h2>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Прапор</label>
                <select value={form.flag} onChange={(e) => set("flag", e.target.value)} className={inputBase}>
                  {FLAG_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Країна *</label>
                <input
                  value={form.country}
                  onChange={(e) => set("country", e.target.value)}
                  placeholder="Польща"
                  className={`${inputBase} ${errors.country ? errorClass : ""}`}
                />
                {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country}</p>}
              </div>
              <div>
                <label className={labelClass}>Місто</label>
                <input
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="Варшава"
                  className={inputBase}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Дедлайн подачі заявок *</label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => set("deadline", e.target.value)}
                  className={`${inputBase} ${errors.deadline ? errorClass : ""}`}
                />
                {errors.deadline && <p className="text-xs text-red-500 mt-1">{errors.deadline}</p>}
              </div>
              <div>
                <label className={labelClass}>Тривалість</label>
                <input
                  value={form.duration}
                  onChange={(e) => set("duration", e.target.value)}
                  placeholder="14 днів"
                  className={inputBase}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Фінансування і вимоги */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-black">3</span>
            Фінансування та учасники
          </h2>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Фінансування</label>
                <select value={form.funding} onChange={(e) => set("funding", e.target.value)} className={inputBase}>
                  <option value="fully-funded">Повне фінансування</option>
                  <option value="partially-funded">Часткове фінансування</option>
                  <option value="self-funded">Без фінансування</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Деталі фінансування</label>
                <input
                  value={form.fundingDetails}
                  onChange={(e) => set("fundingDetails", e.target.value)}
                  placeholder="Переліт, проживання, харчування"
                  className={inputBase}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Вік від</label>
                <input
                  type="number"
                  value={form.ageMin}
                  onChange={(e) => set("ageMin", e.target.value)}
                  placeholder="18"
                  className={inputBase}
                />
              </div>
              <div>
                <label className={labelClass}>Вік до</label>
                <input
                  type="number"
                  value={form.ageMax}
                  onChange={(e) => set("ageMax", e.target.value)}
                  placeholder="30"
                  className={inputBase}
                />
              </div>
              <div>
                <label className={labelClass}>Мови (через кому)</label>
                <input
                  value={form.languagesInput}
                  onChange={(e) => set("languagesInput", e.target.value)}
                  placeholder="Англійська, Польська"
                  className={inputBase}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Теги (через кому)</label>
              <input
                value={form.tagsInput}
                onChange={(e) => set("tagsInput", e.target.value)}
                placeholder="Молодь, Обмін, ЄС"
                className={inputBase}
              />
            </div>
          </div>
        </section>

        {/* Вимоги та переваги */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-black">4</span>
            Вимоги та переваги
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Вимоги до учасників</label>
              <p className="text-xs text-gray-400 mb-2">Кожна вимога — з нового рядка</p>
              <textarea
                value={form.requirementsInput}
                onChange={(e) => set("requirementsInput", e.target.value)}
                rows={5}
                placeholder={"Вік 18–28 років\nРівень англійської B1+\nДосвід волонтерства"}
                className={`${inputBase} resize-none font-mono text-xs`}
              />
            </div>
            <div>
              <label className={labelClass}>Що отримають учасники</label>
              <p className="text-xs text-gray-400 mb-2">Кожна перевага — з нового рядка</p>
              <textarea
                value={form.benefitsInput}
                onChange={(e) => set("benefitsInput", e.target.value)}
                rows={5}
                placeholder={"Повне фінансування\nСертифікат Erasmus+\nНетворкінг з 8 країн"}
                className={`${inputBase} resize-none font-mono text-xs`}
              />
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pb-8">
          <button
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            Скасувати
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSubmit("draft")}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Зберегти як чернетку
            </button>
            <button
              onClick={() => handleSubmit("published")}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm shadow-primary/25 disabled:opacity-50"
            >
              Опублікувати
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewProjectPage() {
  return <OrgShell><NewProjectContent /></OrgShell>;
}
