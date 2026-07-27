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
  COMPRESS_MAX_SIDE_PRESETS,
  COMPRESS_QUALITY_PRESETS,
  compressionStats,
  fitWithinMaxSide,
} from "@/lib/image/compress";
import {
  changeExtension,
  formatBytes,
  isRasterImageFile,
  mimeToExtension,
  type OutputImageFormat,
} from "@/lib/image/format";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

export function ImageCompressorTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loaded, setLoaded] = useState<LoadedImage | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quality, setQuality] = useState(70);
  const [maxSide, setMaxSide] = useState<number | null>(1920);
  const [outFormat, setOutFormat] = useState<OutputImageFormat>("image/jpeg");
  const [busy, setBusy] = useState(false);
  const [started, setStarted] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "image-compressor",
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
    setResultUrl((url) => {
      if (url) URL.revokeObjectURL(url);
      return null;
    });
    setResultBlob(null);
    setFile(null);
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
        clear();
        setFile(f);
        setLoaded(img);
        setPreviewUrl(URL.createObjectURL(f));
        if (f.type === "image/png") setOutFormat("image/webp");
        else if (f.type === "image/webp") setOutFormat("image/webp");
        else setOutFormat("image/jpeg");
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
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- unmount only
  }, []);

  const dims = useMemo(() => {
    if (!loaded) return null;
    return fitWithinMaxSide(loaded.width, loaded.height, maxSide);
  }, [loaded, maxSide]);

  const compress = useCallback(async () => {
    if (!loaded || !file || !dims || !dims.ok) return;
    setBusy(true);
    setError(null);
    try {
      const canvas = drawImageToCanvas(loaded.bitmap, {
        width: dims.width,
        height: dims.height,
        background: outFormat === "image/jpeg" ? "#ffffff" : undefined,
      });
      const blob = await canvasToBlob(canvas, outFormat, quality / 100);
      setResultBlob(blob);
      setResultUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
      track({
        name: "tool_complete",
        tool: "image-compressor",
        family: "image",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Compression failed.");
    } finally {
      setBusy(false);
    }
  }, [loaded, file, dims, outFormat, quality]);

  useEffect(() => {
    if (!loaded || !dims?.ok) return;
    const t = window.setTimeout(() => {
      void compress();
    }, 180);
    return () => window.clearTimeout(t);
  }, [loaded, dims, quality, outFormat, compress]);

  const stats =
    file && resultBlob
      ? compressionStats(file.size, resultBlob.size)
      : null;

  const download = () => {
    if (!resultBlob || !file) return;
    downloadBlob(
      resultBlob,
      changeExtension(file.name, mimeToExtension(outFormat)),
    );
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
      {dims && !dims.ok ? <ToolErrorState message={dims.error} /> : null}

      {loaded ? (
        <>
          <div className="flex flex-wrap gap-2">
            {COMPRESS_QUALITY_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  markStart();
                  setQuality(p.quality);
                }}
                className={
                  quality === p.quality
                    ? "rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--ink)]"
                    : "rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] hover:border-[var(--accent)]/50"
                }
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
              Quality ({quality}%)
              <input
                type="range"
                min={10}
                max={95}
                value={quality}
                onChange={(e) => {
                  markStart();
                  setQuality(Number(e.target.value));
                }}
                disabled={outFormat === "image/png"}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
              Output format
              <select
                value={outFormat}
                onChange={(e) => {
                  markStart();
                  setOutFormat(e.target.value as OutputImageFormat);
                }}
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
              >
                <option value="image/jpeg">JPEG</option>
                <option value="image/webp">WebP</option>
                <option value="image/png">PNG</option>
              </select>
            </label>
          </div>

          <div>
            <p className="mb-2 text-sm text-[var(--muted)]">Max long side</p>
            <div className="flex flex-wrap gap-2">
              {COMPRESS_MAX_SIDE_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    markStart();
                    setMaxSide(p.value);
                  }}
                  className={
                    maxSide === p.value
                      ? "rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--ink)]"
                      : "rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] hover:border-[var(--accent)]/50"
                  }
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {stats?.ok ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                  Original
                </p>
                <p className="font-[family-name:var(--font-mono)] text-lg text-[var(--foreground)]">
                  {formatBytes(stats.originalBytes)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                  Compressed
                  {busy ? "…" : ""}
                </p>
                <p className="font-[family-name:var(--font-mono)] text-lg text-[var(--foreground)]">
                  {formatBytes(stats.compressedBytes)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                  Saved
                </p>
                <p className="font-[family-name:var(--font-mono)] text-lg text-[var(--foreground)]">
                  {stats.savedPercent}%
                  {dims?.ok ? ` · ${dims.width}×${dims.height}` : ""}
                </p>
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                Original
              </p>
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Original"
                  className="max-h-56 w-full rounded-xl border border-[var(--border)] object-contain bg-[var(--surface)]"
                />
              ) : null}
            </div>
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                Compressed preview
              </p>
              {resultUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resultUrl}
                  alt="Compressed"
                  className="max-h-56 w-full rounded-xl border border-[var(--border)] object-contain bg-[var(--surface)]"
                />
              ) : (
                <div className="flex h-40 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm text-[var(--muted)]">
                  Waiting…
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            disabled={!resultBlob || busy}
            onClick={download}
            className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--ink)] disabled:opacity-50"
          >
            Download compressed
          </button>
        </>
      ) : null}
    </div>
  );
}
