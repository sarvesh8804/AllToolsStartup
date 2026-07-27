"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  downloadBlob,
  loadImageBitmap,
  type LoadedImage,
} from "@/lib/image/canvas";
import {
  buildIcoFromPngs,
  FAVICON_SIZES,
  faviconHtmlSnippet,
  ICO_PACK_SIZES,
  squareCropRect,
} from "@/lib/image/favicon";
import {
  formatBytes,
  isRasterImageFile,
  normalizeHexColor,
} from "@/lib/image/format";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

type GeneratedIcon = {
  id: string;
  size: number;
  filename: string;
  label: string;
  blob: Blob;
  url: string;
};

async function canvasToPngBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error("Failed to encode PNG."));
      else resolve(blob);
    }, "image/png");
  });
}

function drawSquareIcon(
  source: CanvasImageSource,
  crop: { sx: number; sy: number; sSize: number },
  size: number,
  background?: string,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas 2D context.");
  if (background) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, size, size);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    source,
    crop.sx,
    crop.sy,
    crop.sSize,
    crop.sSize,
    0,
    0,
    size,
    size,
  );
  return canvas;
}

export function FaviconGeneratorTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loaded, setLoaded] = useState<LoadedImage | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [icons, setIcons] = useState<GeneratedIcon[]>([]);
  const [icoBlob, setIcoBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [padding, setPadding] = useState(0);
  const [bgEnabled, setBgEnabled] = useState(false);
  const [bg, setBg] = useState("#ffffff");
  const [busy, setBusy] = useState(false);
  const [started, setStarted] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "favicon-generator-from-image",
        family: "image",
      });
    }
  }, [started]);

  const clear = useCallback(() => {
    setLoaded((prev) => {
      prev?.bitmap.close();
      return null;
    });
    setPreviewUrl((url) => {
      if (url) URL.revokeObjectURL(url);
      return null;
    });
    setIcons((prev) => {
      for (const i of prev) URL.revokeObjectURL(i.url);
      return [];
    });
    setIcoBlob(null);
    setFile(null);
  }, []);

  const acceptFile = useCallback(
    async (f: File) => {
      markStart();
      if (!isRasterImageFile(f)) {
        setError("Choose a PNG, JPEG, WebP, or similar raster image.");
        return;
      }
      try {
        const img = await loadImageBitmap(f);
        clear();
        setFile(f);
        setLoaded(img);
        setPreviewUrl(URL.createObjectURL(f));
        setError(null);
      } catch {
        setError("Could not read that image.");
      }
    },
    [clear, markStart],
  );

  useEffect(() => {
    return () => {
      loaded?.bitmap.close();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      for (const i of icons) URL.revokeObjectURL(i.url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- unmount only
  }, []);

  const crop = useMemo(() => {
    if (!loaded) return null;
    return squareCropRect(loaded.width, loaded.height);
  }, [loaded]);

  const generate = useCallback(async () => {
    if (!loaded || !crop || "ok" in crop) return;
    setBusy(true);
    setError(null);
    try {
      const padRatio = Math.min(40, Math.max(0, padding)) / 100;
      const bgColor = bgEnabled ? normalizeHexColor(bg) : undefined;

      const generated: GeneratedIcon[] = [];
      const icoLayers: { size: number; png: Uint8Array }[] = [];

      for (const spec of FAVICON_SIZES) {
        const canvas = document.createElement("canvas");
        canvas.width = spec.size;
        canvas.height = spec.size;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Could not get canvas 2D context.");

        if (bgColor) {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, spec.size, spec.size);
        }

        const inset = Math.round((spec.size * padRatio) / 2);
        const drawSize = spec.size - inset * 2;
        const inner = drawSquareIcon(
          loaded.bitmap,
          crop,
          Math.max(1, drawSize),
          undefined,
        );
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(inner, inset, inset, drawSize, drawSize);

        const blob = await canvasToPngBlob(canvas);
        const url = URL.createObjectURL(blob);
        generated.push({
          id: spec.id,
          size: spec.size,
          filename: `${spec.filename}.png`,
          label: spec.label,
          blob,
          url,
        });

        if ((ICO_PACK_SIZES as readonly number[]).includes(spec.size)) {
          const buf = new Uint8Array(await blob.arrayBuffer());
          icoLayers.push({ size: spec.size, png: buf });
        }
      }

      const icoBytes = buildIcoFromPngs(icoLayers);
      const ico = new Blob([Uint8Array.from(icoBytes)], {
        type: "image/x-icon",
      });

      setIcons((prev) => {
        for (const i of prev) URL.revokeObjectURL(i.url);
        return generated;
      });
      setIcoBlob(ico);
      track({
        name: "tool_complete",
        tool: "favicon-generator-from-image",
        family: "image",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Favicon generation failed.");
    } finally {
      setBusy(false);
    }
  }, [loaded, crop, padding, bgEnabled, bg]);

  useEffect(() => {
    if (!loaded || !crop || "ok" in crop) return;
    const t = window.setTimeout(() => {
      void generate();
    }, 120);
    return () => window.clearTimeout(t);
  }, [loaded, crop, padding, bgEnabled, bg, generate]);

  const html = useMemo(() => faviconHtmlSnippet(), []);

  const downloadAllPngs = () => {
    for (const icon of icons) {
      downloadBlob(icon.blob, icon.filename);
    }
  };

  return (
    <div className="space-y-5">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files[0];
          if (f) void acceptFile(f);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center transition-colors",
          dragOver
            ? "border-[var(--accent)] bg-[var(--accent)]/10"
            : "border-[var(--border)] bg-[var(--surface)]",
        )}
      >
        <p className="text-sm text-[var(--muted)]">
          Drop a logo or image (center-cropped to square), or
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--ink)]"
        >
          Choose image
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/bmp,.png,.jpg,.jpeg,.webp,.gif,.bmp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void acceptFile(f);
            e.target.value = "";
          }}
        />
        {file && loaded ? (
          <p className="font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
            {file.name} · {formatBytes(file.size)} · {loaded.width}×
            {loaded.height}
          </p>
        ) : null}
      </div>

      {error ? <ToolErrorState message={error} /> : null}
      {crop && "ok" in crop ? <ToolErrorState message={crop.error} /> : null}

      {loaded ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
              Padding ({padding}%)
              <input
                type="range"
                min={0}
                max={30}
                value={padding}
                onChange={(e) => {
                  markStart();
                  setPadding(Number(e.target.value));
                }}
              />
            </label>
            <div className="flex flex-col gap-2">
              <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
                <input
                  type="checkbox"
                  checked={bgEnabled}
                  onChange={(e) => {
                    markStart();
                    setBgEnabled(e.target.checked);
                  }}
                />
                Solid background
              </label>
              {bgEnabled ? (
                <input
                  type="color"
                  value={normalizeHexColor(bg)}
                  onChange={(e) => {
                    markStart();
                    setBg(e.target.value);
                  }}
                  className="h-10 w-full cursor-pointer rounded-md border border-[var(--border)] bg-[var(--surface)]"
                />
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_2fr]">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                Source
              </p>
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Source"
                  className="max-h-48 w-full rounded-xl border border-[var(--border)] object-contain bg-[var(--surface)]"
                />
              ) : null}
            </div>
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                Generated sizes
                {busy ? " · working…" : ""}
              </p>
              <div className="flex flex-wrap items-end gap-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                {icons.map((icon) => (
                  <button
                    key={icon.id}
                    type="button"
                    title={`Download ${icon.filename}`}
                    onClick={() => downloadBlob(icon.blob, icon.filename)}
                    className="flex flex-col items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={icon.url}
                      alt={icon.label}
                      width={Math.min(64, icon.size)}
                      height={Math.min(64, icon.size)}
                      className="rounded-sm border border-[var(--border)]"
                      style={{
                        width: Math.min(64, icon.size),
                        height: Math.min(64, icon.size),
                        imageRendering: icon.size <= 32 ? "pixelated" : "auto",
                        backgroundImage:
                          "repeating-conic-gradient(#ccc 0 25%, transparent 0 50%)",
                        backgroundSize: "12px 12px",
                      }}
                    />
                    {icon.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!icoBlob || busy}
              onClick={() => icoBlob && downloadBlob(icoBlob, "favicon.ico")}
              className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--ink)] disabled:opacity-50"
            >
              Download favicon.ico
            </button>
            <button
              type="button"
              disabled={icons.length === 0 || busy}
              onClick={downloadAllPngs}
              className="rounded-md border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground)] hover:border-[var(--accent)]/50 disabled:opacity-50"
            >
              Download all PNGs
            </button>
          </div>

          <div>
            <EditorPaneHeader label="HTML for head" getText={() => html} />
            <CodeEditor language="text" value={html} editable={false} minHeight="14vh" />
          </div>
        </>
      ) : null}
    </div>
  );
}
