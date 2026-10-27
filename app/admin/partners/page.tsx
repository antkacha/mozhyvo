"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { COVER_ALLOWED_TYPES, COVER_MAX_BYTES } from "@/lib/cover-photo";

interface PartnerRow {
  id: string;
  name: string;
  logo_url: string | null;
  link_url: string | null;
  sort_order: number;
  is_active: boolean;
}

interface FormState {
  name: string;
  link_url: string;
  is_active: boolean;
  logo: File | null;
  removeLogo: boolean;
}

const EMPTY_FORM: FormState = { name: "", link_url: "", is_active: true, logo: null, removeLogo: false };
const STATIC_MAX = 6; // mirrors PARTNERS_STATIC_MAX on the homepage

function checkLogo(file: File): string | null {
  if (!COVER_ALLOWED_TYPES.includes(file.type)) return "Тільки JPG, PNG або WebP";
  if (file.size > COVER_MAX_BYTES) return "Файл більший за 4 МБ";
  return null;
}

async function errorOf(res: Response, fallback: string): Promise<string> {
  const json = await res.json().catch(() => ({})) as { error?: string };
  return json.error ?? fallback;
}

/** Add / edit form. Server re-validates everything; checks here are for fast feedback. */
function PartnerForm({
  initial, existingLogo, submitLabel, onSubmit, onCancel,
}: {
  initial: FormState;
  existingLogo?: string | null;
  submitLabel: string;
  onSubmit: (f: FormState) => Promise<string | null>;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState<FormState>(initial);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!form.logo) { setPreview(null); return; }
    const url = URL.createObjectURL(form.logo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [form.logo]);

  const shownLogo = preview ?? (form.removeLogo ? null : existingLogo ?? null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Вкажіть назву партнера"); return; }
    if (form.link_url.trim() && !/^https?:\/\//i.test(form.link_url.trim())) {
      setError("Посилання має починатися з http:// або https://"); return;
    }
    setSaving(true);
    setError("");
    const err = await onSubmit(form);
    setSaving(false);
    if (err) { setError(err); return; }
    if (!onCancel) { setForm(EMPTY_FORM); if (fileRef.current) fileRef.current.value = ""; }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-start gap-4 flex-wrap">
        <button
          type="button" onClick={() => fileRef.current?.click()}
          className="w-40 h-20 flex-shrink-0 rounded-xl border border-dashed border-border bg-white flex items-center justify-center overflow-hidden hover:border-primary transition-colors"
          aria-label="Обрати логотип"
        >
          {shownLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shownLogo} alt="" className="max-h-full max-w-full object-contain p-2" />
          ) : (
            <span className="text-xs text-muted text-center px-2">Логотип<br />(необов&apos;язково)</span>
          )}
        </button>
        <input
          ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            if (f) {
              const err = checkLogo(f);
              if (err) { setError(err); e.target.value = ""; return; }
            }
            setError("");
            setForm((p) => ({ ...p, logo: f, removeLogo: false }));
          }}
        />
        <div className="flex-1 min-w-[220px] space-y-3">
          <input
            value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            placeholder="Назва партнера" maxLength={120} aria-label="Назва партнера"
            className="w-full px-3.5 py-2.5 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <input
            value={form.link_url} onChange={(e) => setForm((p) => ({ ...p, link_url: e.target.value }))}
            placeholder="https://… (необов'язково)" type="url" maxLength={500} aria-label="Посилання"
            className="w-full px-3.5 py-2.5 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>
      <div className="flex items-center gap-4 flex-wrap text-sm">
        <label className="inline-flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.is_active}
            onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
            className="w-4 h-4 accent-primary" />
          Показувати на головній
        </label>
        {form.logo && (
          <button type="button" className="text-xs text-muted hover:text-foreground"
            onClick={() => { setForm((p) => ({ ...p, logo: null })); if (fileRef.current) fileRef.current.value = ""; }}>
            Скасувати новий логотип
          </button>
        )}
        {!form.logo && existingLogo && !form.removeLogo && (
          <button type="button" className="text-xs text-muted hover:text-red-500"
            onClick={() => setForm((p) => ({ ...p, removeLogo: true }))}>
            Видалити логотип
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5">{error}</p>}
      <div className="flex gap-2 justify-end">
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={saving}
            className="px-4 py-2 border border-border rounded-xl text-sm text-muted hover:bg-muted-bg transition-all disabled:opacity-50">
            Скасувати
          </button>
        )}
        <button type="submit" disabled={saving}
          className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark disabled:opacity-50 transition-all inline-flex items-center gap-2">
          {saving && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

function toFormData(f: FormState): FormData {
  const fd = new FormData();
  fd.set("name", f.name.trim());
  fd.set("link_url", f.link_url.trim());
  fd.set("is_active", String(f.is_active));
  if (f.logo) fd.set("logo", f.logo);
  else if (f.removeLogo) fd.set("remove_logo", "true");
  return fd;
}

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<PartnerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [editing, setEditing] = useState<PartnerRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PartnerRow | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/partners", { cache: "no-store" });
    if (!res.ok) { setListError(await errorOf(res, "Не вдалося завантажити партнерів")); setLoading(false); return; }
    const json = await res.json() as { partners: PartnerRow[] };
    setPartners(json.partners);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function create(f: FormState) {
    const res = await fetch("/api/admin/partners", { method: "POST", body: toFormData(f) });
    if (!res.ok) return errorOf(res, "Не вдалося додати партнера");
    await load();
    return null;
  }

  async function update(id: string, f: FormState) {
    const res = await fetch(`/api/admin/partners/${id}`, { method: "PATCH", body: toFormData(f) });
    if (!res.ok) return errorOf(res, "Не вдалося зберегти");
    await load();
    setEditing(null);
    return null;
  }

  async function toggleActive(p: PartnerRow) {
    setBusy(p.id);
    setListError("");
    const fd = new FormData();
    fd.set("is_active", String(!p.is_active));
    const res = await fetch(`/api/admin/partners/${p.id}`, { method: "PATCH", body: fd });
    if (res.ok) setPartners((list) => list.map((x) => (x.id === p.id ? { ...x, is_active: !p.is_active } : x)));
    else setListError(await errorOf(res, "Не вдалося оновити"));
    setBusy(null);
  }

  async function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= partners.length) return;
    const next = [...partners];
    [next[index], next[target]] = [next[target], next[index]];
    const prev = partners;
    setPartners(next);
    setBusy("reorder");
    setListError("");
    const res = await fetch("/api/admin/partners/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: next.map((p) => p.id) }),
    });
    if (!res.ok) { setPartners(prev); setListError(await errorOf(res, "Не вдалося змінити порядок")); }
    setBusy(null);
  }

  async function doDelete() {
    if (!deleteTarget) return;
    setBusy(deleteTarget.id);
    const res = await fetch(`/api/admin/partners/${deleteTarget.id}`, { method: "DELETE" });
    if (!res.ok) setListError(await errorOf(res, "Не вдалося видалити"));
    else await load();
    setBusy(null);
    setDeleteTarget(null);
  }

  const activeCount = partners.filter((p) => p.is_active).length;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-foreground">Партнери</h1>
        <p className="text-sm text-muted mt-0.5">
          {partners.length} всього · {activeCount} на головній ·{" "}
          {activeCount > STATIC_MAX ? "показуються бігучим рядком" : `до ${STATIC_MAX} — статичний ряд, більше — бігучий рядок`}
        </p>
      </div>

      <section className="bg-white rounded-2xl border border-border p-5">
        <h2 className="text-sm font-bold text-foreground mb-4">Додати партнера</h2>
        <PartnerForm initial={EMPTY_FORM} submitLabel="Додати" onSubmit={create} />
      </section>

      {listError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{listError}</p>
      )}

      <section className="bg-white rounded-2xl border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-7 h-7 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : partners.length === 0 ? (
          <p className="text-sm text-muted text-center py-16">Партнерів ще немає — додайте першого вище</p>
        ) : (
          <ul>
            {partners.map((p, i) => (
              <li key={p.id} data-partner={p.name} className="flex items-center gap-4 px-5 py-4 border-b border-border/50 last:border-0 flex-wrap sm:flex-nowrap">
                <div className="flex flex-col gap-1">
                  <button onClick={() => move(i, -1)} disabled={i === 0 || busy !== null} aria-label="Вище"
                    className="w-7 h-6 rounded-md border border-border text-muted text-xs hover:bg-muted-bg disabled:opacity-30">▲</button>
                  <button onClick={() => move(i, 1)} disabled={i === partners.length - 1 || busy !== null} aria-label="Нижче"
                    className="w-7 h-6 rounded-md border border-border text-muted text-xs hover:bg-muted-bg disabled:opacity-30">▼</button>
                </div>
                <div className="w-28 h-14 flex-shrink-0 rounded-lg bg-muted-bg/40 flex items-center justify-center overflow-hidden">
                  {p.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.logo_url} alt={p.name} className="max-h-full max-w-full object-contain p-1.5" />
                  ) : (
                    <span className="text-[11px] text-muted">без лого</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate ${p.is_active ? "text-foreground" : "text-muted"}`}>{p.name}</p>
                  {p.link_url ? (
                    <a href={p.link_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate block">{p.link_url}</a>
                  ) : (
                    <p className="text-xs text-muted">без посилання</p>
                  )}
                </div>
                <button
                  type="button" role="switch" aria-checked={p.is_active} aria-label="Показувати на головній"
                  title="Показувати на головній" disabled={busy !== null} onClick={() => toggleActive(p)}
                  className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${p.is_active ? "bg-primary" : "bg-gray-200"}`}
                >
                  <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${p.is_active ? "translate-x-[18px]" : "translate-x-0.5"}`} />
                </button>
                <div className="flex gap-2">
                  <button onClick={() => setEditing(p)}
                    className="px-3 py-1.5 text-xs font-semibold border border-border text-foreground rounded-lg hover:bg-muted-bg transition-all">
                    Редагувати
                  </button>
                  <button onClick={() => setDeleteTarget(p)}
                    className="px-3 py-1.5 text-xs font-semibold border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-all">
                    Видалити
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h3 className="text-base font-bold text-foreground mb-4">Редагувати «{editing.name}»</h3>
            <PartnerForm
              key={editing.id}
              initial={{ name: editing.name, link_url: editing.link_url ?? "", is_active: editing.is_active, logo: null, removeLogo: false }}
              existingLogo={editing.logo_url}
              submitLabel="Зберегти"
              onSubmit={(f) => update(editing.id, f)}
              onCancel={() => setEditing(null)}
            />
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => busy === null && setDeleteTarget(null)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold text-foreground mb-1">Видалити «{deleteTarget.name}»?</h3>
            <p className="text-sm text-muted leading-relaxed mb-4">Партнер і його логотип будуть видалені назавжди.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteTarget(null)} disabled={busy !== null}
                className="px-4 py-2 border border-border rounded-xl text-sm text-muted hover:bg-muted-bg transition-all disabled:opacity-50">
                Скасувати
              </button>
              <button onClick={doDelete} disabled={busy !== null}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-all">
                Видалити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
