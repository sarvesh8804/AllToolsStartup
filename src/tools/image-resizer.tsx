"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  canvasToBlob,
  downloadBlob,
  drawImageToCanvas,
  loadImageBitmap,
  type LoadedImage,
} from "@/lib/image/canvas";
import {
  changeExtension,
  formatBytes,
  isRasterImageFile,
  mimeToExtension,
  type OutputImageFormat,
} from "@/lib/image/format";
import {
  computeResizeSize,
  RESIZE_PRESETS,
  type ResizeMode,
} from "@/lib/image/resize";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

export function ImageResizerTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loaded, setLoaded] = useState<LoadedImage | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<ResizeMode>("exact");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [percent, setPercent] = useState("50");
  const [lockAspect, setLockAspect] = useState(true);
  const [outFormat, setOutFormat] = useState<OutputImageFormat | "original">(
    "original",
  );
  const [quality, setQuality] = useState(92);
  const [busy, setBusy] = useState(false);
  const [started, setStarted] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "image-resizer", family: "image" });
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
        setWidth(String(img.width));
        setHeight(String(img.height));
        setPercent("100");
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

  const sizeResult = useMemo(() => {
    if (!loaded) return null;
    return computeResizeSize({
      sourceWidth: loaded.width,
      sourceHeight: loaded.height,
      mode,
      width: width ? Number(width) : null,
      height: height ? Number(height) : null,
      percent: percent ? Number(percent) : null,
      lockAspect,
    });
  }, [loaded, mode, width, height, percent, lockAspect]);

  const onWidthChange = (v: string) => {
    markStart();
    setWidth(v);
    if (lockAspect && loaded && mode !== "percent" && v) {
      const n = Number(v);
      if (Number.isFinite(n) && n > 0) {
        setHeight(String(Math.max(1, Math.round(n / (loaded.width / loaded.height)))));
      }
    }
  };

  const onHeightChange = (v: string) => {
    markStart();
    setHeight(v);
    if (lockAspect && loaded && mode !== "percent" && v) {
      const n = Number(v);
      if (Number.isFinite(n) && n > 0) {
        setWidth(String(Math.max(1, Math.round(n * (loaded.width / loaded.height)))));
      }
    }
  };

  const applyPreset = (id: string) => {
    markStart();
    const p = RESIZE_PRESETS.find((x) => x.id === id);
    if (!p) return;
    if ("percent" in p && p.percent != null) {
      setMode("percent");
      setPercent(String(p.percent));
      return;
    }
    setMode(p.height != null && !lockAspect ? "exact" : "exact");
    if (p.width != null) setWidth(String(p.width));
    if (p.height != null) {
      setHeight(String(p.height));
      if (lockAspect && loaded && p.width != null) {
        setHeight(
          String(
            Math.max(
              1,
              Math.round(p.width / (loaded.width / loaded.height)),
            ),
          ),
        );
      }
    } else if (loaded && p.width != null) {
      setHeight(
        String(
          Math.max(1, Math.round(p.width / (loaded.width / loaded.height))),
        ),
      );
    }
  };

  const resolveMime = (): OutputImageFormat => {
    if (outFormat !== "original") return outFormat;
    if (file?.type === "image/png") return "image/png";
    if (file?.type === "image/webp") return "image/webp";
    return "image/jpeg";
  };

  const download = async () => {
    if (!loaded || !file || !sizeResult || !sizeResult.ok) return;
    setBusy(true);
    setError(null);
    try {
      const mime = resolveMime();
      const canvas = drawImageToCanvas(loaded.bitmap, {
        width: sizeResult.width,
        height: sizeResult.height,
        background:
          mime === "image/jpeg" ? "#ffffff" : undefined,
      });
      const blob = await canvasToBlob(canvas, mime, quality / 100);
      const name = changeExtension(
        file.name,
        mimeToExtension(mime),
      );
      downloadBlob(blob, name);
      track({
        name: "tool_complete",
        tool: "image-resizer",
        family: "image",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Resize failed.");
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
        <p className="text-sm text-[var(--muted)]">
          Drop an image here, or
        </p>
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
            e.target.value = "";
          }}
        />
        {file ? (
          <p className="font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
            {file.name} · {formatBytes(file.size)}
            {loaded ? ` · ${loaded.width}×${loaded.height}` : ""}
          </p>
        ) : null}
      </div>

      {error ? <ToolErrorState message={error} /> : null}

      {loaded && previewUrl ? (
        <>
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["exact", "Exact size"],
                ["fit", "Fit box"],
                ["percent", "Percent"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  markStart();
                  setMode(id);
                }}
                className={
                  mode === id
                    ? "rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--ink)]"
                    : "rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] hover:border-[var(--accent)]/50"
                }
              >
                {label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {RESIZE_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id)}
                className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] hover:border-[var(--accent)]/50"
              >
                {p.label}
              </button>
            ))}
          </div>

          {mode === "percent" ? (
            <label className="flex max-w-xs flex-col gap-1 text-sm text-[var(--muted)]">
              Scale %
              <input
                type="number"
                min={1}
                max={1000}
                value={percent}
                onChange={(e) => {
                  markStart();
                  setPercent(e.target.value);
                }}
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
              />
            </label>
          ) : (
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
                Width (px)
                <input
                  type="number"
                  min={1}
                  value={width}
                  onChange={(e) => onWidthChange(e.target.value)}
                  className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
                Height (px)
                <input
                  type="number"
                  min={1}
                  value={height}
                  onChange={(e) => onHeightChange(e.target.value)}
                  className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
                />
              </label>
              <label className="flex items-end gap-2 pb-2 text-sm text-[var(--foreground)]">
                <input
                  type="checkbox"
                  checked={lockAspect}
                  onChange={(e) => {
                    markStart();
                    setLockAspect(e.target.checked);
                  }}
                />
                Lock aspect ratio
              </label>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
              Output format
              <select
                value={outFormat}
                onChange={(e) => {
                  markStart();
                  setOutFormat(e.target.value as typeof outFormat);
                }}
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
              >
                <option value="original">Same as source</option>
                <option value="image/jpeg">JPEG</option>
                <option value="image/png">PNG</option>
                <option value="image/webp">WebP</option>
              </select>
            </label>
            {(outFormat === "image/jpeg" ||
              outFormat === "image/webp" ||
              (outFormat === "original" &&
                file?.type !== "image/png")) && (
              <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
                Quality ({quality}%)
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={quality}
                  onChange={(e) => {
                    markStart();
                    setQuality(Number(e.target.value));
                  }}
                />
              </label>
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                Original
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Original"
                className="max-h-64 w-full rounded-xl border border-[var(--border)] object-contain bg-[var(--surface)]"
              />
            </div>
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                Output size
              </p>
              {sizeResult?.ok ? (
                <p className="font-[family-name:var(--font-mono)] text-2xl text-[var(--foreground)]">
                  {sizeResult.width}×{sizeResult.height}
                </p>
              ) : (
                <ToolErrorState
                  message={sizeResult?.error ?? "Set dimensions"}
                />
              )}
              <button
                type="button"
                disabled={busy || !sizeResult?.ok}
                onClick={() => void download()}
                className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--ink)] disabled:opacity-50"
              >
                {busy ? "Working…" : "Download resized"}
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
