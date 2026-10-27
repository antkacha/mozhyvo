"use client";

import { useEffect, useRef, useState } from "react";

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 4 * 1024 * 1024;

/**
 * Upload / replace / remove for an org's wide showcase logo (the homepage
 * partner strip). Saves immediately through `endpoint` (POST multipart
 * "logo", DELETE to remove); it isn't part of any surrounding form's Save.
 */
export default function ShowcaseLogoField({
  endpoint, value, onChange, disabled = false, orgName,
}: {
  endpoint: string;
  value: string | null;
  onChange: (url: string | null) => void;
  disabled?: boolean;
  orgName: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  async function upload(file: File) {
    setError("");
    if (!ALLOWED.includes(file.type)) { setError("Тільки JPG, PNG або WebP"); return; }
    if (file.size > MAX_BYTES) { setError("Файл більший за 4 МБ"); return; }
    setPreview(URL.createObjectURL(file));
    setBusy(true);
    try {
      const body = new FormData();
      body.append("logo", file);
      const res = await fetch(endpoint, { method: "POST", body });
      const json = await res.json().catch(() => ({})) as { showcase_logo_url?: string; error?: string };
      if (!res.ok || !json.showcase_logo_url) throw new Error(json.error ?? "Не вдалося завантажити логотип");
      onChange(json.showcase_logo_url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не вдалося завантажити логотип");
    } finally {
      setPreview(null);
      setBusy(false);
    }
  }

  async function remove() {
    setError("");
    setBusy(true);
    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      const json = await res.json().catch(() => ({})) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Не вдалося видалити логотип");
      onChange(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не вдалося видалити логотип");
    } finally {
      setBusy(false);
    }
  }

  const shown = preview ?? value;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
      {/* Same proportions as the homepage tile, on a neutral background */}
      <div
        data-testid="showcase-preview"
        className="w-48 h-[4.5rem] flex-shrink-0 rounded-xl border border-dashed border-border bg-white flex items-center justify-center px-3 py-2 relative"
      >
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shown} alt={`Логотип ${orgName}`} className={`max-h-full max-w-full object-contain ${busy ? "opacity-50" : ""}`} />
        ) : (
          <span className="text-xs text-muted text-center leading-snug">Немає логотипу</span>
        )}
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          aria-label="Файл логотипу для партнерської стрічки"
          disabled={disabled || busy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) upload(f);
          }}
        />
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || busy}
            className="px-4 py-2 rounded-xl bg-primary-light text-primary text-sm font-semibold hover:bg-primary/10 transition-all disabled:opacity-50"
          >
            {value ? "Замінити" : "Завантажити"}
          </button>
          {value && (
            <button
              type="button"
              onClick={remove}
              disabled={disabled || busy}
              className="text-xs text-muted hover:text-red-500 transition-colors disabled:opacity-50"
            >
              Видалити
            </button>
          )}
        </div>
        <p className="text-xs text-muted mt-1.5">PNG, JPG або WebP, до 4 МБ. Найкраще — горизонтальний логотип на прозорому фоні.</p>
        {error && <p className="text-xs text-red-500 mt-1" role="alert">{error}</p>}
      </div>
    </div>
  );
}
