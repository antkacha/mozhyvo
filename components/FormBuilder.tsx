"use client";

import { useState } from "react";
import { FormQuestion, STANDARD_BLOCKS, StandardBlock } from "@/hooks/useOrgProjects";

const CUSTOM_TYPES: Array<{ value: FormQuestion["type"]; label: string; hint: string }> = [
  { value: "text",     label: "Короткий текст",   hint: "Один рядок" },
  { value: "textarea", label: "Довгий текст",      hint: "Кілька рядків" },
  { value: "select",   label: "Вибір зі списку",  hint: "Dropdown" },
  { value: "radio",    label: "Один варіант",      hint: "Radio" },
  { value: "checkbox", label: "Кілька варіантів", hint: "Checkbox" },
];

function genId() {
  return `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

function isBlock(type: FormQuestion["type"]): type is StandardBlock {
  return type.startsWith("block_");
}

function isSection(type: FormQuestion["type"]): boolean {
  return type === "section";
}

// ── Preview of a single field ────────────────────────────────────────
function FieldPreview({ q }: { q: FormQuestion }) {
  const base = "w-full px-3.5 py-2.5 text-sm border border-border rounded-xl bg-white text-muted cursor-not-allowed";

  if (isSection(q.type)) {
    return (
      <div className="pt-2 pb-3 border-b-2 border-primary/20">
        <h3 className="text-base font-bold text-foreground">{q.label || <em className="text-muted font-normal">Назва розділу</em>}</h3>
        {q.description && <p className="text-sm text-muted mt-1">{q.description}</p>}
      </div>
    );
  }

  if (isBlock(q.type)) {
    const block = STANDARD_BLOCKS.find((b) => b.type === q.type)!;
    return (
      <div className="bg-muted-bg/60 rounded-xl px-4 py-3 flex items-center gap-3">
        <span className="text-xl">{block.icon}</span>
        <div>
          <p className="text-sm font-semibold text-foreground">{block.label}</p>
          <p className="text-xs text-muted">{block.desc}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-sm font-medium text-foreground">{q.label || <em className="text-muted">Без назви</em>}</span>
        {q.required && <span className="text-red-500 text-sm">*</span>}
      </div>
      {q.description && <p className="text-xs text-muted mb-2">{q.description}</p>}
      {q.type === "text"     && <input readOnly placeholder={q.placeholder || "Відповідь..."} className={base} />}
      {q.type === "textarea" && <textarea readOnly placeholder={q.placeholder || "Відповідь..."} rows={3} className={`${base} resize-none`} />}
      {q.type === "select"   && (
        <select disabled className={base}>
          <option>Оберіть варіант...</option>
          {(q.options ?? []).map((o, i) => <option key={i}>{o}</option>)}
        </select>
      )}
      {q.type === "radio" && (
        <div className="flex flex-col gap-2">
          {(q.options ?? []).map((o, i) => (
            <label key={i} className="flex items-center gap-2.5 cursor-not-allowed">
              <div className="w-4 h-4 rounded-full border-2 border-border flex-shrink-0" />
              <span className="text-sm text-muted">{o}</span>
            </label>
          ))}
        </div>
      )}
      {q.type === "checkbox" && (
        <div className="flex flex-col gap-2">
          {(q.options ?? []).map((o, i) => (
            <label key={i} className="flex items-center gap-2.5 cursor-not-allowed">
              <div className="w-4 h-4 rounded border border-border flex-shrink-0" />
              <span className="text-sm text-muted">{o}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Block card (standard block in the list) ──────────────────────────
function BlockCard({
  q, index, total,
  onDelete, onMove,
}: {
  q: FormQuestion; index: number; total: number;
  onDelete: () => void;
  onMove: (dir: "up" | "down") => void;
}) {
  const block = STANDARD_BLOCKS.find((b) => b.type === q.type)!;
  return (
    <div className="bg-white rounded-2xl border border-primary/20 overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3">
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-xs font-bold text-muted/60 w-4 text-center">{index + 1}</span>
          <div className="flex flex-col">
            <button onClick={() => onMove("up")} disabled={index === 0}
              className="h-4 w-5 flex items-center justify-center text-muted/40 hover:text-muted disabled:opacity-0 transition-colors">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7"/></svg>
            </button>
            <button onClick={() => onMove("down")} disabled={index === total - 1}
              className="h-4 w-5 flex items-center justify-center text-muted/40 hover:text-muted disabled:opacity-0 transition-colors">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/></svg>
            </button>
          </div>
        </div>
        <span className="text-lg">{block.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{block.label}</p>
          <p className="text-xs text-muted">{block.desc}</p>
        </div>
        <span className="text-[10px] font-bold bg-primary-light text-primary px-2 py-0.5 rounded-lg flex-shrink-0">Блок</span>
        <button onClick={onDelete}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
      </div>
    </div>
  );
}

// ── Section divider card ─────────────────────────────────────────────
function SectionCard({
  q, index, total,
  onChange, onDelete, onMove,
}: {
  q: FormQuestion; index: number; total: number;
  onChange: (q: FormQuestion) => void;
  onDelete: () => void;
  onMove: (dir: "up" | "down") => void;
}) {
  const inp = "w-full px-3 py-2 text-sm border border-transparent rounded-xl bg-transparent focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all placeholder:text-muted/40";

  return (
    <div className="bg-gradient-to-r from-primary-light/40 to-transparent rounded-2xl border border-primary/20 overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3">
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-xs font-bold text-muted/60 w-4 text-center">{index + 1}</span>
          <div className="flex flex-col">
            <button onClick={() => onMove("up")} disabled={index === 0}
              className="h-4 w-5 flex items-center justify-center text-muted/40 hover:text-muted disabled:opacity-0 transition-colors">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7"/></svg>
            </button>
            <button onClick={() => onMove("down")} disabled={index === total - 1}
              className="h-4 w-5 flex items-center justify-center text-muted/40 hover:text-muted disabled:opacity-0 transition-colors">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/></svg>
            </button>
          </div>
        </div>
        <svg className="w-4 h-4 text-primary/60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8M4 18h12"/>
        </svg>
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <input
            value={q.label}
            onChange={(e) => onChange({ ...q, label: e.target.value })}
            placeholder="Назва розділу..."
            className={`${inp} text-sm font-bold text-foreground`}
          />
          <input
            value={q.description ?? ""}
            onChange={(e) => onChange({ ...q, description: e.target.value })}
            placeholder="Опис розділу (необов'язково)..."
            className={`${inp} text-xs text-muted`}
          />
        </div>
        <span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-lg flex-shrink-0">Розділ</span>
        <button onClick={onDelete}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
      </div>
      <div className="mx-4 mb-3 h-px bg-primary/20" />
    </div>
  );
}

// ── Custom question card ─────────────────────────────────────────────
function QuestionCard({
  q, index, total,
  onChange, onDelete, onMove,
}: {
  q: FormQuestion; index: number; total: number;
  onChange: (q: FormQuestion) => void;
  onDelete: () => void;
  onMove: (dir: "up" | "down") => void;
}) {
  const [open, setOpen] = useState(true);
  const isChoice = q.type === "select" || q.type === "radio" || q.type === "checkbox";
  const typeLabel = CUSTOM_TYPES.find((t) => t.value === q.type)?.label ?? q.type;

  const inp = "w-full px-3 py-2 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all";

  function updateOption(i: number, val: string) {
    const opts = [...(q.options ?? [])];
    opts[i] = val;
    onChange({ ...q, options: opts });
  }
  function removeOption(i: number) {
    onChange({ ...q, options: (q.options ?? []).filter((_, idx) => idx !== i) });
  }
  function addOption() {
    onChange({ ...q, options: [...(q.options ?? []), ""] });
  }
  function changeType(type: FormQuestion["type"]) {
    const needsOpts = type !== "text" && type !== "textarea";
    onChange({
      ...q, type,
      options: needsOpts ? (q.options?.length ? q.options : ["Варіант 1", "Варіант 2"]) : undefined,
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted-bg/30">
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-xs font-bold text-muted/60 w-4 text-center">{index + 1}</span>
          <div className="flex flex-col">
            <button onClick={() => onMove("up")} disabled={index === 0}
              className="h-4 w-5 flex items-center justify-center text-muted/40 hover:text-muted disabled:opacity-0 transition-colors">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7"/></svg>
            </button>
            <button onClick={() => onMove("down")} disabled={index === total - 1}
              className="h-4 w-5 flex items-center justify-center text-muted/40 hover:text-muted disabled:opacity-0 transition-colors">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/></svg>
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-[10px] font-semibold bg-primary-light text-primary px-2 py-0.5 rounded-lg flex-shrink-0">{typeLabel}</span>
          <span className="text-sm font-medium text-foreground truncate">{q.label || <span className="text-muted italic">Без назви</span>}</span>
          {q.required && <span className="text-red-400 text-xs flex-shrink-0">*</span>}
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button onClick={() => setOpen((v) => !v)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:bg-muted-bg transition-all">
            <svg className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
          </button>
          <button onClick={onDelete}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted hover:text-red-500 hover:bg-red-50 transition-all">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="p-4 flex flex-col gap-4">
          <div>
            <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">Тип</p>
            <div className="flex flex-wrap gap-1.5">
              {CUSTOM_TYPES.map((t) => (
                <button key={t.value} onClick={() => changeType(t.value)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    q.type === t.value
                      ? "bg-primary-light text-primary border-primary/20"
                      : "bg-muted-bg/60 text-muted border-transparent hover:border-border hover:text-foreground"
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
              Питання <span className="text-red-400">*</span>
            </label>
            <input value={q.label} onChange={(e) => onChange({ ...q, label: e.target.value })}
              placeholder="Наприклад: Розкажіть про ваш досвід..." className={inp} />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
              Пояснення <span className="font-normal text-muted/60">(необов&apos;язково)</span>
            </label>
            <input value={q.description ?? ""} onChange={(e) => onChange({ ...q, description: e.target.value })}
              placeholder="Підказка для учасника..." className={inp} />
          </div>
          {(q.type === "text" || q.type === "textarea") && (
            <div>
              <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">Placeholder</label>
              <input value={q.placeholder ?? ""} onChange={(e) => onChange({ ...q, placeholder: e.target.value })}
                placeholder="Текст всередині поля..." className={inp} />
            </div>
          )}
          {isChoice && (
            <div>
              <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">Варіанти</label>
              <div className="flex flex-col gap-2">
                {(q.options ?? []).map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-[10px] text-muted w-4 text-center flex-shrink-0">{i + 1}</span>
                    <input value={opt} onChange={(e) => updateOption(i, e.target.value)}
                      placeholder={`Варіант ${i + 1}`} className={`${inp} flex-1`} />
                    <button onClick={() => removeOption(i)} disabled={(q.options?.length ?? 0) <= 1}
                      className="w-7 h-7 flex items-center justify-center text-muted hover:text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-20 transition-all">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </div>
                ))}
                <button onClick={addOption}
                  className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark transition-colors py-0.5 pl-6">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>
                  Додати варіант
                </button>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div>
              <p className="text-sm font-medium text-foreground">Обов&apos;язкове поле</p>
              <p className="text-xs text-muted mt-0.5">Учасник не зможе відправити форму без відповіді</p>
            </div>
            <button role="switch" aria-checked={q.required} onClick={() => onChange({ ...q, required: !q.required })}
              className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 ${q.required ? "bg-primary" : "bg-border"}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${q.required ? "translate-x-5" : "translate-x-0"}`} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Preview modal ────────────────────────────────────────────────────
