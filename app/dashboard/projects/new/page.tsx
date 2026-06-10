"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOrgSession } from "@/hooks/useOrgSession";
import { useOrgProjects, OrgProject, FormQuestion } from "@/hooks/useOrgProjects";
import FormBuilder from "@/components/FormBuilder";

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

const COUNTRIES: { emoji: string; name: string }[] = [
  { emoji: "🌍", name: "Онлайн / міжнародний" },
  { emoji: "🇪🇺", name: "Євросоюз" },
  { emoji: "🇦🇺", name: "Австралія" },
  { emoji: "🇦🇹", name: "Австрія" },
  { emoji: "🇦🇿", name: "Азербайджан" },
  { emoji: "🇦🇱", name: "Албанія" },
  { emoji: "🇩🇿", name: "Алжир" },
  { emoji: "🇦🇴", name: "Ангола" },
  { emoji: "🇦🇩", name: "Андорра" },
  { emoji: "🇦🇷", name: "Аргентина" },
  { emoji: "🇦🇲", name: "Вірменія" },
  { emoji: "🇧🇩", name: "Бангладеш" },
  { emoji: "🇧🇭", name: "Бахрейн" },
  { emoji: "🇧🇾", name: "Білорусь" },
  { emoji: "🇧🇪", name: "Бельгія" },
  { emoji: "🇧🇬", name: "Болгарія" },
  { emoji: "🇧🇴", name: "Болівія" },
  { emoji: "🇧🇦", name: "Боснія і Герцеговина" },
  { emoji: "🇧🇷", name: "Бразилія" },
  { emoji: "🇻🇳", name: "В'єтнам" },
  { emoji: "🇻🇪", name: "Венесуела" },
  { emoji: "🇬🇦", name: "Габон" },
  { emoji: "🇬🇹", name: "Гватемала" },
  { emoji: "🇬🇳", name: "Гвінея" },
  { emoji: "🇩🇪", name: "Німеччина" },
  { emoji: "🇭🇳", name: "Гондурас" },
  { emoji: "🇬🇪", name: "Грузія" },
  { emoji: "🇬🇷", name: "Греція" },
  { emoji: "🇩🇰", name: "Данія" },
  { emoji: "🇩🇴", name: "Домініканська Республіка" },
  { emoji: "🇪🇬", name: "Єгипет" },
  { emoji: "🇪🇹", name: "Ефіопія" },
  { emoji: "🇾🇪", name: "Ємен" },
  { emoji: "🇿🇲", name: "Замбія" },
  { emoji: "🇿🇼", name: "Зімбабве" },
  { emoji: "🇮🇱", name: "Ізраїль" },
  { emoji: "🇮🇳", name: "Індія" },
  { emoji: "🇮🇩", name: "Індонезія" },
  { emoji: "🇮🇶", name: "Ірак" },
  { emoji: "🇮🇷", name: "Іран" },
  { emoji: "🇮🇪", name: "Ірландія" },
  { emoji: "🇮🇸", name: "Ісландія" },
  { emoji: "🇪🇸", name: "Іспанія" },
  { emoji: "🇮🇹", name: "Італія" },
  { emoji: "🇯🇴", name: "Йорданія" },
  { emoji: "🇰🇿", name: "Казахстан" },
  { emoji: "🇰🇭", name: "Камбоджа" },
  { emoji: "🇨🇲", name: "Камерун" },
  { emoji: "🇨🇦", name: "Канада" },
  { emoji: "🇶🇦", name: "Катар" },
  { emoji: "🇰🇪", name: "Кенія" },
  { emoji: "🇰🇬", name: "Киргизстан" },
  { emoji: "🇨🇳", name: "Китай" },
  { emoji: "🇨🇾", name: "Кіпр" },
  { emoji: "🇨🇴", name: "Колумбія" },
  { emoji: "🇽🇰", name: "Косово" },
  { emoji: "🇨🇷", name: "Коста-Ріка" },
  { emoji: "🇨🇺", name: "Куба" },
  { emoji: "🇰🇼", name: "Кувейт" },
  { emoji: "🇱🇻", name: "Латвія" },
  { emoji: "🇱🇧", name: "Ліван" },
  { emoji: "🇱🇾", name: "Лівія" },
  { emoji: "🇱🇮", name: "Ліхтенштейн" },
  { emoji: "🇱🇹", name: "Литва" },
  { emoji: "🇱🇺", name: "Люксембург" },
  { emoji: "🇲🇰", name: "Північна Македонія" },
  { emoji: "🇲🇾", name: "Малайзія" },
  { emoji: "🇲🇹", name: "Мальта" },
  { emoji: "🇲🇦", name: "Марокко" },
  { emoji: "🇲🇩", name: "Молдова" },
  { emoji: "🇲🇨", name: "Монако" },
  { emoji: "🇲🇳", name: "Монголія" },
  { emoji: "🇲🇲", name: "М'янма" },
  { emoji: "🇳🇵", name: "Непал" },
  { emoji: "🇳🇱", name: "Нідерланди" },
  { emoji: "🇳🇬", name: "Нігерія" },
  { emoji: "🇳🇮", name: "Нікарагуа" },
  { emoji: "🇳🇿", name: "Нова Зеландія" },
  { emoji: "🇳🇴", name: "Норвегія" },
  { emoji: "🇦🇪", name: "ОАЕ" },
  { emoji: "🇵🇰", name: "Пакистан" },
  { emoji: "🇵🇸", name: "Палестина" },
  { emoji: "🇵🇦", name: "Панама" },
  { emoji: "🇵🇾", name: "Парагвай" },
  { emoji: "🇵🇪", name: "Перу" },
  { emoji: "🇵🇱", name: "Польща" },
  { emoji: "🇵🇹", name: "Португалія" },
  { emoji: "🇷🇴", name: "Румунія" },
  { emoji: "🇸🇦", name: "Саудівська Аравія" },
  { emoji: "🇸🇳", name: "Сенегал" },
  { emoji: "🇷🇸", name: "Сербія" },
  { emoji: "🇸🇬", name: "Сінгапур" },
  { emoji: "🇸🇾", name: "Сирія" },
  { emoji: "🇸🇰", name: "Словаччина" },
  { emoji: "🇸🇮", name: "Словенія" },
  { emoji: "🇸🇴", name: "Сомалі" },
  { emoji: "🇸🇩", name: "Судан" },
  { emoji: "🇺🇸", name: "США" },
  { emoji: "🇹🇯", name: "Таджикистан" },
  { emoji: "🇹🇭", name: "Таїланд" },
  { emoji: "🇹🇿", name: "Танзанія" },
  { emoji: "🇹🇳", name: "Туніс" },
  { emoji: "🇹🇷", name: "Туреччина" },
  { emoji: "🇹🇲", name: "Туркменістан" },
  { emoji: "🇺🇬", name: "Уганда" },
  { emoji: "🇭🇺", name: "Угорщина" },
  { emoji: "🇺🇿", name: "Узбекистан" },
  { emoji: "🇺🇦", name: "Україна" },
  { emoji: "🇺🇾", name: "Уругвай" },
  { emoji: "🇵🇭", name: "Філіппіни" },
  { emoji: "🇫🇮", name: "Фінляндія" },
  { emoji: "🇫🇷", name: "Франція" },
  { emoji: "🇭🇷", name: "Хорватія" },
  { emoji: "🇨🇿", name: "Чехія" },
  { emoji: "🇨🇱", name: "Чілі" },
  { emoji: "🇨🇭", name: "Швейцарія" },
  { emoji: "🇸🇪", name: "Швеція" },
  { emoji: "🇱🇰", name: "Шрі-Ланка" },
  { emoji: "🇯🇵", name: "Японія" },
  { emoji: "🇬🇧", name: "Велика Британія" },
  { emoji: "🇪🇪", name: "Естонія" },
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
  startDate: string;
  endDate: string;
  ageMin: string;
  ageMax: string;
  languages: string;
  tags: string;
  requirements: string;
  benefits: string;
  externalApplyUrl: string;
};

