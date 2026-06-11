"use client";

import { useState, useRef, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";

// ── Helpers ─────────────────────────────────────────────────────────

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    if (!imageSrc.startsWith("data:")) img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 1400;
      canvas.height = 200;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, 1400, 200);
      try {
        resolve(canvas.toDataURL("image/jpeg", 0.92));
      } catch {
        resolve(imageSrc); // CORS fallback — return original URL
      }
    };
    img.onerror = () => resolve(imageSrc);
    img.src = imageSrc;
  });
}

function getYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?\s]+)/);
  return m?.[1] ?? null;
}

function isVideoUrl(url: string): boolean {
  return (
    /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url) ||
    /youtube\.com\/watch|youtu\.be\/|vimeo\.com\//.test(url)
  );
}

// ── Types ────────────────────────────────────────────────────────────

export type CoverResult =
  | { kind: "image"; data: string }
  | { kind: "video"; url: string; thumbnailUrl?: string };

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onApply: (result: CoverResult) => void;
}

// ── Crop panel (reused for file and URL image) ───────────────────────

function CropPanel({
  src,
  crop,
  zoom,
  onCropChange,
  onZoomChange,
  onCropComplete,
  onReset,
}: {
  src: string;
  crop: Point;
  zoom: number;
  onCropChange: (c: Point) => void;
  onZoomChange: (z: number) => void;
  onCropComplete: (croppedArea: Area, croppedAreaPixels: Area) => void;
  onReset?: () => void;
}) {
  return (
    <div>
      <div className="relative rounded-2xl overflow-hidden bg-zinc-900" style={{ height: 120 }}>
        <Cropper
          image={src}
          crop={crop}
          zoom={zoom}
          aspect={7}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={(croppedArea, pixels) => onCropComplete(croppedArea, pixels)}
          showGrid={false}
          style={{
            containerStyle: { borderRadius: 16 },
            cropAreaStyle: { borderColor: "rgba(255,255,255,0.6)", borderWidth: 2 },
          }}
        />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <svg className="w-3.5 h-3.5 text-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
        </svg>
        <input
          type="range" min={1} max={3} step={0.01} value={zoom}
          onChange={(e) => onZoomChange(Number(e.target.value))}
          className="flex-1 h-1.5 rounded-full accent-primary cursor-pointer"
        />
        <span className="text-xs text-muted w-10 text-right flex-shrink-0">{Math.round(zoom * 100)}%</span>
        {onReset && (
          <button onClick={onReset} className="text-xs text-muted hover:text-red-500 transition-colors font-medium">
            Скинути
          </button>
        )}
      </div>
      <p className="text-xs text-muted/60 text-center mt-1.5">
        Перетягніть зображення · прокрутіть або рухайте повзунок для масштабу
      </p>
    </div>
  );
}

// ── Main modal ───────────────────────────────────────────────────────

