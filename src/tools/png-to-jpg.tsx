"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  isPngFile,
  normalizeHexColor,
} from "@/lib/image/format";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

export function PngToJpgTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loaded, setLoaded] = useState<LoadedImage | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultSize, setResultSize] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quality, setQuality] = useState(92);
  const [bg, setBg] = useState("#ffffff");
  const [busy, setBusy] = useState(false);
  const [started, setStarted] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "png-to-jpg", family: "image" });
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
    setResultSize(null);
    setFile(null);
  }, []);

  const acceptFile = useCallback(
    async (f: File) => {
      markStart();
      if (!isPngFile(f)) {
        setError("Choose a PNG file.");
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
        setError("Could not read that PNG.");
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

  const convert = useCallback(async () => {
    if (!loaded || !file) return;
    setBusy(true);
    setError(null);
    try {
      const canvas = drawImageToCanvas(loaded.bitmap, {
        width: loaded.width,
        height: loaded.height,
        background: normalizeHexColor(bg),
      });
      const blob = await canvasToBlob(canvas, "image/jpeg", quality / 100);
      setResultUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
      setResultSize(blob.size);
      track({
        name: "tool_complete",
        tool: "png-to-jpg",
        family: "image",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed.");
    } finally {
      setBusy(false);
    }
  }, [loaded, file, bg, quality]);

  useEffect(() => {
    if (!loaded) return;
    const t = window.setTimeout(() => {
      void convert();
    }, 150);
    return () => window.clearTimeout(t);
  }, [loaded, quality, bg, convert]);

  const download = () => {
    if (!resultUrl || !file) return;
    void fetch(resultUrl)
      .then((r) => r.blob())
      .then((blob) => {
        downloadBlob(blob, changeExtension(file.name, "jpg"));
      });
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
        <p className="text-sm text-[var(--muted)]">Drop a PNG here, or</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--ink)]"
        >
          Choose PNG
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,.png"
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

      {loaded ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
              JPEG quality ({quality}%)
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
            <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
              Background (for transparency)
              <input
                type="color"
                value={normalizeHexColor(bg)}
                onChange={(e) => {
                  markStart();
                  setBg(e.target.value);
                }}
                className="h-10 w-full cursor-pointer rounded-md border border-[var(--border)] bg-[var(--surface)]"
              />
            </label>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                PNG
              </p>
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="PNG source"
                  className="max-h-64 w-full rounded-xl border border-[var(--border)] object-contain bg-[var(--surface)]"
                />
              ) : null}
            </div>
            <div>
              <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                JPEG preview
                {resultSize != null ? ` · ${formatBytes(resultSize)}` : ""}
                {busy ? " · converting…" : ""}
              </p>
              {resultUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resultUrl}
                  alt="JPEG result"
                  className="max-h-64 w-full rounded-xl border border-[var(--border)] object-contain bg-[var(--surface)]"
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
            disabled={!resultUrl || busy}
            onClick={download}
            className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--ink)] disabled:opacity-50"
          >
            Download JPG
          </button>
        </>
      ) : null}
    </div>
  );
}
