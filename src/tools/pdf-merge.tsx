"use client";

import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { downloadBlob } from "@/lib/image/canvas";
import { formatBytes } from "@/lib/image/format";
import {
  inspectPdf,
  isPdfFile,
  MAX_PDF_MERGE_FILES,
  mergePdfs,
  totalBytesWarning,
} from "@/lib/pdf/merge";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

type QueueItem = {
  id: string;
  file: File;
  bytes: Uint8Array;
  pageCount: number;
};

export function PdfMergeTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const prevRects = useRef<Map<string, DOMRect>>(new Map());
  const [items, setItems] = useState<QueueItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [movingIds, setMovingIds] = useState<Set<string>>(new Set());

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "pdf-merge", family: "pdf" });
    }
  }, [started]);

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
          { transform: `translateY(${dy}px)` },
          { transform: "translateY(0)" },
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

  const totalBytes = useMemo(
    () => items.reduce((sum, i) => sum + i.bytes.length, 0),
    [items],
  );
  const totalPages = useMemo(
    () => items.reduce((sum, i) => sum + i.pageCount, 0),
    [items],
  );
  const sizeWarn = totalBytesWarning(totalBytes);

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      markStart();
      const list = Array.from(files);
      const next: QueueItem[] = [];
      const errors: string[] = [];

      for (const file of list) {
        if (!isPdfFile(file)) {
          errors.push(`${file.name}: not a PDF.`);
          continue;
        }
        try {
          const bytes = new Uint8Array(await file.arrayBuffer());
          const info = await inspectPdf(bytes);
          if (!info.ok) {
            errors.push(`${file.name}: ${info.error}`);
            continue;
          }
          next.push({
            id: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
            file,
            bytes,
            pageCount: info.pageCount,
          });
        } catch {
          errors.push(`${file.name}: could not read.`);
        }
      }

      setItems((prev) => {
        const merged = [...prev, ...next].slice(0, MAX_PDF_MERGE_FILES);
        if (prev.length + next.length > MAX_PDF_MERGE_FILES) {
          errors.push(`Limit is ${MAX_PDF_MERGE_FILES} PDFs per merge.`);
        }
        return merged;
      });
      setError(errors.length ? errors.join(" ") : null);
    },
    [markStart],
  );

  const removeAt = (id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
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
    setItems([]);
    setError(null);
    setStatus(null);
  };

  const merge = async () => {
    if (items.length < 2) {
      setError("Add at least two PDFs to merge.");
      return;
    }
    setBusy(true);
    setError(null);
    setStatus("Merging in your browser…");
    try {
      const result = await mergePdfs(
        items.map((item) => ({
          bytes: item.bytes,
          label: item.file.name,
        })),
      );
      if (!result.ok) {
        setError(result.error);
        setStatus(null);
        return;
      }
      downloadBlob(
        new Blob([Uint8Array.from(result.pdf)], { type: "application/pdf" }),
        "forge-merged.pdf",
      );
      setStatus(
        `Merged ${result.fileCount} files · ${result.pageCount} pages.`,
      );
      track({ name: "tool_complete", tool: "pdf-merge", family: "pdf" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Merge failed.");
      setStatus(null);
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
          Drop PDF files here to combine them, or
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--ink)]"
        >
          Choose PDFs
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) void addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <p className="text-xs text-[var(--muted)]">
          Up to {MAX_PDF_MERGE_FILES} files · no upload · encrypted PDFs not
          supported
        </p>
      </div>

      {error ? (
        <div role="alert">
          <ToolErrorState message={error} />
        </div>
      ) : null}

      {sizeWarn ? (
        <p className="text-sm text-[var(--muted)]" role="status">
          {sizeWarn}
        </p>
      ) : null}

      <p className="sr-only" aria-live="polite">
        {status ?? ""}
      </p>

      {items.length > 0 ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-[family-name:var(--font-mono)] text-sm text-[var(--muted)]">
              {items.length} file{items.length === 1 ? "" : "s"} · {totalPages}{" "}
              page{totalPages === 1 ? "" : "s"} · {formatBytes(totalBytes)}
            </p>
            <button
              type="button"
              onClick={clear}
              className="rounded-md border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)] transition hover:border-[var(--accent)]/50"
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
                <div
                  className="flex h-14 w-11 shrink-0 flex-col items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] font-[family-name:var(--font-mono)] text-[10px] text-[var(--muted)]"
                  aria-hidden
                >
                  PDF
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-[var(--foreground)]">
                    {index + 1}. {item.file.name}
                  </p>
                  <p className="font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
                    {item.pageCount} page{item.pageCount === 1 ? "" : "s"} ·{" "}
                    {formatBytes(item.file.size)}
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

          {status && !busy ? (
            <p className="text-sm text-[var(--muted)]" role="status">
              {status}
            </p>
          ) : null}

          <button
            type="button"
            disabled={busy || items.length < 2}
            onClick={() => void merge()}
            className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--ink)] disabled:opacity-50"
          >
            {busy
              ? "Merging…"
              : items.length < 2
                ? "Add at least 2 PDFs"
                : `Merge ${items.length} PDFs`}
          </button>
        </>
      ) : null}
    </div>
  );
}