function PreviewModal({ questions, onClose }: { questions: FormQuestion[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden"
        style={{ maxHeight: "85vh" }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-foreground">Прев&apos;ю форми</h2>
            <p className="text-xs text-muted mt-0.5">Так бачать форму учасники</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-muted hover:bg-muted-bg transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-5">
          {questions.length === 0 ? (
            <p className="text-sm text-muted text-center py-8">Немає питань</p>
          ) : (
            questions.map((q) => <FieldPreview key={q.id} q={q} />)
          )}
        </div>
        <div className="px-6 py-4 border-t border-border flex-shrink-0 bg-muted-bg/40">
          <p className="text-xs text-muted text-center">Це прев&apos;ю — дані не зберігаються</p>
        </div>
      </div>
    </div>
  );
}

// ── Main FormBuilder ─────────────────────────────────────────────────
interface FormBuilderProps {
  questions: FormQuestion[];
  onChange: (questions: FormQuestion[]) => void;
}

export default function FormBuilder({ questions, onChange }: FormBuilderProps) {
  const [addingType, setAddingType] = useState(false);
  const [preview, setPreview] = useState(false);

  const activeBlocks = new Set(questions.filter((q) => isBlock(q.type)).map((q) => q.type as StandardBlock));

  function toggleBlock(blockType: StandardBlock) {
    if (activeBlocks.has(blockType)) {
      onChange(questions.filter((q) => q.type !== blockType));
    } else {
      const block = STANDARD_BLOCKS.find((b) => b.type === blockType)!;
      const newQ: FormQuestion = { id: blockType, type: blockType, label: block.label, required: blockType !== "block_documents" };
      // Insert before custom questions (keep blocks together at start)
      const firstCustomIdx = questions.findIndex((q) => !isBlock(q.type));
      if (firstCustomIdx === -1) {
        onChange([...questions, newQ]);
      } else {
        const next = [...questions];
        next.splice(firstCustomIdx, 0, newQ);
        onChange(next);
      }
    }
  }

  function addQuestion(type: FormQuestion["type"]) {
    const q: FormQuestion = {
      id: genId(), type, label: "", required: false,
      options: type !== "text" && type !== "textarea" ? ["Варіант 1", "Варіант 2"] : undefined,
    };
    onChange([...questions, q]);
    setAddingType(false);
  }

  function addSection() {
    const q: FormQuestion = { id: genId(), type: "section", label: "", required: false };
    onChange([...questions, q]);
  }

  function updateQuestion(id: string, updated: FormQuestion) {
    onChange(questions.map((q) => (q.id === id ? updated : q)));
  }

  function deleteQuestion(id: string) {
    onChange(questions.filter((q) => q.id !== id));
  }

  function moveQuestion(index: number, dir: "up" | "down") {
    const arr = [...questions];
    const to = dir === "up" ? index - 1 : index + 1;
    [arr[index], arr[to]] = [arr[to], arr[index]];
    onChange(arr);
  }

  const customCount = questions.filter((q) => !isBlock(q.type) && !isSection(q.type)).length;

  return (
    <div>
      {/* Standard blocks section */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider">Стандартні блоки</p>
          <p className="text-xs text-muted">Ім&apos;я та email збираються автоматично</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {STANDARD_BLOCKS.map((block) => {
            const on = activeBlocks.has(block.type);
            return (
              <button
                key={block.type}
                onClick={() => toggleBlock(block.type)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border-2 text-left transition-all ${
                  on
                    ? "border-primary bg-primary-light"
                    : "border-border hover:border-primary/30 bg-white"
                }`}
              >
                <span className="text-xl flex-shrink-0">{block.icon}</span>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold leading-tight ${on ? "text-primary" : "text-foreground"}`}>{block.label}</p>
                  <p className={`text-xs mt-0.5 ${on ? "text-primary/70" : "text-muted"}`}>{block.desc}</p>
                </div>
                {on && (
                  <svg className="w-4 h-4 text-primary ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-border mb-5" />

      {/* Toolbar for custom questions */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider">
          Кастомні питання {customCount > 0 && <span className="font-normal">({customCount})</span>}
        </p>
        {questions.length > 0 && (
          <button onClick={() => setPreview(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            Прев&apos;ю
          </button>
        )}
      </div>

      {/* Unified question list (blocks + custom) */}
      {questions.length > 0 && (
        <div className="flex flex-col gap-3 mb-4">
          {questions.map((q, i) =>
            isBlock(q.type) ? (
              <BlockCard
                key={q.id} q={q} index={i} total={questions.length}
                onDelete={() => deleteQuestion(q.id)}
                onMove={(dir) => moveQuestion(i, dir)}
              />
            ) : isSection(q.type) ? (
              <SectionCard
                key={q.id} q={q} index={i} total={questions.length}
                onChange={(updated) => updateQuestion(q.id, updated)}
                onDelete={() => deleteQuestion(q.id)}
                onMove={(dir) => moveQuestion(i, dir)}
              />
            ) : (
              <QuestionCard
                key={q.id} q={q} index={i} total={questions.length}
                onChange={(updated) => updateQuestion(q.id, updated)}
                onDelete={() => deleteQuestion(q.id)}
                onMove={(dir) => moveQuestion(i, dir)}
              />
            )
          )}
        </div>
      )}

      {/* Add custom question */}
      {addingType ? (
        <div className="bg-white rounded-2xl border border-border p-4 shadow-sm">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Тип питання</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
            {CUSTOM_TYPES.map((t) => (
              <button key={t.value} onClick={() => addQuestion(t.value)}
                className="flex flex-col items-start gap-0.5 p-3 rounded-xl border border-border hover:border-primary/30 hover:bg-primary-light/40 transition-all text-left group">
                <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{t.label}</span>
                <span className="text-xs text-muted">{t.hint}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setAddingType(false)} className="text-xs text-muted hover:text-foreground transition-colors">
            Скасувати
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <button onClick={addSection}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-primary/20 text-sm font-semibold text-primary/60 hover:border-primary/50 hover:text-primary hover:bg-primary-light/20 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8M4 18h12"/></svg>
            Додати розділ
          </button>
          <button onClick={() => setAddingType(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-border text-sm font-semibold text-muted hover:border-primary/40 hover:text-primary hover:bg-primary-light/20 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>
            Додати питання
          </button>
        </div>
      )}

      {preview && <PreviewModal questions={questions} onClose={() => setPreview(false)} />}
    </div>
  );
}
