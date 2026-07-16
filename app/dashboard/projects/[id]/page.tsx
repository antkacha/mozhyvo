"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { useOrgSession } from "@/hooks/useOrgSession";
import { useOrgProjects, OrgProject, FormQuestion } from "@/hooks/useOrgProjects";
import FormBuilder from "@/components/FormBuilder";
import { saveDraft, loadDraft, clearDraft } from "@/lib/draft-storage";

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
  { emoji: "🇧🇩", name: "Бангладеш" },
  { emoji: "🇧🇭", name: "Бахрейн" },
  { emoji: "🇧🇪", name: "Бельгія" },
  { emoji: "🇧🇾", name: "Білорусь" },
  { emoji: "🇧🇬", name: "Болгарія" },
  { emoji: "🇧🇴", name: "Болівія" },
  { emoji: "🇧🇦", name: "Боснія і Герцеговина" },
  { emoji: "🇧🇷", name: "Бразилія" },
  { emoji: "🇻🇳", name: "В'єтнам" },
  { emoji: "🇬🇧", name: "Велика Британія" },
  { emoji: "🇻🇪", name: "Венесуела" },
  { emoji: "🇦🇲", name: "Вірменія" },
  { emoji: "🇬🇦", name: "Габон" },
  { emoji: "🇬🇹", name: "Гватемала" },
  { emoji: "🇬🇳", name: "Гвінея" },
  { emoji: "🇭🇳", name: "Гондурас" },
  { emoji: "🇬🇷", name: "Греція" },
  { emoji: "🇬🇪", name: "Грузія" },
  { emoji: "🇩🇰", name: "Данія" },
  { emoji: "🇩🇴", name: "Домініканська Республіка" },
  { emoji: "🇪🇪", name: "Естонія" },
  { emoji: "🇪🇹", name: "Ефіопія" },
  { emoji: "🇪🇬", name: "Єгипет" },
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
  { emoji: "🇱🇹", name: "Литва" },
  { emoji: "🇱🇧", name: "Ліван" },
  { emoji: "🇱🇾", name: "Лівія" },
  { emoji: "🇱🇮", name: "Ліхтенштейн" },
  { emoji: "🇱🇺", name: "Люксембург" },
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
  { emoji: "🇩🇪", name: "Німеччина" },
  { emoji: "🇳🇿", name: "Нова Зеландія" },
  { emoji: "🇳🇴", name: "Норвегія" },
  { emoji: "🇦🇪", name: "ОАЕ" },
  { emoji: "🇵🇰", name: "Пакистан" },
  { emoji: "🇵🇸", name: "Палестина" },
  { emoji: "🇵🇦", name: "Панама" },
  { emoji: "🇵🇾", name: "Парагвай" },
  { emoji: "🇵🇪", name: "Перу" },
  { emoji: "🇲🇰", name: "Північна Македонія" },
  { emoji: "🇵🇱", name: "Польща" },
  { emoji: "🇵🇹", name: "Португалія" },
  { emoji: "🇷🇴", name: "Румунія" },
  { emoji: "🇸🇦", name: "Саудівська Аравія" },
  { emoji: "🇸🇳", name: "Сенегал" },
  { emoji: "🇷🇸", name: "Сербія" },
  { emoji: "🇸🇾", name: "Сирія" },
  { emoji: "🇸🇬", name: "Сінгапур" },
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
  const [applyMode, setApplyMode] = useState<"form" | "external">("form");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const editDraftKey = `mozhyvo_project_draft_edit_${params.id}`;
  const [hasDraft, setHasDraft] = useState(() => !!loadDraft(editDraftKey));
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (project && !form) {
      initialized.current = false; // mark as initialization so save effect skips first render
      setForm({
        ...project,
        requirementsText: project.requirements.join("\n"),
        benefitsText: project.benefits.join("\n"),
        languagesText: project.languages.join(", "),
        tagsText: project.tags.join(", "),
      });
      setFormQuestions(project.formQuestions ?? []);
      setApplyMode(project.externalApplyUrl ? "external" : "form");
    }
  }, [project, form]);

  // Debounced draft save — skip the first render (initialization from DB)
  useEffect(() => {
    if (!form) return;
    if (!initialized.current) {
      initialized.current = true;
      return;
    }
    if (draftTimer.current) clearTimeout(draftTimer.current);
    draftTimer.current = setTimeout(() => {
      saveDraft(editDraftKey, { form, formQuestions, applyMode });
    }, 500);
    return () => { if (draftTimer.current) clearTimeout(draftTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, formQuestions, applyMode]);

  function restoreDraft() {
    type EditDraft = { form: FormState; formQuestions: FormQuestion[]; applyMode: "form" | "external" };
    const d = loadDraft<EditDraft>(editDraftKey);
    if (!d) return;
    initialized.current = true; // prevent next render from skipping save
    setForm(d.form);
    setFormQuestions(d.formQuestions);
    setApplyMode(d.applyMode);
    setHasDraft(false);
  }

  function discardDraft() {
    clearDraft(editDraftKey);
    setHasDraft(false);
  }

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

  async function handleSave(statusOverride?: OrgProject["status"]) {
    if (!form || !project) return;
    setSaving(true);
    setSaveError(null);

    const deadline = form.deadline;
    const deadlineDisplay = deadline
      ? new Date(deadline).toLocaleDateString("uk-UA", { day: "numeric", month: "short", year: "numeric" })
      : (project.deadlineDisplay ?? "");
    const flagEmoji = form.flag.includes(" ") ? form.flag.split(" ")[0] : form.flag;
    const city = form.city.trim();
    const country = form.country.trim();
    const location = city ? `${city}, ${country}` : country;

    try { await update(project.id, {
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
      externalApplyUrl: form.externalApplyUrl ?? "",
    }); } catch (e) {
      setSaving(false);
      setSaveError(e instanceof Error ? e.message : "Помилка збереження. Спробуй ще раз.");
      return;
    }

    setSaving(false);
    clearDraft(editDraftKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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

      {/* Expired banner */}
      {(() => {
        const today = new Date().toISOString().split("T")[0];
        const isExpired = project.deadline && /^\d{4}-\d{2}-\d{2}$/.test(project.deadline) && project.deadline < today;
        if (!isExpired) return null;
        return (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-6">
            <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-amber-800">Дедлайн минув — проект у архіві</p>
              <p className="text-xs text-amber-600 mt-0.5">
                Оновіть дату дедлайну нижче, щоб повернути проект до активних.
              </p>
            </div>
          </div>
        );
      })()}

      {/* Draft restore banner */}
      {hasDraft && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-5">
          <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800">Знайдено незбережені зміни</p>
            <p className="text-xs text-amber-600 mt-0.5">Ви вносили зміни у цей проект раніше і не зберегли їх.</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={discardDraft}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl text-amber-700 hover:bg-amber-100 transition-all"
            >
              Відхилити
            </button>
            <button
              onClick={restoreDraft}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition-all"
            >
              Відновити зміни
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 mb-7">
        <h1 className="text-2xl font-black text-foreground">Редагування</h1>
        <div className="flex items-center gap-3">
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Країна</label>
              <select
                value={form.flag}
                onChange={(e) => {
                  const c = COUNTRIES.find((c) => c.emoji === e.target.value);
                  set("flag", e.target.value);
                  if (c) set("country", c.name);
                }}
                className={input}
              >
                <option value="">Оберіть країну...</option>
                {COUNTRIES.map((c) => (
                  <option key={c.emoji} value={c.emoji}>{c.emoji} {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={label}>Місто</label>
              <input value={form.city} onChange={(e) => set("city", e.target.value)} className={input} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Дедлайн</label>
              <input type="date" value={form.deadline} min={new Date().toISOString().split("T")[0]} onChange={(e) => set("deadline", e.target.value)} className={input} />
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
          <div>
            <h2 className="text-xs font-semibold text-muted uppercase tracking-wider">Форма заявки</h2>
            <p className="text-xs text-muted mt-1">Спосіб, яким учасники подаватимуть заявки</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setApplyMode("form")}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                applyMode === "form"
                  ? "border-primary bg-primary-light"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <p className="text-sm font-semibold text-foreground">Форма на Моживо</p>
              <p className="text-xs text-muted mt-0.5">Кастомні питання</p>
            </button>
            <button
              onClick={() => setApplyMode("external")}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                applyMode === "external"
                  ? "border-primary bg-primary-light"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <p className="text-sm font-semibold text-foreground">Зовнішній сервіс</p>
              <p className="text-xs text-muted mt-0.5">Google Forms та інші</p>
            </button>
          </div>

          {applyMode === "external" ? (
            <div>
              <label className={label}>Посилання на форму</label>
              <input
                value={form.externalApplyUrl ?? ""}
                onChange={(e) => set("externalApplyUrl", e.target.value)}
                placeholder="https://forms.google.com/..."
                className={input}
              />
              <p className="text-xs text-muted mt-1">Учасники перенаправлятимуться на цей URL</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs text-muted">Базові поля (ім&apos;я, email) додаються автоматично</p>
                {formQuestions.length > 0 && (
                  <span className="flex-shrink-0 text-[10px] font-bold bg-primary-light text-primary px-2.5 py-1 rounded-xl">
                    {formQuestions.length} {formQuestions.length < 5 ? "питання" : "питань"}
                  </span>
                )}
              </div>
              <FormBuilder questions={formQuestions} onChange={setFormQuestions} />
            </div>
          )}
        </section>

        {/* Save error */}
        {saveError && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-sm text-red-700 font-medium">
            {saveError}
          </div>
        )}

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
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-white text-sm font-semibold transition-all shadow-sm disabled:opacity-50 ${
              saved
                ? "bg-green-600 hover:bg-green-700 shadow-green-600/20"
                : "bg-primary hover:bg-primary-dark shadow-primary/20"
            }`}
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Зберігаємо...
              </>
            ) : saved ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                Збережено
              </>
            ) : (
              "Зберегти зміни"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EditProjectPage() {
  return <EditProjectContent />;
}
