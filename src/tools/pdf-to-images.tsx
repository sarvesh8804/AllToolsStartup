"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { downloadBlob } from "@/lib/image/canvas";
import { formatBytes } from "@/lib/image/format";
import { inspectPdf, isPdfFile } from "@/lib/pdf/merge";
import { parsePageRanges } from "@/lib/pdf/ranges";
import {
  pdfToImages,
  type RenderedPageImage,
} from "@/lib/pdf/render-pages";
import {
  MAX_PDF_TO_IMAGE_PAGES,
  RENDER_DPI_PRESETS,
  type ImageOutputFormat,
} from "@/lib/pdf/to-images";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

type LoadedPdf = {
  file: File;
  bytes: Uint8Array;
  pageCount: number;
};

export function PdfToImagesTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loaded, setLoaded] = useState<LoadedPdf | null>(null);
  const [dpi, setDpi] = useState(144);
  const [format, setFormat] = useState<ImageOutputFormat>("image/png");
  const [quality, setQuality] = useState(92);
  const [scope, setScope] = useState<"all" | "range">("all");
  const [rangeText, setRangeText] = useState("1-");
  const [images, setImages] = useState<RenderedPageImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "pdf-to-images", family: "pdf" });
    }
  }, [started]);

  const revokeImages = useCallback((list: RenderedPageImage[]) => {
    for (const img of list) URL.revokeObjectURL(img.url);
  }, []);

  useEffect(() => {
    return () => {
      revokeImages(images);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- unmount only
  }, []);

  const rangePreview = useMemo(() => {
    if (!loaded || scope !== "range") return null;
    return parsePageRanges(rangeText, loaded.pageCount);
  }, [loaded, scope, rangeText]);

  const acceptFile = useCallback(
    async (file: File) => {
      markStart();
      if (!isPdfFile(file)) {
        setError("Choose a PDF file.");
        return;
      }
      try {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const info = await inspectPdf(bytes);
        if (!info.ok) {
          setError(info.error);
          setLoaded(null);
          setImages((prev) => {
            revokeImages(prev);
            return [];
          });
          return;
        }
        if (info.pageCount > MAX_PDF_TO_IMAGE_PAGES && scope === "all") {
          setScope("range");
          setRangeText(`1-${Math.min(info.pageCount, MAX_PDF_TO_IMAGE_PAGES)}`);
        } else {
          setRangeText(
            info.pageCount > 1 ? `1-${info.pageCount}` : "1",
          );
        }
        setLoaded({ file, bytes, pageCount: info.pageCount });
        setImages((prev) => {
          revokeImages(prev);
          return [];
        });
        setError(null);
        setProgress(null);
      } catch {
        setError("Could not read that PDF.");
      }
    },
    [markStart, revokeImages, scope],
  );

  const clear = () => {
    setLoaded(null);
    setImages((prev) => {
      revokeImages(prev);
      return [];
    });
    setError(null);
    setProgress(null);
  };

  const convert = async () => {
    if (!loaded) {
      setError("Choose a PDF first.");
      return;
    }
    setBusy(true);
    setError(null);
    setProgress("Loading PDF engine…");
    try {
      const base = loaded.file.name.replace(/\.pdf$/i, "") || "page";
      const result = await pdfToImages(loaded.bytes, {
        dpi,
        format,
        quality: quality / 100,
        rangeText: scope === "all" ? undefined : rangeText,
        basename: base,
        onProgress: (done, total) => {
          setProgress(`Rendering page ${done} of ${total}…`);
        },
      });
      if (!result.ok) {
        setError(result.error);
        setProgress(null);
        return;
      }
      setImages((prev) => {
        revokeImages(prev);
        return result.images;
      });
      setProgress(
        `Done — ${result.images.length} image${result.images.length === 1 ? "" : "s"}.`,
      );
      track({
        name: "tool_complete",
        tool: "pdf-to-images",
        family: "pdf",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed.");
      setProgress(null);
    } finally {
      setBusy(false);
    }
  };

  const downloadOne = (img: RenderedPageImage) => {
    downloadBlob(img.blob, img.filename);
  };

  const downloadAll = async () => {
    for (let i = 0; i < images.length; i++) {
      downloadOne(images[i]!);
      if (i < images.length - 1) {
        await new Promise((r) => setTimeout(r, 200));
      }
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
          Drop a PDF to convert pages to images, or
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--ink)]"
        >
          Choose PDF
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void acceptFile(f);
            e.target.value = "";
          }}
        />
        {loaded ? (
          <p className="font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
            {loaded.file.name} · {loaded.pageCount} page
            {loaded.pageCount === 1 ? "" : "s"} ·{" "}
            {formatBytes(loaded.file.size)}
            {loaded.pageCount > MAX_PDF_TO_IMAGE_PAGES
              ? ` · select ≤${MAX_PDF_TO_IMAGE_PAGES} pages`
              : ""}
          </p>
        ) : (
          <p className="text-xs text-[var(--muted)]">
            Renders locally with PDF.js · max {MAX_PDF_TO_IMAGE_PAGES} pages per
            run
          </p>
        )}
      </div>

      {error ? (
        <div role="alert">
          <ToolErrorState message={error} />
        </div>
      ) : null}

      {loaded ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
              Resolution
              <select
                value={dpi}
                onChange={(e) => {
                  markStart();
                  setDpi(Number(e.target.value));
                }}
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
              >
                {RENDER_DPI_PRESETS.map((p) => (
                  <option key={p.id} value={p.dpi}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
              Format
              <select
                value={format}
                onChange={(e) => {
                  markStart();
                  setFormat(e.target.value as ImageOutputFormat);
                }}
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
              >
                <option value="image/png">PNG</option>
                <option value="image/jpeg">JPEG</option>
              </select>
            </label>
          </div>

          {format === "image/jpeg" ? (
            <label className="flex max-w-md flex-col gap-1 text-sm text-[var(--muted)]">
              JPEG quality ({quality}%)
              <input
                type="range"
                min={40}
                max={100}
                value={quality}
                onChange={(e) => {
                  markStart();
                  setQuality(Number(e.target.value));
                }}
              />
            </label>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={loaded.pageCount > MAX_PDF_TO_IMAGE_PAGES}
              onClick={() => {
                markStart();
                setScope("all");
              }}
              className={
                scope === "all"
                  ? "rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--ink)] disabled:opacity-40"
                  : "rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] hover:border-[var(--accent)]/50 disabled:opacity-40"
              }
            >
              All pages
            </button>
            <button
              type="button"
              onClick={() => {
                markStart();
                setScope("range");
              }}
              className={
                scope === "range"
                  ? "rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--ink)]"
                  : "rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] hover:border-[var(--accent)]/50"
              }
            >
              Page range
            </button>
            <button
              type="button"
              onClick={clear}
              className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] hover:border-[var(--accent)]/50"
            >
              Clear
            </button>
          </div>

          {scope === "range" ? (
            <label className="flex max-w-md flex-col gap-1 text-sm text-[var(--muted)]">
              Pages (e.g. 1-3,5)
              <input
                value={rangeText}
                onChange={(e) => {
                  markStart();
                  setRangeText(e.target.value);
                }}
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
                spellCheck={false}
              />
              {rangePreview?.ok ? (
                <span className="text-xs">
                  {rangePreview.pages.length} page
                  {rangePreview.pages.length === 1 ? "" : "s"}
                  {rangePreview.pages.length > MAX_PDF_TO_IMAGE_PAGES
                    ? ` (over limit of ${MAX_PDF_TO_IMAGE_PAGES})`
                    : ""}
                </span>
              ) : rangePreview && !rangePreview.ok ? (
                <span className="text-xs text-[var(--danger)]">
                  {rangePreview.error}
                </span>
              ) : null}
            </label>
          ) : null}

          <button
            type="button"
            disabled={busy}
            onClick={() => void convert()}
            className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--ink)] disabled:opacity-50"
          >
            {busy ? "Converting…" : "Convert to images"}
          </button>

          <p className="sr-only" aria-live="polite">
            {progress ?? ""}
          </p>
          {progress ? (
            <p className="text-sm text-[var(--muted)]" role="status">
              {progress}
            </p>
          ) : null}

          {images.length > 0 ? (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => void downloadAll()}
                className="rounded-md border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground)] transition hover:border-[var(--accent)]/50"
              >
                Download all ({images.length})
              </button>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {images.map((img) => (
                  <li
                    key={img.filename}
                    className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={`Page ${img.page}`}
                      className="max-h-56 w-full object-contain bg-[var(--background)]"
                    />
                    <div className="flex items-center justify-between gap-2 px-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm text-[var(--foreground)]">
                          Page {img.page}
                        </p>
                        <p className="font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
                          {img.width}×{img.height} ·{" "}
                          {formatBytes(img.blob.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => downloadOne(img)}
                        className="shrink-0 rounded-md bg-[var(--accent)] px-2.5 py-1.5 text-xs font-medium text-[var(--ink)]"
                      >
                        Download
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
