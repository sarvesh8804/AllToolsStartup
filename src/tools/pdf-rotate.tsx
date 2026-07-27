"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { downloadBlob } from "@/lib/image/canvas";
import { formatBytes } from "@/lib/image/format";
import { inspectPdf, isPdfFile } from "@/lib/pdf/merge";
import { parsePageRanges } from "@/lib/pdf/ranges";
import {
  ROTATE_OPTIONS,
  rotatePdf,
  type RotateDegrees,
} from "@/lib/pdf/rotate";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

type LoadedPdf = {
  file: File;
  bytes: Uint8Array;
  pageCount: number;
};

export function PdfRotateTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loaded, setLoaded] = useState<LoadedPdf | null>(null);
  const [degrees, setDegrees] = useState<RotateDegrees>(90);
  const [scope, setScope] = useState<"all" | "range">("all");
  const [rangeText, setRangeText] = useState("1-");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "pdf-rotate", family: "pdf" });
    }
  }, [started]);

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
          return;
        }
        setLoaded({ file, bytes, pageCount: info.pageCount });
        setRangeText(
          info.pageCount > 1 ? `1-${info.pageCount}` : "1",
        );
        setError(null);
        setStatus(null);
      } catch {
        setError("Could not read that PDF.");
      }
    },
    [markStart],
  );

  const clear = () => {
    setLoaded(null);
    setError(null);
    setStatus(null);
  };

  const run = async () => {
    if (!loaded) {
      setError("Choose a PDF first.");
      return;
    }
    setBusy(true);
    setError(null);
    setStatus("Rotating in your browser…");
    try {
      const result = await rotatePdf(loaded.bytes, {
        degrees,
        rangeText: scope === "all" ? "" : rangeText,
      });
      if (!result.ok) {
        setError(result.error);
        setStatus(null);
        return;
      }
      const outName =
        loaded.file.name.replace(/\.pdf$/i, "") + `-rotated-${degrees}.pdf`;
      downloadBlob(
        new Blob([Uint8Array.from(result.pdf)], { type: "application/pdf" }),
        outName,
      );
      setStatus(
        `Rotated ${result.rotatedPages.length} page${result.rotatedPages.length === 1 ? "" : "s"} by ${degrees}°.`,
      );
      track({ name: "tool_complete", tool: "pdf-rotate", family: "pdf" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Rotate failed.");
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
        <p className="text-sm text-[var(--muted)]">Drop a PDF to rotate, or</p>
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
          </p>
        ) : (
          <p className="text-xs text-[var(--muted)]">
            No upload · encrypted PDFs not supported
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
          <div>
            <p className="mb-2 text-sm text-[var(--muted)]">Rotation</p>
            <div className="flex flex-wrap gap-2">
              {ROTATE_OPTIONS.map((opt) => (
                <button
                  key={opt.degrees}
                  type="button"
                  onClick={() => {
                    markStart();
                    setDegrees(opt.degrees);
                  }}
                  className={
                    degrees === opt.degrees
                      ? "rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--ink)]"
                      : "rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] hover:border-[var(--accent)]/50"
                  }
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm text-[var(--muted)]">Pages</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  markStart();
                  setScope("all");
                }}
                className={
                  scope === "all"
                    ? "rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--ink)]"
                    : "rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] hover:border-[var(--accent)]/50"
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
                Selected pages
              </button>
              <button
                type="button"
                onClick={clear}
                className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] hover:border-[var(--accent)]/50"
              >
                Clear
              </button>
            </div>
          </div>

          {scope === "range" ? (
            <label className="flex max-w-md flex-col gap-1 text-sm text-[var(--muted)]">
              Page range (e.g. 1-3,5)
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
                  {rangePreview.pages.length === 1 ? "" : "s"} will rotate
                </span>
              ) : rangePreview && !rangePreview.ok ? (
                <span className="text-xs text-[var(--danger)]">
                  {rangePreview.error}
                </span>
              ) : null}
            </label>
          ) : null}

          <div className="flex items-center gap-4">
            <div
              className="flex h-20 w-16 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--background)] transition-transform duration-300"
              style={{ transform: `rotate(${degrees}deg)` }}
              aria-hidden
            >
              <span className="font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
                Aa
              </span>
            </div>
            <p className="text-sm text-[var(--muted)]">
              Preview of rotation direction (not a page thumbnail).
            </p>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={() => void run()}
            className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--ink)] disabled:opacity-50"
          >
            {busy ? "Rotating…" : `Download rotated PDF (${degrees}°)`}
          </button>

          <p className="sr-only" aria-live="polite">
            {status ?? ""}
          </p>
          {status ? (
            <p className="text-sm text-[var(--muted)]" role="status">
              {status}
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
