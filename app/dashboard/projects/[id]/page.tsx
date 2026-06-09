"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useOrgSession } from "@/hooks/useOrgSession";
import { useOrgProjects, OrgProject } from "@/hooks/useOrgProjects";
import OrgShell from "@/components/OrgShell";

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

function EditProjectContent() {
  const router = useRouter();
  const params = useParams();
  const { org } = useOrgSession();
  const { projects, update } = useOrgProjects(org?.id);

  const project = projects.find((p) => p.id === params.id);

  const [form, setForm] = useState<Partial<OrgProject> & { requirementsInput: string; benefitsInput: string; languagesInput: string; tagsInput: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (project && !form) {
      setForm({
        ...project,
        requirementsInput: project.requirements.join("\n"),
        benefitsInput: project.benefits.join("\n"),
        languagesInput: project.languages.join(", "),
        tagsInput: project.tags.join(", "),
      });
    }
  }, [project, form]);

  if (!project || !form) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  function set(field: string, value: string | number) {
    setForm((prev) => {
      if (!prev) return prev;
      const next = { ...prev, [field]: value };
      if (field === "type") {
        const opt = TYPE_OPTIONS.find((o) => o.value === value);
        next.typeName = opt?.label ?? String(value);
      }
      return next;
    });
    setSaved(false);
  }

  function listToArray(text: string): string[] {
    return text.split("\n").map((s) => s.trim()).filter(Boolean);
  }

  function handleSave(status?: OrgProject["status"]) {
    if (!form || !project) return;
    setSaving(true);

    const deadline = form.deadline ?? project.deadline;
    const deadlineDate = new Date(deadline);
    const deadlineDisplay = deadlineDate.toLocaleDateString("uk-UA", { day: "numeric", month: "short", year: "numeric" });

    const country = (form.country ?? project.country).trim();
    const city = (form.city ?? project.city).trim();
    const location = city ? `${city}, ${country}` : country;

    update(project.id, {
      title: (form.title ?? project.title).trim(),
      type: form.type ?? project.type,
      typeName: form.typeName ?? project.typeName,
      shortDescription: (form.shortDescription ?? project.shortDescription).trim(),
      fullDescription: (form.fullDescription ?? project.fullDescription).trim(),
      country,
      city,
      location,
      flag: form.flag ?? project.flag,
      format: form.format ?? project.format,
      funding: form.funding ?? project.funding,
      fundingDetails: (form.fundingDetails ?? project.fundingDetails ?? "").trim(),
      deadline,
      deadlineDisplay,
      duration: (form.duration ?? project.duration ?? "").trim(),
      languages: listToArray(form.languagesInput ?? project.languages.join("\n")),
      tags: (form.tagsInput ?? project.tags.join(", ")).split(",").map((s) => s.trim()).filter(Boolean),
      requirements: listToArray(form.requirementsInput ?? project.requirements.join("\n")),
      benefits: listToArray(form.benefitsInput ?? project.benefits.join("\n")),
      ageMin: form.ageMin ?? project.ageMin,
      ageMax: form.ageMax ?? project.ageMax,
      status: status ?? form.status ?? project.status,
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const inputBase = "w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all bg-white";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1.5";

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.push("/dashboard/projects")} className="p-2 rounded-xl hover:bg-gray-100 transition-all text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-900">Редагування проекту</h1>
          <p className="text-sm text-gray-500 line-clamp-1">{project.title}</p>
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
              <label className={labelClass}>Назва проекту</label>
              <input value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} className={inputBase} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Тип можливості</label>
                <select value={form.type ?? "exchange"} onChange={(e) => set("type", e.target.value)} className={inputBase}>
                  {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Формат</label>
                <select value={form.format ?? "offline"} onChange={(e) => set("format", e.target.value)} className={inputBase}>
                  <option value="offline">Офлайн</option>
                  <option value="online">Онлайн</option>
                  <option value="hybrid">Гібрид</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Короткий опис</label>
              <input value={form.shortDescription ?? ""} onChange={(e) => set("shortDescription", e.target.value)} className={inputBase} />
            </div>
            <div>
              <label className={labelClass}>Повний опис</label>
              <textarea value={form.fullDescription ?? ""} onChange={(e) => set("fullDescription", e.target.value)} rows={5} className={`${inputBase} resize-none`} />
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
                <select value={form.flag ?? "🇺🇦"} onChange={(e) => set("flag", e.target.value)} className={inputBase}>
                  {FLAG_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Країна</label>
                <input value={form.country ?? ""} onChange={(e) => set("country", e.target.value)} className={inputBase} />
              </div>
              <div>
                <label className={labelClass}>Місто</label>
                <input value={form.city ?? ""} onChange={(e) => set("city", e.target.value)} className={inputBase} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Дедлайн</label>
                <input type="date" value={form.deadline ?? ""} onChange={(e) => set("deadline", e.target.value)} className={inputBase} />
              </div>
              <div>
                <label className={labelClass}>Тривалість</label>
                <input value={form.duration ?? ""} onChange={(e) => set("duration", e.target.value)} placeholder="14 днів" className={inputBase} />
              </div>
            </div>
          </div>
        </section>

        {/* Фінансування та учасники */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-black">3</span>
            Фінансування та учасники
          </h2>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Фінансування</label>
                <select value={form.funding ?? "fully-funded"} onChange={(e) => set("funding", e.target.value)} className={inputBase}>
                  <option value="fully-funded">Повне фінансування</option>
                  <option value="partially-funded">Часткове фінансування</option>
                  <option value="self-funded">Без фінансування</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Деталі фінансування</label>
                <input value={form.fundingDetails ?? ""} onChange={(e) => set("fundingDetails", e.target.value)} className={inputBase} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Вік від</label>
                <input type="number" value={form.ageMin ?? ""} onChange={(e) => set("ageMin", Number(e.target.value))} placeholder="18" className={inputBase} />
              </div>
              <div>
                <label className={labelClass}>Вік до</label>
                <input type="number" value={form.ageMax ?? ""} onChange={(e) => set("ageMax", Number(e.target.value))} placeholder="30" className={inputBase} />
              </div>
              <div>
                <label className={labelClass}>Мови (через кому)</label>
                <input value={form.languagesInput ?? ""} onChange={(e) => set("languagesInput", e.target.value)} className={inputBase} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Теги (через кому)</label>
              <input value={form.tagsInput ?? ""} onChange={(e) => set("tagsInput", e.target.value)} className={inputBase} />
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
              <textarea value={form.requirementsInput ?? ""} onChange={(e) => set("requirementsInput", e.target.value)} rows={5} className={`${inputBase} resize-none font-mono text-xs`} />
            </div>
            <div>
              <label className={labelClass}>Що отримають учасники</label>
              <p className="text-xs text-gray-400 mb-2">Кожна перевага — з нового рядка</p>
              <textarea value={form.benefitsInput ?? ""} onChange={(e) => set("benefitsInput", e.target.value)} rows={5} className={`${inputBase} resize-none font-mono text-xs`} />
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pb-8">
          <div className="flex items-center gap-2">
            {project.status === "published" ? (
              <button onClick={() => handleSave("draft")} className="px-4 py-2.5 rounded-xl border border-yellow-200 text-sm font-semibold text-yellow-700 hover:bg-yellow-50 transition-all">
                Зняти з публікації
              </button>
            ) : (
              <button onClick={() => handleSave("published")} className="px-4 py-2.5 rounded-xl border border-green-200 text-sm font-semibold text-green-700 hover:bg-green-50 transition-all">
                Опублікувати
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {saved && <span className="text-xs text-green-600 font-semibold">✓ Збережено</span>}
            <button onClick={() => router.push("/dashboard/projects")} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all">
              Скасувати
            </button>
            <button
              onClick={() => handleSave()}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm shadow-primary/25 disabled:opacity-50"
            >
              {saving ? "Зберігаємо..." : "Зберегти зміни"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditProjectPage() {
  return <OrgShell><EditProjectContent /></OrgShell>;
}