const INITIAL: FormData = {
  title: "", type: "exchange", typeName: "Обмін",
  shortDescription: "", fullDescription: "",
  flag: "", country: "", city: "",
  format: "offline", funding: "fully-funded", fundingDetails: "",
  deadline: "", startDate: "", endDate: "",
  ageMin: "", ageMax: "", languages: "", tags: "",
  requirements: "", benefits: "",
  externalApplyUrl: "",
};

const STEPS = ["Основна", "Місце і час", "Учасники", "Опис", "Заявка"];

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
  const [formQuestions, setFormQuestions] = useState<FormQuestion[]>([]);
  const [applyMode, setApplyMode] = useState<"form" | "external">("form");
  const [templateChosen, setTemplateChosen] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  async function handleSubmit(status: OrgProject["status"]) {
    if (!validateStep(step) || !org) return;
    setSaving(true);

    const deadline = form.deadline;
    const deadlineDisplay = new Date(deadline).toLocaleDateString("uk-UA", {
      day: "numeric", month: "short", year: "numeric",
    });
    const flagEmoji = form.flag;
    const location = form.city.trim()
      ? `${form.city.trim()}, ${form.country.trim()}`
      : form.country.trim();

    const fmt = (d: string) => new Date(d).toLocaleDateString("uk-UA", { day: "numeric", month: "short", year: "numeric" });
    const duration = form.startDate && form.endDate
      ? `${fmt(form.startDate)} — ${fmt(form.endDate)}`
      : form.startDate ? `Від ${fmt(form.startDate)}`
      : form.endDate   ? `До ${fmt(form.endDate)}`
      : "";

    setSubmitError(null);
    try {
      await create({
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
        duration,
        languages: form.languages.split(",").map((s) => s.trim()).filter(Boolean),
        tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
        requirements: splitLines(form.requirements),
        benefits: splitLines(form.benefits),
        ageMin: form.ageMin ? Number(form.ageMin) : undefined,
        ageMax: form.ageMax ? Number(form.ageMax) : undefined,
        status,
        formQuestions,
        externalApplyUrl: applyMode === "external" ? form.externalApplyUrl.trim() : "",
      });
      router.push("/dashboard/projects");
    } catch (e) {
      setSaving(false);
      setSubmitError(e instanceof Error ? e.message : "Не вдалось зберегти проект. Спробуй ще раз.");
    }
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
            <select
              value={form.flag}
              onChange={(e) => {
                const c = COUNTRIES.find((c) => c.emoji === e.target.value);
                set("flag", e.target.value);
                if (c) set("country", c.name);
              }}
              className={`${input} ${errors.country ? err : ""}`}
            >
              <option value="">Оберіть країну...</option>
              {COUNTRIES.map((c) => (
                <option key={c.emoji} value={c.emoji}>{c.emoji} {c.name}</option>
              ))}
            </select>
            {errors.country && <p className={`${hint} text-red-500`}>{errors.country}</p>}
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
            <div />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Дата початку</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                className={input}
              />
            </div>
            <div>
              <label className={label}>Дата закінчення</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)}
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

      {/* Step 4: Форма заявки */}
      {step === 4 && (
        <div className="bg-white rounded-2xl border border-border p-6 flex flex-col gap-5">
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">Як учасники подаватимуть заявки?</p>
            <p className="text-xs text-muted mb-4">Оберіть спосіб подачі заявок на цей проект</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setApplyMode("form")}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  applyMode === "form"
                    ? "border-primary bg-primary-light"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <p className="text-sm font-semibold text-foreground">Форма на Моживо</p>
                <p className="text-xs text-muted mt-0.5">Кастомні питання для учасників</p>
              </button>
              <button
                onClick={() => setApplyMode("external")}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  applyMode === "external"
                    ? "border-primary bg-primary-light"
                    : "border-border hover:border-primary/40"
                }`}
              >
                <p className="text-sm font-semibold text-foreground">Зовнішній сервіс</p>
                <p className="text-xs text-muted mt-0.5">Google Forms, Typeform та інші</p>
              </button>
            </div>
          </div>

          {applyMode === "external" ? (
            <div>
              <label className={label}>Посилання на форму</label>
              <input
                value={form.externalApplyUrl}
                onChange={(e) => set("externalApplyUrl", e.target.value)}
                placeholder="https://forms.google.com/..."
                className={input}
              />
              <p className={hint}>Учасники будуть перенаправлятись на цей URL при натисканні «Подати заявку»</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">Питання форми</p>
                  <p className="text-xs text-muted mt-0.5">Базові поля (ім&apos;я, email) додаються автоматично</p>
                </div>
                {formQuestions.length > 0 && (
                  <span className="flex-shrink-0 text-[10px] font-bold bg-primary-light text-primary px-2.5 py-1 rounded-xl">
                    {formQuestions.length} {formQuestions.length < 5 ? "питання" : "питань"}
                  </span>
                )}
              </div>
              <FormBuilder questions={formQuestions} onChange={setFormQuestions} />
            </div>
          )}
        </div>
      )}

      {/* Error banner */}
      {submitError && (
        <div className="mt-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700 font-medium">
          {submitError}
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
