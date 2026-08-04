"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  canvasToBlob,
  downloadBlob,
  drawCropToCanvas,
  loadImageBitmap,
  type LoadedImage,
} from "@/lib/image/canvas";
import {
  CROP_ASPECT_PRESETS,
  centerCropForAspect,
  defaultCropRect,
  validateCropRect,
  type CropRect,
} from "@/lib/image/crop";
import {
  changeExtension,
  formatBytes,
  isRasterImageFile,
  mimeToExtension,
  type OutputImageFormat,
} from "@/lib/image/format";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

export function ImageCropperTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loaded, setLoaded] = useState<LoadedImage | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, width: 1, height: 1 });
  const [aspectId, setAspectId] = useState("free");
  const [outFormat, setOutFormat] = useState<OutputImageFormat | "original">("original");
  const [quality, setQuality] = useState(92);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [started, setStarted] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "image-cropper", family: "image" });
    }
  }, [started]);

  const clearImage = useCallback(() => {
    setFile(null);
    setLoaded((prev) => {
      prev?.bitmap.close();
      return null;
    });
    setPreviewUrl((url) => {
      if (url) URL.revokeObjectURL(url);
      return null;
    });
  }, []);

  const acceptFile = useCallback(
    async (f: File) => {
      markStart();
      if (!isRasterImageFile(f)) {
        setError("Choose a PNG, JPEG, WebP, GIF, or BMP image.");
        return;
      }
      try {
        const img = await loadImageBitmap(f);
        clearImage();
        setFile(f);
        setLoaded(img);
        setPreviewUrl(URL.createObjectURL(f));
        setCrop(defaultCropRect(img.width, img.height));
        setAspectId("free");
        setError(null);
      } catch {
        setError("Could not read that image.");
      }
    },
    [clearImage, markStart],
  );

  useEffect(() => {
    return () => {
      loaded?.bitmap.close();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- unmount only
  }, []);

  const validated = useMemo(() => {
    if (!loaded) return null;
    return validateCropRect(loaded.width, loaded.height, crop);
  }, [loaded, crop]);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!loaded || !validated?.ok || !previewCanvasRef.current) return;
    const c = drawCropToCanvas(loaded.bitmap, validated.rect);
    const node = previewCanvasRef.current;
    node.width = c.width;
    node.height = c.height;
    const ctx = node.getContext("2d");
    if (ctx) ctx.drawImage(c, 0, 0);
  }, [loaded, validated]);

  const applyAspect = (id: string) => {
    markStart();
    setAspectId(id);
    if (!loaded) return;
    const preset = CROP_ASPECT_PRESETS.find((p) => p.id === id);
    if (!preset?.ratio) {
      setCrop(defaultCropRect(loaded.width, loaded.height));
      return;
    }
    setCrop(centerCropForAspect(loaded.width, loaded.height, preset.ratio));
  };

  const updateCrop = (patch: Partial<CropRect>) => {
    markStart();
    setCrop((prev) => ({ ...prev, ...patch }));
  };

  const resolveMime = (): OutputImageFormat => {
    if (outFormat !== "original") return outFormat;
    if (file?.type === "image/png") return "image/png";
    if (file?.type === "image/webp") return "image/webp";
    return "image/jpeg";
  };

  const download = async () => {
    if (!loaded || !file || !validated?.ok) return;
    setBusy(true);
    setError(null);
    try {
      const mime = resolveMime();
      const canvas = drawCropToCanvas(loaded.bitmap, validated.rect);
      const blob = await canvasToBlob(canvas, mime, quality / 100);
      const base = file.name.replace(/\.[^.]+$/, "") || "crop";
      downloadBlob(blob, changeExtension(`${base}-crop`, mimeToExtension(mime)));
      track({ name: "tool_complete", tool: "image-cropper", family: "image" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Crop failed.");
    } finally {
      setBusy(false);
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
        <p className="text-sm text-[var(--muted)]">Drop an image here, or</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--ink)]"
        >
          Choose file
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/bmp,.png,.jpg,.jpeg,.webp,.gif,.bmp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void acceptFile(f);
          }}
        />
        {file ? (
          <p className="text-xs text-[var(--muted)]">
            {file.name} · {formatBytes(file.size)}
            {loaded ? ` · ${loaded.width}×${loaded.height}` : ""}
          </p>
        ) : null}
      </div>

      {error ? <ToolErrorState message={error} /> : null}
      {validated && !validated.ok && loaded ? (
        <ToolErrorState message={validated.error} />
      ) : null}

      {loaded && previewUrl ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="space-y-3">
            <p className="text-sm font-medium text-[var(--foreground)]">Source</p>
            <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Source preview" className="max-h-[50vh] w-full object-contain" />
            </div>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium text-[var(--foreground)]">Crop preview</p>
            <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
              {validated?.ok ? (
                <canvas ref={previewCanvasRef} className="max-h-[50vh] w-full object-contain" />
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {loaded ? (
        <div className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex flex-wrap gap-2">
            {CROP_ASPECT_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyAspect(p.id)}
                className={
                  aspectId === p.id
                    ? "rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--ink)]"
                    : "rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]/50"
                }
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(["x", "y", "width", "height"] as const).map((key) => (
              <label key={key} className="flex flex-col gap-1 text-sm text-[var(--muted)]">
                {key}
                <input
                  type="number"
                  min={key === "x" || key === "y" ? 0 : 1}
                  value={crop[key]}
                  onChange={(e) => updateCrop({ [key]: Number(e.target.value) })}
                  className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-[var(--foreground)]"
                />
              </label>
            ))}
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
              Format
              <select
                value={outFormat}
                onChange={(e) => setOutFormat(e.target.value as OutputImageFormat | "original")}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2"
              >
                <option value="original">Original</option>
                <option value="image/png">PNG</option>
                <option value="image/jpeg">JPEG</option>
                <option value="image/webp">WebP</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
              Quality
              <input
                type="range"
                min={50}
                max={100}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
              />
            </label>
            <button
              type="button"
              disabled={busy || !validated?.ok}
              onClick={() => void download()}
              className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--ink)] disabled:opacity-50"
            >
              {busy ? "Exporting…" : "Download crop"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
