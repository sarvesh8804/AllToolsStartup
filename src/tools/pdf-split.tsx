"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { downloadBlob } from "@/lib/image/canvas";
import { formatBytes } from "@/lib/image/format";
import { inspectPdf, isPdfFile } from "@/lib/pdf/merge";
import { parsePageRanges, type SplitMode } from "@/lib/pdf/ranges";
import { splitPdf, type SplitPart } from "@/lib/pdf/split";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

type LoadedPdf = {
  file: File;
  bytes: Uint8Array;
  pageCount: number;
};

const MODES: { id: SplitMode; label: string; hint: string }[] = [
  {
    id: "range",
    label: "Extract pages",
    hint: "One PDF from selected pages",
  },
  {
    id: "every-page",
    label: "Every page",
    hint: "One PDF per page",
  },
  {
    id: "chunk",
    label: "Fixed chunks",
    hint: "Split into groups of N pages",
  },
];

export function PdfSplitTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loaded, setLoaded] = useState<LoadedPdf | null>(null);
  const [mode, setMode] = useState<SplitMode>("range");
  const [rangeText, setRangeText] = useState("1-");
  const [chunkSize, setChunkSize] = useState("2");
  const [parts, setParts] = useState<SplitPart[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "pdf-split", family: "pdf" });
    }
  }, [started]);

  const rangePreview = useMemo(() => {
    if (!loaded || mode !== "range") return null;
    return parsePageRanges(rangeText, loaded.pageCount);
  }, [loaded, mode, rangeText]);

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
          setParts([]);
          return;
        }
        setLoaded({ file, bytes, pageCount: info.pageCount });
        setRangeText(info.pageCount > 1 ? `1-${info.pageCount}` : "1");
        setParts([]);
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
    setParts([]);
    setError(null);
    setStatus(null);
  };

  const runSplit = async () => {
    if (!loaded) {
      setError("Choose a PDF first.");
      return;
    }
    setBusy(true);
    setError(null);
    setStatus("Splitting in your browser…");
    try {
      const base = loaded.file.name.replace(/\.pdf$/i, "") || "forge-split";
      const result = await splitPdf(loaded.bytes, {
        mode,
        rangeText,
        chunkSize: Number(chunkSize),
        basename: base,
      });
      if (!result.ok) {
        setError(result.error);
        setParts([]);
        setStatus(null);
        return;
      }
      setParts(result.parts);
      setStatus(
        `Ready: ${result.parts.length} file${result.parts.length === 1 ? "" : "s"} from ${result.sourcePageCount} pages.`,
      );
      track({ name: "tool_complete", tool: "pdf-split", family: "pdf" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Split failed.");
      setStatus(null);
    } finally {
      setBusy(false);
    }
  };

  const downloadPart = (part: SplitPart) => {
    downloadBlob(
      new Blob([Uint8Array.from(part.bytes)], { type: "application/pdf" }),
      part.filename,
    );
  };

  const downloadAll = async () => {
    for (let i = 0; i < parts.length; i++) {
      downloadPart(parts[i]!);
      // Brief gap so browsers don't collapse multi-downloads
      if (i < parts.length - 1) {
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
        <p className="text-sm text-[var(--muted)]">Drop a PDF to split, or</p>
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
          <div className="flex flex-wrap gap-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  markStart();
                  setMode(m.id);
                  setParts([]);
                  setStatus(null);
                }}
                className={
                  mode === m.id
                    ? "rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--ink)]"
                    : "rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] hover:border-[var(--accent)]/50"
                }
                title={m.hint}
              >
                {m.label}
              </button>
            ))}
            <button
              type="button"
              onClick={clear}
              className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] hover:border-[var(--accent)]/50"
            >
              Clear
            </button>
          </div>

          {mode === "range" ? (
            <label className="flex max-w-md flex-col gap-1 text-sm text-[var(--muted)]">
              Pages (e.g. 1-3,5,8-)
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
                  {rangePreview.pages.length === 1 ? "" : "s"} selected
                </span>
              ) : rangePreview && !rangePreview.ok ? (
                <span className="text-xs text-[var(--danger)]">
                  {rangePreview.error}
                </span>
              ) : null}
            </label>
          ) : null}

          {mode === "chunk" ? (
            <label className="flex max-w-[12rem] flex-col gap-1 text-sm text-[var(--muted)]">
              Pages per file
              <input
                type="number"
                min={1}
                max={500}
                value={chunkSize}
                onChange={(e) => {
                  markStart();
                  setChunkSize(e.target.value);
                }}
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
              />
            </label>
          ) : null}

          {mode === "every-page" ? (
            <p className="text-sm text-[var(--muted)]">
              Creates {loaded.pageCount} separate PDF
              {loaded.pageCount === 1 ? "" : "s"} (one page each).
            </p>
          ) : null}

          <button
            type="button"
            disabled={busy}
            onClick={() => void runSplit()}
            className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--ink)] disabled:opacity-50"
          >
            {busy ? "Splitting…" : "Split PDF"}
          </button>

          <p className="sr-only" aria-live="polite">
            {status ?? ""}
          </p>
          {status ? (
            <p className="text-sm text-[var(--muted)]" role="status">
              {status}
            </p>
          ) : null}

          {parts.length > 0 ? (
            <div className="space-y-3">
              {parts.length > 1 ? (
                <button
                  type="button"
                  onClick={() => void downloadAll()}
                  className="rounded-md border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground)] transition hover:border-[var(--accent)]/50"
                >
                  Download all ({parts.length})
                </button>
              ) : null}
              <ul className="space-y-2">
                {parts.map((part) => (
                  <li
                    key={part.filename}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm text-[var(--foreground)]">
                        {part.filename}
                      </p>
                      <p className="font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
                        pages {part.pages[0]}
                        {part.pages.length > 1
                          ? `–${part.pages[part.pages.length - 1]}`
                          : ""}{" "}
                        · {part.pageCount} page
                        {part.pageCount === 1 ? "" : "s"} ·{" "}
                        {formatBytes(part.bytes.length)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadPart(part)}
                      className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--ink)]"
                    >
                      Download
                    </button>
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
