"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOrgSession } from "@/hooks/useOrgSession";
import { useOrgProjects, OrgProject } from "@/hooks/useOrgProjects";

const TYPE_OPTIONS = [
  { value: "exchange", label: "Обмін", desc: "Молодіжний чи академічний обмін" },
  { value: "grant", label: "Грант", desc: "Фінансова підтримка проектів" },
  { value: "internship", label: "Стажування", desc: "Практика в організації" },
  { value: "volunteer", label: "Волонтерство", desc: "Волонтерські програми" },
  { value: "conference", label: "Конференція / Школа", desc: "Навчальні та наукові заходи" },
  { value: "competition", label: "Конкурс", desc: "Змагання та відбори" },
  { value: "hackathon", label: "Хакатон", desc: "Інтенсивні проектні заходи" },
  { value: "training", label: "Тренінг", desc: "Навчання та воркшопи" },
];

const FLAG_OPTIONS = [
  "🇺🇦 Україна", "🇵🇱 Польща", "🇩🇪 Німеччина", "🇫🇷 Франція",
  "🇳🇱 Нідерланди", "🇦🇹 Австрія", "🇨🇿 Чехія", "🇸🇰 Словаччина",
  "🇱🇹 Литва", "🇱🇻 Латвія", "🇪🇪 Естонія", "🇬🇧 Великобританія",
  "🇺🇸 США", "🌍 Онлайн / міжнародний", "🇪🇺 Євросоюз",
];

type FormData = {
  title: string;
  type: string;
  typeName: string;
  shortDescription: string;
  fullDescription: string;
  flag: string;
  country: string;
  city: string;
  format: OrgProject["format"];
  funding: OrgProject["funding"];
  fundingDetails: string;
  deadline: string;
  duration: string;
  ageMin: string;
  ageMax: string;
  languages: string;
  tags: string;
  requirements: string;
  benefits: string;
};

const INITIAL: FormData = {
  title: "", type: "exchange", typeName: "Обмін",
  shortDescription: "", fullDescription: "",
  flag: "🇺🇦", country: "", city: "",
  format: "offline", funding: "fully-funded", fundingDetails: "",
  deadline: "", duration: "",
  ageMin: "", ageMax: "", languages: "", tags: "",
  requirements: "", benefits: "",
};

const STEPS = ["Основна", "Місце і час", "Учасники", "Опис"];

const TEMPLATES: { id: string; emoji: string; label: string; fill: Partial<FormData> }[] = [
  {
    id: "exchange",
    emoji: "🌍",
    label: "Молодіжний обмін",
    fill: {
      type: "exchange", typeName: "Обмін",
      title: "Молодіжний обмін",
      shortDescription: "Двотижневий міжнародний обмін для молодих активістів.",
      format: "offline", funding: "fully-funded",
      fundingDetails: "Перельоти, проживання, харчування",
      duration: "14 днів",
      languages: "Англійська",
      ageMin: "18", ageMax: "28",
      requirements: "Вік 18–28 років\nРівень англійської B1+\nДосвід громадянської діяльності",
      benefits: "Повне фінансування\nСертифікат учасника\nМіжнародний нетворкінг",
    },
  },
  {
    id: "scholarship",
    emoji: "🎓",
    label: "Стипендія",
    fill: {
      type: "grant", typeName: "Стипендія",
      title: "Стипендіальна програма",
      shortDescription: "Щорічна стипендія для студентів та молодих дослідників.",
      format: "offline", funding: "fully-funded",
      fundingDetails: "Щомісячна стипендія + навчання",
      languages: "Англійська, Українська",
      ageMin: "18", ageMax: "35",
      requirements: "Студент або аспірант\nВисокий академічний рейтинг\nРекомендаційний лист",
      benefits: "Щомісячна стипендія\nНаукове керівництво\nПублікації у збірках",
    },
  },
  {
    id: "volunteer",
    emoji: "🤝",
    label: "Волонтерство",
    fill: {
      type: "volunteer", typeName: "Волонтерство",
      title: "Волонтерська програма",
      shortDescription: "Міжнародна волонтерська програма для молодих людей.",
      format: "offline", funding: "fully-funded",
      fundingDetails: "Проживання, харчування та кишенькові кошти",
      duration: "6 місяців",
      languages: "Англійська",
      ageMin: "18", ageMax: "30",
      requirements: "Вік 18–30 років\nМотивація та готовність волонтерити\nБазова англійська",
      benefits: "Безкоштовне проживання\nКишенькові кошти\nСертифікат YouthPass",
    },
  },
  {
    id: "grant",
    emoji: "💡",
    label: "Грант",
    fill: {
      type: "grant", typeName: "Грант",
      title: "Конкурс проєктів",
      shortDescription: "Конкурс мікрогрантів для соціальних ініціатив молоді.",
      format: "online", funding: "fully-funded",
      fundingDetails: "До 5 000 грн на реалізацію проєкту",
      languages: "Українська",
      ageMin: "16", ageMax: "30",
      requirements: "Вік 16–30 років\nГотова ідея соціального проєкту\nКоманда мінімум 2 особи",
      benefits: "Фінансування проєкту\nМенторська підтримка\nПублікація в медіа",
    },
  },
];

