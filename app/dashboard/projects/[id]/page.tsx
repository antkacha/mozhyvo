"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useOrgSession } from "@/hooks/useOrgSession";
import { useOrgProjects, OrgProject, FormQuestion } from "@/hooks/useOrgProjects";
import OrgShell from "@/components/OrgShell";
import FormBuilder from "@/components/FormBuilder";

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
  "🇺🇦 Україна", "🇵🇱 Польща", "🇩🇪 Німеччина", "🇫🇷 Франція",
  "🇳🇱 Нідерланди", "🇦🇹 Австрія", "🇨🇿 Чехія", "🇸🇰 Словаччина",
  "🇱🇹 Литва", "🇱🇻 Латвія", "🇪🇪 Естонія", "🇬🇧 Великобританія",
  "🇺🇸 США", "🌍 Онлайн / міжнародний", "🇪🇺 Євросоюз",
];

type FormState = OrgProject & { requirementsText: string; benefitsText: string; languagesText: string; tagsText: string };

function EditProjectContent() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const { org } = useOrgSession();
  const { projects, update } = useOrgProjects(org?.id);
  const project = projects.find((p) => p.id === params.id);

  const [form, setForm] = useState<FormState | null>(null);
  const [formQuestions, setFormQuestions] = useState<FormQuestion[]>([]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (project && !form) {
      setForm({
        ...project,
        requirementsText: project.requirements.join("\n"),
        benefitsText: project.benefits.join("\n"),
        languagesText: project.languages.join(", "),
        tagsText: project.tags.join(", "),
      });
      setFormQuestions(project.formQuestions ?? []);
    }
  }, [project, form]);

  if (!project || !form) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-7 h-7 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  function set(field: keyof FormState, value: string | number) {
    setForm((p) => {
      if (!p) return p;
      const n = { ...p, [field]: value };
      if (field === "type") {
        n.typeName = TYPE_OPTIONS.find((o) => o.value === value)?.label ?? String(value);
      }
      return n;
    });
    setSaved(false);
  }

  function handleSave(statusOverride?: OrgProject["status"]) {
    if (!form || !project) return;
    setSaving(true);

    const deadline = form.deadline;
    const deadlineDisplay = new Date(deadline).toLocaleDateString("uk-UA", {
      day: "numeric", month: "short", year: "numeric",
    });
    const flagEmoji = form.flag.includes(" ") ? form.flag.split(" ")[0] : form.flag;
    const city = form.city.trim();
    const country = form.country.trim();
    const location = city ? `${city}, ${country}` : country;

    update(project.id, {
      title: form.title.trim(),
      type: form.type,
      typeName: form.typeName,
      shortDescription: form.shortDescription.trim(),
      fullDescription: form.fullDescription.trim(),
      country,
      city,
      location,
      flag: flagEmoji,
      format: form.format,
      funding: form.funding,
      fundingDetails: form.fundingDetails?.trim() ?? "",
      deadline,
      deadlineDisplay,
      duration: form.duration?.trim() ?? "",
      languages: form.languagesText.split(",").map((s) => s.trim()).filter(Boolean),
      tags: form.tagsText.split(",").map((s) => s.trim()).filter(Boolean),
      requirements: form.requirementsText.split("\n").map((s) => s.trim()).filter(Boolean),
      benefits: form.benefitsText.split("\n").map((s) => s.trim()).filter(Boolean),
      ageMin: form.ageMin,
      ageMax: form.ageMax,
      status: statusOverride ?? form.status,
      autoClose: form.autoClose,
      formQuestions,
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  const input = "w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";
  const label = "block text-sm font-medium text-foreground mb-1.5";
  const section = "bg-white rounded-2xl border border-border p-6 flex flex-col gap-5";

  return (
    <div className="page-transition max-w-2xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6">
        <button onClick={() => router.push("/dashboard/projects")} className="text-muted hover:text-foreground transition-colors">
          Проекти
        </button>
        <svg className="w-3.5 h-3.5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-foreground font-semibold truncate max-w-[200px]">{project.title}</span>
      </div>

      <div className="flex items-center justify-between gap-4 mb-7">
        <h1 className="text-2xl font-black text-foreground">Редагування</h1>
        <div className="flex items-center gap-3">
          {saved && (
            <span className="flex items-center gap-1.5 text-xs text-green-600 font-semibold">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              Збережено
            </span>
          )}
          {project.status === "published" ? (
            <button onClick={() => handleSave("draft")} className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 transition-all">
              Зняти з публікації
            </button>
          ) : (
            <button onClick={() => handleSave("published")} className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-all">
              Опублікувати
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {/* Основна */}
        <section className={section}>
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">Основна інформація</h2>
          <div>
            <label className={label}>Назва проекту</label>
            <input value={form.title} onChange={(e) => set("title", e.target.value)} className={input} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Тип</label>
              <select value={form.type} onChange={(e) => set("type", e.target.value)} className={input}>
                {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Формат</label>
              <select value={form.format} onChange={(e) => set("format", e.target.value)} className={input}>
                <option value="offline">Офлайн</option>
                <option value="online">Онлайн</option>
                <option value="hybrid">Гібрид</option>
              </select>
            </div>
          </div>
          <div>
            <label className={label}>Короткий опис</label>
            <input value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} className={input} maxLength={200} />
          </div>
          <div>
            <label className={label}>Повний опис</label>
            <textarea value={form.fullDescription} onChange={(e) => set("fullDescription", e.target.value)} rows={4} className={`${input} resize-none`} />
          </div>
        </section>

        {/* Місце і час */}
        <section className={section}>
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">Місце і терміни</h2>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={label}>Прапор</label>
              <select
                value={FLAG_OPTIONS.find((f) => f.startsWith(form.flag)) ?? FLAG_OPTIONS[0]}
                onChange={(e) => set("flag", e.target.value.split(" ")[0])}
                className={input}
              >
                {FLAG_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className={label}>Країна</label>
              <input value={form.country} onChange={(e) => set("country", e.target.value)} className={input} />
            </div>
            <div>
              <label className={label}>Місто</label>
              <input value={form.city} onChange={(e) => set("city", e.target.value)} className={input} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Дедлайн</label>
              <input type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} className={input} />
            </div>
            <div>
              <label className={label}>Тривалість</label>
              <input value={form.duration ?? ""} onChange={(e) => set("duration", e.target.value)} className={input} placeholder="14 днів" />
            </div>
          </div>

          {/* Auto-close toggle */}
          <div className={`flex items-start justify-between gap-4 p-4 rounded-2xl border transition-all ${form.autoClose ? "border-amber-200 bg-amber-50/60" : "border-border bg-muted-bg/40"}`}>
            <div>
              <p className="text-sm font-semibold text-foreground">Автоматично закрити після дедлайну</p>
              <p className="text-xs text-muted mt-0.5">Проєкт автоматично перейде в статус «Закрито» наступного дня після дедлайну</p>
            </div>
            <button
              role="switch"
              aria-checked={!!form.autoClose}
              onClick={() => setForm((f) => f ? { ...f, autoClose: !f.autoClose } : f)}
              className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${form.autoClose ? "bg-primary" : "bg-border"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.autoClose ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>
        </section>

        {/* Учасники */}
        <section className={section}>
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">Учасники та фінансування</h2>
          <div className="grid grid-cols-3 gap-2">
            {([["fully-funded", "Повне"], ["partially-funded", "Часткове"], ["self-funded", "Без"]] as const).map(([val, lbl]) => (
              <button
                key={val}
                onClick={() => set("funding", val)}
                className={`py-2.5 px-2 rounded-xl border text-xs font-semibold transition-all text-center ${
                  form.funding === val
                    ? "border-primary bg-primary-light text-primary"
                    : "border-border hover:border-primary/40 text-muted"
                }`}
              >
                {lbl}
              </button>
            ))}
          </div>
          <div>
            <label className={label}>Деталі фінансування</label>
            <input value={form.fundingDetails ?? ""} onChange={(e) => set("fundingDetails", e.target.value)} className={input} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={label}>Вік від</label>
              <input type="number" value={form.ageMin ?? ""} onChange={(e) => set("ageMin", Number(e.target.value))} placeholder="18" className={input} />
            </div>
            <div>
              <label className={label}>Вік до</label>
              <input type="number" value={form.ageMax ?? ""} onChange={(e) => set("ageMax", Number(e.target.value))} placeholder="30" className={input} />
            </div>
            <div>
              <label className={label}>Мови</label>
              <input value={form.languagesText} onChange={(e) => set("languagesText", e.target.value)} className={input} placeholder="Англ, Польська" />
            </div>
          </div>
          <div>
            <label className={label}>Теги (через кому)</label>
            <input value={form.tagsText} onChange={(e) => set("tagsText", e.target.value)} className={input} />
          </div>
        </section>

        {/* Вимоги і переваги */}
        <section className={section}>
          <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">Вимоги та переваги</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={label}>Вимоги</label>
              <p className="text-xs text-muted mb-1.5">Кожна — з нового рядка</p>
              <textarea value={form.requirementsText} onChange={(e) => set("requirementsText", e.target.value)} rows={5} className={`${input} resize-none font-mono text-xs`} />
            </div>
            <div>
              <label className={label}>Переваги</label>
              <p className="text-xs text-muted mb-1.5">Кожна — з нового рядка</p>
              <textarea value={form.benefitsText} onChange={(e) => set("benefitsText", e.target.value)} rows={5} className={`${input} resize-none font-mono text-xs`} />
            </div>
          </div>
        </section>

        {/* Форма заявки */}
        <section className={section}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">Форма заявки</h2>
              <p className="text-xs text-muted mt-1">Кастомні питання, які побачать учасники при подачі заявки</p>
            </div>
            {formQuestions.length > 0 && (
              <span className="flex-shrink-0 text-[10px] font-bold bg-primary-light text-primary px-2.5 py-1 rounded-xl">
                {formQuestions.length} {formQuestions.length === 1 ? "питання" : formQuestions.length < 5 ? "питання" : "питань"}
              </span>
            )}
          </div>
          <FormBuilder questions={formQuestions} onChange={setFormQuestions} />
        </section>

        {/* Actions */}
        <div className="flex items-center justify-between gap-3 pb-8">
          <button
            onClick={() => router.push("/dashboard/projects")}
            className="px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted-bg transition-all"
          >
            Скасувати
          </button>
          <button
            onClick={() => handleSave()}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm shadow-primary/20 disabled:opacity-50"
          >
            {saving ? "Зберігаємо..." : "Зберегти зміни"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EditProjectPage() {
  return <OrgShell><EditProjectContent /></OrgShell>;
}
