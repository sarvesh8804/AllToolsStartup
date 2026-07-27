"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { downloadBlob } from "@/lib/image/canvas";
import {
  formatBytes,
  isJpegFile,
  isPngFile,
  isRasterImageFile,
} from "@/lib/image/format";
import {
  imagesToPdf,
  type ImageBytesKind,
  type PdfImageInput,
} from "@/lib/pdf/images-to-pdf";
import {
  MAX_IMAGES_TO_PDF,
  PAGE_PRESETS,
  type PagePresetId,
} from "@/lib/pdf/page-fit";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

type QueueItem = {
  id: string;
  file: File;
  previewUrl: string;
  width: number;
  height: number;
};

async function fileToPdfImage(file: File): Promise<PdfImageInput> {
  if (isPngFile(file) || isJpegFile(file)) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const bitmap = await createImageBitmap(file);
    const input: PdfImageInput = {
      bytes,
      kind: isPngFile(file) ? "png" : "jpg",
      widthPx: bitmap.width,
      heightPx: bitmap.height,
    };
    bitmap.close();
    return input;
  }

  // WebP/GIF/BMP → PNG via canvas for pdf-lib
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Could not get canvas context.");
  }
  ctx.drawImage(bitmap, 0, 0);
  const widthPx = bitmap.width;
  const heightPx = bitmap.height;
  bitmap.close();

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("PNG encode failed."))),
      "image/png",
    );
  });
  return {
    bytes: new Uint8Array(await blob.arrayBuffer()),
    kind: "png" as ImageBytesKind,
    widthPx,
    heightPx,
  };
}