export default function CoverPickerModal({ isOpen, onClose, onApply }: Props) {
  const [tab, setTab] = useState<"file" | "url">("file");

  // File tab
  const [fileSrc, setFileSrc] = useState<string | null>(null);
  const [fileCrop, setFileCrop] = useState<Point>({ x: 0, y: 0 });
  const [fileZoom, setFileZoom] = useState(1);
  const [fileCroppedPixels, setFileCroppedPixels] = useState<Area | null>(null);
  const [fileDragOver, setFileDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // URL tab
  const [urlInput, setUrlInput] = useState("");
  const [urlLoaded, setUrlLoaded] = useState<{ kind: "image" | "video"; src: string; ytId?: string } | null>(null);
  const [urlCrop, setUrlCrop] = useState<Point>({ x: 0, y: 0 });
  const [urlZoom, setUrlZoom] = useState(1);
  const [urlCroppedPixels, setUrlCroppedPixels] = useState<Area | null>(null);
  const [urlError, setUrlError] = useState("");

  const [applying, setApplying] = useState(false);

  const onFileCropComplete = useCallback((_croppedArea: Area, pixels: Area) => setFileCroppedPixels(pixels), []);
  const onUrlCropComplete  = useCallback((_croppedArea: Area, pixels: Area) => setUrlCroppedPixels(pixels), []);

  if (!isOpen) return null;

  function resetAll() {
    setFileSrc(null); setFileCrop({ x: 0, y: 0 }); setFileZoom(1); setFileCroppedPixels(null);
    setUrlInput(""); setUrlLoaded(null); setUrlCrop({ x: 0, y: 0 }); setUrlZoom(1); setUrlCroppedPixels(null);
    setUrlError(""); setApplying(false);
  }

  function handleClose() { resetAll(); onClose(); }

  function loadFile(file: File) {
    if (!file.type.startsWith("image/")) { alert("Підтримуються тільки зображення (JPG, PNG, WebP). Для відео вставте посилання на вкладці «Посилання»."); return; }
    if (file.size > 15 * 1024 * 1024) { alert("Файл занадто великий — максимум 15 МБ."); return; }
    const r = new FileReader();
    r.onload = (e) => { setFileSrc(e.target?.result as string); setFileCrop({ x: 0, y: 0 }); setFileZoom(1); };
    r.readAsDataURL(file);
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) loadFile(f);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setFileDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) loadFile(f);
  }

  function handleUrlLoad() {
    const url = urlInput.trim();
    if (!url) return;
    setUrlError("");
    setUrlLoaded(null);

    if (isVideoUrl(url)) {
      const ytId = getYouTubeId(url);
      setUrlLoaded({ kind: "video", src: url, ytId: ytId ?? undefined });
    } else {
      setUrlLoaded({ kind: "image", src: url });
      setUrlCrop({ x: 0, y: 0 }); setUrlZoom(1);
    }
  }

  async function handleApply() {
    setApplying(true);
    try {
      if (tab === "file") {
        if (!fileSrc || !fileCroppedPixels) return;
        const data = await getCroppedImg(fileSrc, fileCroppedPixels);
        onApply({ kind: "image", data });
      } else {
        if (!urlLoaded) return;
        if (urlLoaded.kind === "video") {
          const thumbnailUrl = urlLoaded.ytId
            ? `https://img.youtube.com/vi/${urlLoaded.ytId}/maxresdefault.jpg`
            : undefined;
          onApply({ kind: "video", url: urlLoaded.src, thumbnailUrl });
        } else {
          if (urlCroppedPixels) {
            const data = await getCroppedImg(urlLoaded.src, urlCroppedPixels);
            onApply({ kind: "image", data });
          } else {
            onApply({ kind: "image", data: urlLoaded.src });
          }
        }
      }
      resetAll();
      onClose();
    } finally {
      setApplying(false);
    }
  }

  const canApply = tab === "file" ? !!fileSrc : !!urlLoaded;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-foreground">Обкладинка профілю</h2>
            <p className="text-xs text-muted mt-0.5">Зображення, банер або відео-фон · 1400×200 px (7:1)</p>
          </div>
          <button onClick={handleClose} className="w-8 h-8 rounded-xl hover:bg-muted-bg flex items-center justify-center text-muted transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-6 flex-shrink-0 gap-1">
          {(["file", "url"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors ${
                tab === t ? "border-primary text-primary" : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {t === "file" ? "📁 Завантажити файл" : "🔗 Вставити посилання"}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">

          {/* ── File tab ─────────────────────────── */}
          {tab === "file" && (
            !fileSrc ? (
              <div
                className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                  fileDragOver ? "border-primary bg-primary-light" : "border-border hover:border-primary/50 hover:bg-muted-bg/60"
                }`}
                onDragOver={(e) => { e.preventDefault(); setFileDragOver(true); }}
                onDragLeave={() => setFileDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
              >
                <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-foreground mb-1">Перетягніть зображення сюди</p>
                <p className="text-sm text-muted">або натисніть для вибору файлу</p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  {["JPG", "PNG", "WebP", "до 15 МБ"].map((l) => (
                    <span key={l} className="text-[10px] px-2 py-0.5 rounded-full bg-muted-bg text-muted font-medium">{l}</span>
                  ))}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
              </div>
            ) : (
              <CropPanel
                src={fileSrc}
                crop={fileCrop}
                zoom={fileZoom}
                onCropChange={setFileCrop}
                onZoomChange={setFileZoom}
                onCropComplete={onFileCropComplete}
                onReset={() => { setFileSrc(null); setFileCrop({ x: 0, y: 0 }); setFileZoom(1); }}
              />
            )
          )}

          {/* ── URL tab ──────────────────────────── */}
          {tab === "url" && (
            <div className="flex flex-col gap-5">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Посилання на зображення або відео
                </label>
                <div className="flex gap-2">
                  <input
                    value={urlInput}
                    onChange={(e) => { setUrlInput(e.target.value); setUrlError(""); setUrlLoaded(null); }}
                    onKeyDown={(e) => e.key === "Enter" && handleUrlLoad()}
                    placeholder="https://... або YouTube посилання"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted/40"
                  />
                  <button
                    onClick={handleUrlLoad}
                    disabled={!urlInput.trim()}
                    className="px-4 py-2.5 rounded-xl bg-primary-light text-primary text-sm font-semibold hover:bg-primary/10 transition-all flex-shrink-0 disabled:opacity-40"
                  >
                    Завантажити
                  </button>
                </div>
                {urlError && <p className="text-xs text-red-500 mt-1.5">{urlError}</p>}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {[
                    { l: "YouTube відео", ex: "https://youtube.com/watch?v=..." },
                    { l: "Пряме .mp4", ex: "https://site.com/video.mp4" },
                    { l: "Unsplash", ex: "https://images.unsplash.com/..." },
                  ].map(({ l }) => (
                    <span key={l} className="text-[10px] px-2 py-0.5 rounded-full bg-muted-bg text-muted">{l}</span>
                  ))}
                </div>
              </div>

              {/* Video preview */}
              {urlLoaded?.kind === "video" && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-semibold text-foreground">Перегляд відео</p>
                  <div className="rounded-2xl overflow-hidden bg-zinc-900 relative" style={{ paddingTop: "33.3%" }}>
                    {urlLoaded.ytId ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${urlLoaded.ytId}?autoplay=1&mute=1&loop=1&playlist=${urlLoaded.ytId}&controls=0`}
                        className="absolute inset-0 w-full h-full"
                        allow="autoplay"
                        title="Video preview"
                      />
                    ) : (
                      <video
                        src={urlLoaded.src}
                        autoPlay muted loop playsInline
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex items-start gap-2.5 p-3.5 bg-blue-50 rounded-xl border border-blue-100">
                    <svg className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      Відео буде відтворюватись автоматично без звуку як фоновий банер профілю
                    </p>
                  </div>
                </div>
              )}

              {/* Image URL crop */}
              {urlLoaded?.kind === "image" && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-semibold text-foreground">Підгонка зображення</p>
                  <CropPanel
                    src={urlLoaded.src}
                    crop={urlCrop}
                    zoom={urlZoom}
                    onCropChange={setUrlCrop}
                    onZoomChange={setUrlZoom}
                    onCropComplete={onUrlCropComplete}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border flex-shrink-0 bg-muted-bg/30">
          <p className="text-[10px] text-muted">
            {tab === "file"
              ? "Обрізається до 1400×200 px"
              : urlLoaded?.kind === "video" ? "Відео зберігається як фон" : "Зображення обрізається до 1200×400 px"}
          </p>
          <div className="flex items-center gap-3">
            <button onClick={handleClose} className="px-4 py-2 rounded-xl border border-border text-sm font-semibold text-muted hover:text-foreground hover:bg-muted-bg transition-all">
              Скасувати
            </button>
            <button
              onClick={handleApply}
              disabled={!canApply || applying}
              className="px-5 py-2 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm shadow-primary/20 disabled:opacity-40"
            >
              {applying ? "Обробляємо..." : "Застосувати ✓"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