function splitLines(s: string) {
  return s.split("\n").map((x) => x.trim()).filter(Boolean);
}

function NewProjectContent() {
  const router = useRouter();
  const { org } = useOrgSession();
  const { create } = useOrgProjects(org?.id);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [templateChosen, setTemplateChosen] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [saving, setSaving] = useState(false);

  function set(field: keyof FormData, value: string) {
    setForm((p) => {
      const n = { ...p, [field]: value };
      if (field === "type") {
        n.typeName = TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value;
      }
      return n;
    });
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validateStep(s: number): boolean {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (s === 0) {
      if (!form.title.trim()) e.title = "Обов'язкове поле";
      if (!form.shortDescription.trim()) e.shortDescription = "Обов'язкове поле";
    }
    if (s === 1) {
      if (!form.country.trim()) e.country = "Обов'язкове поле";
      if (!form.deadline) e.deadline = "Обов'язкове поле";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function handleSubmit(status: OrgProject["status"]) {
    if (!validateStep(step) || !org) return;
    setSaving(true);

    const deadline = form.deadline;
    const deadlineDisplay = new Date(deadline).toLocaleDateString("uk-UA", {
      day: "numeric", month: "short", year: "numeric",
    });
    const flagEmoji = form.flag.split(" ")[0];
    const location = form.city.trim()
      ? `${form.city.trim()}, ${form.country.trim()}`
      : form.country.trim();

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
      flag: flagEmoji,
      format: form.format,
      funding: form.funding,
      fundingDetails: form.fundingDetails.trim(),
      deadline,
      deadlineDisplay,
      duration: form.duration.trim(),
      languages: form.languages.split(",").map((s) => s.trim()).filter(Boolean),
      tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
      requirements: splitLines(form.requirements),
      benefits: splitLines(form.benefits),
      ageMin: form.ageMin ? Number(form.ageMin) : undefined,
      ageMax: form.ageMax ? Number(form.ageMax) : undefined,
      status,
    });
    router.push("/dashboard/projects");
  }

  const input = "w-full px-3.5 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted/50";
  const err = "border-red-300 focus:ring-red-200 focus:border-red-400";
  const label = "block text-sm font-medium text-foreground mb-1.5";
  const hint = "text-xs text-muted mt-1";

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
        <span className="text-foreground font-semibold">Новий проект</span>
      </div>

      <h1 className="text-2xl font-black text-foreground mb-6">Новий проект</h1>

      {/* Templates */}
      {!templateChosen && (
        <div className="mb-7">
          <p className="text-sm font-semibold text-foreground mb-3">Почніть зі шаблону або з нуля</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setForm((f) => ({ ...f, ...t.fill }));
                  setTemplateChosen(true);
                }}
                className="flex flex-col items-center gap-2 p-3.5 bg-white border border-border rounded-2xl hover:border-primary/40 hover:bg-primary-light/50 transition-all group text-center"
              >
                <span className="text-2xl">{t.emoji}</span>
                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">{t.label}</span>
              </button>
            ))}
            <button
              onClick={() => setTemplateChosen(true)}
              className="flex flex-col items-center gap-2 p-3.5 bg-muted-bg border border-dashed border-border rounded-2xl hover:border-primary/40 hover:bg-primary-light/50 transition-all group text-center"
            >
              <span className="text-2xl">✏️</span>
              <span className="text-xs font-semibold text-muted group-hover:text-primary transition-colors leading-tight">Почати з нуля</span>
            </button>
          </div>
        </div>
      )}
      {templateChosen && (
        <button
          onClick={() => { setForm(INITIAL); setTemplateChosen(false); setStep(0); }}
          className="text-xs font-semibold text-muted hover:text-primary transition-colors mb-5 flex items-center gap-1.5"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Змінити шаблон
        </button>
      )}

      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <button
                onClick={() => i < step && setStep(i)}
                className={`w-7 h-7 rounded-full text-xs font-bold transition-all flex items-center justify-center ${
                  i < step
                    ? "bg-primary text-white cursor-pointer"
                    : i === step
                    ? "bg-primary text-white ring-4 ring-primary/20"
                    : "bg-muted-bg text-muted cursor-default"
                }`}
              >
                {i < step ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </button>
              <span className={`text-[11px] font-semibold whitespace-nowrap ${i === step ? "text-primary" : "text-muted"}`}>
                {s}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-2 mb-5 transition-all ${i < step ? "bg-primary" : "bg-border"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Основна інформація */}
      {step === 0 && (
        <div className="bg-white rounded-2xl border border-border p-6 flex flex-col gap-5">
          <div>
            <label className={label}>Назва проекту *</label>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Наприклад: Молодіжний обмін «Разом до змін»"
              className={`${input} ${errors.title ? err : ""}`}
            />
            {errors.title && <p className={`${hint} text-red-500`}>{errors.title}</p>}
          </div>

          <div>
            <label className={label}>Тип можливості</label>
            <div className="grid grid-cols-2 gap-2">
              {TYPE_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => set("type", o.value)}
                  className={`text-left px-3.5 py-3 rounded-xl border text-sm transition-all ${
                    form.type === o.value
                      ? "border-primary bg-primary-light text-primary font-semibold"
                      : "border-border hover:border-primary/40 text-foreground"
                  }`}
                >
                  <p className="font-semibold leading-tight">{o.label}</p>
                  <p className={`text-xs mt-0.5 ${form.type === o.value ? "text-primary/70" : "text-muted"}`}>{o.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className={label}>Короткий опис *</label>
            <input
              value={form.shortDescription}
              onChange={(e) => set("shortDescription", e.target.value)}
              placeholder="1–2 речення, які бачать у каталозі"
              maxLength={200}
              className={`${input} ${errors.shortDescription ? err : ""}`}
            />
            <div className="flex items-center justify-between">
              {errors.shortDescription ? <p className={`${hint} text-red-500`}>{errors.shortDescription}</p> : <span />}
              <p className={hint}>{form.shortDescription.length}/200</p>
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Місце і терміни */}
      {step === 1 && (
        <div className="bg-white rounded-2xl border border-border p-6 flex flex-col gap-5">
          <div>
            <label className={label}>Країна *</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <select
                  value={form.flag}
                  onChange={(e) => {
                    const parts = e.target.value.split(" ");
                    set("flag", e.target.value);
                    const country = parts.slice(1).join(" ");
                    if (country && country !== "Онлайн" && country !== "міжнародний" && country !== "Євросоюз") {
                      set("country", country);
                    }
                  }}
                  className={input}
                >
                  {FLAG_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <input
                  value={form.country}
                  onChange={(e) => set("country", e.target.value)}
                  placeholder="Країна"
                  className={`${input} ${errors.country ? err : ""}`}
                />
                {errors.country && <p className={`${hint} text-red-500`}>{errors.country}</p>}
              </div>
            </div>
          </div>

          <div>
            <label className={label}>Місто</label>
            <input
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              placeholder="Варшава, Берлін, Онлайн..."
              className={input}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Дедлайн подачі *</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => set("deadline", e.target.value)}
                className={`${input} ${errors.deadline ? err : ""}`}
              />
              {errors.deadline && <p className={`${hint} text-red-500`}>{errors.deadline}</p>}
            </div>
            <div>
              <label className={label}>Тривалість</label>
              <input
                value={form.duration}
                onChange={(e) => set("duration", e.target.value)}
                placeholder="14 днів, 1 місяць..."
                className={input}
              />
            </div>
          </div>

          <div>
            <label className={label}>Формат</label>
            <div className="grid grid-cols-3 gap-2">
              {([ ["offline", "Офлайн"], ["online", "Онлайн"], ["hybrid", "Гібрид"] ] as const).map(([val, lbl]) => (
                <button
                  key={val}
                  onClick={() => set("format", val)}
                  className={`py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                    form.format === val
                      ? "border-primary bg-primary-light text-primary"
                      : "border-border hover:border-primary/40 text-muted"
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Учасники та фінансування */}
      {step === 2 && (
        <div className="bg-white rounded-2xl border border-border p-6 flex flex-col gap-5">
          <div>
            <label className={label}>Фінансування</label>
            <div className="grid grid-cols-3 gap-2">
              {([
                ["fully-funded", "Повне"],
                ["partially-funded", "Часткове"],
                ["self-funded", "Без фінансування"],
              ] as const).map(([val, lbl]) => (
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
          </div>

          <div>
            <label className={label}>Деталі фінансування</label>
            <input
              value={form.fundingDetails}
              onChange={(e) => set("fundingDetails", e.target.value)}
              placeholder="Перельоти, проживання, харчування..."
              className={input}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={label}>Вік від</label>
              <input type="number" value={form.ageMin} onChange={(e) => set("ageMin", e.target.value)} placeholder="18" className={input} />
            </div>
            <div>
              <label className={label}>Вік до</label>
              <input type="number" value={form.ageMax} onChange={(e) => set("ageMax", e.target.value)} placeholder="30" className={input} />
            </div>
            <div>
              <label className={label}>Мови</label>
              <input value={form.languages} onChange={(e) => set("languages", e.target.value)} placeholder="Англ, Польська" className={input} />
            </div>
          </div>

          <div>
            <label className={label}>Теги (через кому)</label>
            <input value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="Молодь, ЄС, Лідерство" className={input} />
            <p className={hint}>Допомагають знаходити проект у пошуку</p>
          </div>
        </div>
      )}

      {/* Step 3: Повний опис */}
      {step === 3 && (
        <div className="bg-white rounded-2xl border border-border p-6 flex flex-col gap-5">
          <div>
            <label className={label}>Повний опис програми</label>
            <textarea
              value={form.fullDescription}
              onChange={(e) => set("fullDescription", e.target.value)}
              rows={5}
              placeholder="Детальний опис: цілі, формат, учасники, особливості..."
              className={`${input} resize-none`}
            />
          </div>

          <div>
            <label className={label}>Вимоги до учасників</label>
            <p className={hint + " mb-1.5"}>Кожна вимога — з нового рядка</p>
            <textarea
              value={form.requirements}
              onChange={(e) => set("requirements", e.target.value)}
              rows={4}
              placeholder={"Вік 18–28 років\nРівень англійської B1+\nДосвід волонтерства"}
              className={`${input} resize-none font-mono text-xs`}
            />
          </div>

          <div>
            <label className={label}>Що отримають учасники</label>
            <p className={hint + " mb-1.5"}>Кожна перевага — з нового рядка</p>
            <textarea
              value={form.benefits}
              onChange={(e) => set("benefits", e.target.value)}
              rows={4}
              placeholder={"Повне фінансування\nСертифікат Erasmus+\nНетворкінг з 8 країн"}
              className={`${input} resize-none font-mono text-xs`}
            />
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3 mt-6 pb-8">
        <button
          onClick={() => step > 0 ? setStep(step - 1) : router.push("/dashboard/projects")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted-bg transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {step === 0 ? "Скасувати" : "Назад"}
        </button>

        <div className="flex items-center gap-3">
          {step === STEPS.length - 1 ? (
            <>
              <button
                onClick={() => handleSubmit("draft")}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:bg-muted-bg transition-all disabled:opacity-50"
              >
                Зберегти як чернетку
              </button>
              <button
                onClick={() => handleSubmit("published")}
                disabled={saving}
                className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm shadow-primary/20 disabled:opacity-50"
              >
                Опублікувати
              </button>
            </>
          ) : (
            <button
              onClick={next}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm shadow-primary/20"
            >
              Далі
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NewProjectPage() {
  return <NewProjectContent />;
}