export function ImagesToPdfTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const prevRects = useRef<Map<string, DOMRect>>(new Map());
  const [items, setItems] = useState<QueueItem[]>([]);
  const [preset, setPreset] = useState<PagePresetId>("fit");
  const [margin, setMargin] = useState(36);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [started, setStarted] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [movingIds, setMovingIds] = useState<Set<string>>(new Set());

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "images-to-pdf", family: "pdf" });
    }
  }, [started]);

  const revokeAll = (list: QueueItem[]) => {
    for (const item of list) URL.revokeObjectURL(item.previewUrl);
  };

  const captureRects = () => {
    const list = listRef.current;
    if (!list) return;
    const map = new Map<string, DOMRect>();
    for (const el of list.querySelectorAll<HTMLElement>("[data-item-id]")) {
      const id = el.dataset.itemId;
      if (id) map.set(id, el.getBoundingClientRect());
    }
    prevRects.current = map;
  };

  useLayoutEffect(() => {
    const list = listRef.current;
    const previous = prevRects.current;
    if (!list || previous.size === 0) return;

    for (const el of list.querySelectorAll<HTMLElement>("[data-item-id]")) {
      const id = el.dataset.itemId;
      if (!id) continue;
      const prev = previous.get(id);
      if (!prev) continue;
      const next = el.getBoundingClientRect();
      const dy = prev.top - next.top;
      if (Math.abs(dy) < 1) continue;
      el.animate(
        [
          { transform: `translateY(${dy}px)`, offset: 0 },
          { transform: "translateY(0)", offset: 1 },
        ],
        {
          duration: 280,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "both",
        },
      );
    }
    prevRects.current = new Map();
  }, [items]);

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      markStart();
      const list = Array.from(files);
      const next: QueueItem[] = [];
      const errors: string[] = [];

      for (const file of list) {
        if (!isRasterImageFile(file)) {
          errors.push(`${file.name}: not a supported image.`);
          continue;
        }
        try {
          const bitmap = await createImageBitmap(file);
          next.push({
            id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
            file,
            previewUrl: URL.createObjectURL(file),
            width: bitmap.width,
            height: bitmap.height,
          });
          bitmap.close();
        } catch {
          errors.push(`${file.name}: could not read.`);
        }
      }

      setItems((prev) => {
        const merged = [...prev, ...next].slice(0, MAX_IMAGES_TO_PDF);
        if (prev.length + next.length > MAX_IMAGES_TO_PDF) {
          errors.push(`Limit is ${MAX_IMAGES_TO_PDF} images per PDF.`);
        }
        return merged;
      });
      setError(errors.length ? errors.join(" ") : null);
    },
    [markStart],
  );

  const removeAt = (id: string) => {
    if (previewId === id) setPreviewId(null);
    setItems((prev) => {
      const target = prev.find((p) => p.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.id !== id);
    });
  };

  const move = (id: string, dir: -1 | 1) => {
    const i = items.findIndex((p) => p.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= items.length) return;
    const neighbor = items[j]!;
    captureRects();
    setMovingIds(new Set([id, neighbor.id]));
    window.setTimeout(() => setMovingIds(new Set()), 300);
    setItems((prev) => {
      const from = prev.findIndex((p) => p.id === id);
      const to = from + dir;
      if (from < 0 || to < 0 || to >= prev.length) return prev;
      const copy = [...prev];
      const tmp = copy[from]!;
      copy[from] = copy[to]!;
      copy[to] = tmp;
      return copy;
    });
  };

  const clear = () => {
    setPreviewId(null);
    setItems((prev) => {
      revokeAll(prev);
      return [];
    });
    setError(null);
  };

  const previewItem = items.find((i) => i.id === previewId) ?? null;

  useEffect(() => {
    if (!previewItem) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPreviewId(null);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [previewItem]);

  const build = async () => {
    if (items.length === 0) {
      setError("Add at least one image.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const images: PdfImageInput[] = [];
      for (const item of items) {
        images.push(await fileToPdfImage(item.file));
      }
      const result = await imagesToPdf(images, {
        pagePreset: preset,
        margin,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      downloadBlob(
        new Blob([Uint8Array.from(result.pdf)], { type: "application/pdf" }),
        "forge-images.pdf",
      );
      track({
        name: "tool_complete",
        tool: "images-to-pdf",
        family: "pdf",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create PDF.");
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
          if (e.dataTransfer.files.length) void addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center transition-colors",
          dragOver
            ? "border-[var(--accent)] bg-[var(--accent)]/10"
            : "border-[var(--border)] bg-[var(--surface)]",
        )}
      >
        <p className="text-sm text-[var(--muted)]">
          Drop images here (PNG, JPEG, WebP…), or
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--ink)]"
        >
          Choose images
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/bmp,.png,.jpg,.jpeg,.webp,.gif,.bmp"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) void addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <p className="text-xs text-[var(--muted)]">
          Up to {MAX_IMAGES_TO_PDF} images · one page each · stays in your
          browser
        </p>
      </div>

      {error ? <ToolErrorState message={error} /> : null}

      {items.length > 0 ? (
        <>
          <div className="flex flex-wrap items-end gap-4">
            <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
              Page size
              <select
                value={preset}
                onChange={(e) => {
                  markStart();
                  setPreset(e.target.value as PagePresetId);
                }}
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
              >
                {PAGE_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            {preset !== "fit" ? (
              <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
                Margin ({margin} pt)
                <input
                  type="range"
                  min={0}
                  max={72}
                  value={margin}
                  onChange={(e) => {
                    markStart();
                    setMargin(Number(e.target.value));
                  }}
                />
              </label>
            ) : null}
            <button
              type="button"
              onClick={clear}
              className="rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)] hover:border-[var(--accent)]/50"
            >
              Clear all
            </button>
          </div>

          <ul ref={listRef} className="space-y-2">
            {items.map((item, index) => (
              <li
                key={item.id}
                data-item-id={item.id}
                className={cn(
                  "flex flex-wrap items-center gap-3 rounded-xl border bg-[var(--surface)] px-3 py-2 transition-[border-color,box-shadow] duration-300",
                  movingIds.has(item.id)
                    ? "border-[var(--accent)] shadow-[0_0_0_1px_var(--accent)]"
                    : "border-[var(--border)]",
                )}
              >
                <button
                  type="button"
                  onClick={() => setPreviewId(item.id)}
                  className="group relative shrink-0 overflow-hidden rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                  aria-label={`Preview ${item.file.name}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.previewUrl}
                    alt=""
                    className="h-14 w-14 object-cover transition duration-200 group-hover:scale-105"
                  />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[var(--ink)]/0 text-[10px] font-medium text-white opacity-0 transition group-hover:bg-[var(--ink)]/45 group-hover:opacity-100">
                    View
                  </span>
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-[var(--foreground)]">
                    {index + 1}. {item.file.name}
                  </p>
                  <p className="font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
                    {item.width}×{item.height} · {formatBytes(item.file.size)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    aria-label="Move up"
                    disabled={index === 0}
                    onClick={() => move(item.id, -1)}
                    className="rounded-md border border-[var(--border)] px-2 py-1 text-sm transition hover:border-[var(--accent)]/50 disabled:opacity-40"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label="Move down"
                    disabled={index === items.length - 1}
                    onClick={() => move(item.id, 1)}
                    className="rounded-md border border-[var(--border)] px-2 py-1 text-sm transition hover:border-[var(--accent)]/50 disabled:opacity-40"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewId(item.id)}
                    className="rounded-md border border-[var(--border)] px-2 py-1 text-sm text-[var(--foreground)] transition hover:border-[var(--accent)]/50"
                  >
                    Preview
                  </button>
                  <button
                    type="button"
                    aria-label="Remove"
                    onClick={() => removeAt(item.id)}
                    className="rounded-md border border-[var(--border)] px-2 py-1 text-sm text-[var(--muted)] transition hover:border-[var(--accent)]/50"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <button
            type="button"
            disabled={busy || items.length === 0}
            onClick={() => void build()}
            className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--ink)] disabled:opacity-50"
          >
            {busy
              ? "Building PDF…"
              : `Download PDF (${items.length} page${items.length === 1 ? "" : "s"})`}
          </button>
        </>
      ) : null}

      {previewItem ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Preview ${previewItem.file.name}`}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewId(null)}
        >
          <div
            className="absolute inset-0 bg-[var(--ink)]/55 backdrop-blur-[2px]"
            style={{ animation: "forge-fade-in 180ms ease-out" }}
            aria-hidden
          />
          <div
            className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl"
            style={{
              animation:
                "forge-scale-in 220ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[var(--foreground)]">
                  {previewItem.file.name}
                </p>
                <p className="font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
                  {previewItem.width}×{previewItem.height} ·{" "}
                  {formatBytes(previewItem.file.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewId(null)}
                className="shrink-0 rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] transition hover:border-[var(--accent)]/50 hover:text-[var(--foreground)]"
              >
                Close
              </button>
            </div>
            <div className="flex min-h-0 flex-1 items-center justify-center bg-[var(--background)] p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewItem.previewUrl}
                alt={previewItem.file.name}
                className="max-h-[70vh] max-w-full rounded-lg object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
