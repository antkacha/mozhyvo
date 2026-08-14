"use client";

import { useRef, useState } from "react";
import type { OpportunityType } from "@/lib/data";
import OpportunityCoverImage from "@/components/OpportunityCoverImage";

interface Props {
  previewUrl?: string;
  type: OpportunityType;
  uploading: boolean;
  error: string | null;
  onFile: (file: File) => void;
  onUrlImport: (url: string) => void;
  onDelete: () => void;
}

export default function CoverPhotoUpload({ previewUrl, type, uploading, error, onFile, onUrlImport, onDelete }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlMode, setUrlMode] = useState(false);
  const [urlValue, setUrlValue] = useState("");

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    onFile(file); // parent validates (validateCoverFile), resizes and uploads/defers
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleUrlSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = urlValue.trim();
    if (!trimmed) return;
    onUrlImport(trimmed);
    setUrlValue("");
    setUrlMode(false);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative rounded-2xl overflow-hidden border border-border">
        <OpportunityCoverImage photo={previewUrl} title="Обкладинка" type={type} sizes="(max-width: 767px) 100vw, 500px" />
        {uploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark disabled:opacity-60 transition-all"
        >
          {previewUrl ? "Замінити фото" : "Завантажити з комп'ютера"}
        </button>
        <button
          type="button"
          onClick={() => setUrlMode((v) => !v)}
          disabled={uploading}
          className="px-4 py-2 bg-white border border-border rounded-xl text-sm font-semibold text-foreground hover:border-primary hover:text-primary disabled:opacity-60 transition-all"
        >
          За посиланням
        </button>
        {previewUrl && (
          <button
            type="button"
            onClick={onDelete}
            disabled={uploading}
            className="px-4 py-2 bg-white text-red-500 border border-red-200 rounded-xl text-sm font-semibold hover:bg-red-50 disabled:opacity-60 transition-all"
          >
            Видалити
          </button>
        )}
      </div>

      {urlMode && (
        <form onSubmit={handleUrlSubmit} className="flex gap-2">
          <input
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            placeholder="https://..."
            autoFocus
            className="flex-1 px-3.5 py-2.5 text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white transition-all"
          />
          <button
            type="submit"
            disabled={uploading || !urlValue.trim()}
            className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark disabled:opacity-60 transition-all flex-shrink-0"
          >
            Завантажити
          </button>
        </form>
      )}

      <p className="text-xs text-muted">JPG, PNG або WebP · до 4 МБ · автоматично обрізається під 16:9 по центру</p>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
