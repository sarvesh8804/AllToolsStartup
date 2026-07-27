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
  scanImageMetadata,
  type MetadataScan,
} from "@/lib/image/exif";
import {
  changeExtension,
  detectImageMime,
  formatBytes,
  isRasterImageFile,
  mimeToExtension,
  type OutputImageFormat,
} from "@/lib/image/format";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

export function ExifRemoverTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loaded, setLoaded] = useState<LoadedImage | null>(null);
  const [scan, setScan] = useState<MetadataScan | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [outMime, setOutMime] = useState<OutputImageFormat>("image/jpeg");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [started, setStarted] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "exif-remover", family: "image" });
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
    setScan(null);
    setFile(null);
  }, []);

  const acceptFile = useCallback(
    async (f: File) => {
      markStart();
      if (!isRasterImageFile(f)) {
        setError("Choose a raster image (JPEG/PNG/WebP recommended).");
        return;
      }
      try {
        const buf = new Uint8Array(await f.arrayBuffer());
        const meta = scanImageMetadata(buf);
        const img = await loadImageBitmap(f);
        const mime = detectImageMime(f) ?? "image/jpeg";
        clear();
        setFile(f);
        setLoaded(img);
        setScan(meta);
        setOutMime(mime === "image/webp" ? "image/webp" : mime);
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
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- unmount only
  }, []);

  const strip = useCallback(async () => {
    if (!loaded || !file) return;
    setBusy(true);
    setError(null);
    try {
      const canvas = drawImageToCanvas(loaded.bitmap, {
        width: loaded.width,
        height: loaded.height,
        background: outMime === "image/jpeg" ? "#ffffff" : undefined,
      });
      // Re-encode without copying source metadata — canvas export is clean.
      const blob = await canvasToBlob(
        canvas,
        outMime,
        outMime === "image/png" ? undefined : 0.92,
      );
      setResultBlob(blob);
      setResultUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return URL.createObjectURL(blob);
      });
      track({
        name: "tool_complete",
        tool: "exif-remover",
        family: "image",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not strip metadata.");
    } finally {
      setBusy(false);
    }
  }, [loaded, file, outMime]);

  useEffect(() => {
    if (!loaded) return;
    const t = window.setTimeout(() => {
      void strip();
    }, 80);
    return () => window.clearTimeout(t);
  }, [loaded, outMime, strip]);

  const download = () => {
    if (!resultBlob || !file) return;
    const base = changeExtension(file.name, mimeToExtension(outMime));
    const name = base.replace(/(\.[^.]+)$/, "-clean$1");
    downloadBlob(resultBlob, name);
  };

  const risk =
    scan && (scan.hasExif || scan.hasExtraMetadata)
      ? "Metadata detected — strip before sharing."
      : scan
        ? "No common metadata detected; re-encode still recommended."
        : null;

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
          Drop a photo to strip EXIF / metadata, or
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
          accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
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

      {scan ? (
        <div className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
          <p className="text-sm font-medium text-[var(--foreground)]">{risk}</p>
          <ul className="list-inside list-disc text-sm text-[var(--muted)]">
            {scan.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <p className="text-xs text-[var(--muted)]">
            Stripping re-draws pixels via Canvas and exports a new file without
            the original metadata containers. GPS and camera tags are removed.
          </p>
        </div>
      ) : null}

      {loaded ? (
        <>
          <label className="flex max-w-xs flex-col gap-1 text-sm text-[var(--muted)]">
            Output format
            <select
              value={outMime}
              onChange={(e) => {
                markStart();
                setOutMime(e.target.value as OutputImageFormat);
              }}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
            >
              <option value="image/jpeg">JPEG</option>
              <option value="image/png">PNG</option>
              <option value="image/webp">WebP</option>
            </select>
          </label>

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
                Clean preview
                {resultBlob ? ` · ${formatBytes(resultBlob.size)}` : ""}
                {busy ? " · working…" : ""}
              </p>
              {resultUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resultUrl}
                  alt="Clean"
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
            Download clean image
          </button>
        </>
      ) : null}
    </div>
  );
}
