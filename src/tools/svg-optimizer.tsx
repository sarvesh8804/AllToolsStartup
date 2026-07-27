"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  DEFAULT_SVG_OPTIMIZE_OPTIONS,
  formatBytes,
  optimizeSvg,
} from "@/lib/format/svg-optimize";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

const SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
  <!-- Forge mark -->
  <rect x="12.0000" y="12.0000" width="96.0000" height="96.0000" rx="16.0000" fill="#243018"/>
  <circle cx="60.000" cy="60.000" r="28.000" fill="#c4a70a"/>
  <path d="M 40.00 80.00 L 60.00 40.00 L 80.00 80.00 Z" fill="#fff6b8" opacity="0.90"/>
</svg>
`;

export function SvgOptimizerTool() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState(SAMPLE);
  const [multipass, setMultipass] = useState(
    DEFAULT_SVG_OPTIMIZE_OPTIONS.multipass,
  );
  const [floatPrecision, setFloatPrecision] = useState(
    DEFAULT_SVG_OPTIMIZE_OPTIONS.floatPrecision,
  );
  const [pretty, setPretty] = useState(DEFAULT_SVG_OPTIMIZE_OPTIONS.pretty);
  const [keepViewBox, setKeepViewBox] = useState(
    DEFAULT_SVG_OPTIMIZE_OPTIONS.keepViewBox,
  );
  const [removeXmlns, setRemoveXmlns] = useState(
    DEFAULT_SVG_OPTIMIZE_OPTIONS.removeXmlns,
  );
  const [started, setStarted] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "svg-optimizer", family: "tools" });
    }
  }, [started]);

  const result = useMemo(
    () =>
      optimizeSvg(input, {
        multipass,
        floatPrecision,
        pretty,
        keepViewBox,
        removeXmlns,
      }),
    [input, multipass, floatPrecision, pretty, keepViewBox, removeXmlns],
  );

  const previewSvg = result.ok ? result.svg : input;
  const previewUrl = useMemo(
    () =>
      `data:image/svg+xml;charset=utf-8,${encodeURIComponent(previewSvg)}`,
    [previewSvg],
  );

  const onChange = useCallback(
    (v: string) => {
      markStart();
      setInput(v);
      setFileError(null);
      track({
        name: "tool_complete",
        tool: "svg-optimizer",
        family: "tools",
      });
    },
    [markStart],
  );

  const acceptFile = async (file: File) => {
    markStart();
    setFileError(null);
    const isSvg =
      file.type === "image/svg+xml" ||
      file.name.toLowerCase().endsWith(".svg") ||
      file.type === "text/plain" ||
      file.type === "";
    if (!isSvg) {
      setFileError("Choose an .svg file.");
      return;
    }
    try {
      const text = await file.text();
      setInput(text);
      track({
        name: "tool_complete",
        tool: "svg-optimizer",
        family: "tools",
      });
    } catch {
      setFileError("Failed to read file.");
    }
  };

  const downloadOptimized = () => {
    if (!result.ok) return;
    markStart();
    const blob = new Blob([result.svg], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "optimized.svg";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "rounded-xl border border-dashed px-4 py-4 text-center transition",
          dragOver
            ? "border-[var(--accent)] bg-[var(--accent)]/10"
            : "border-[var(--border)] bg-[var(--surface)]",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) void acceptFile(f);
        }}
      >
        <p className="text-sm text-[var(--muted)]">
          Drop an .svg file here, or paste markup below. Optimization uses SVGO
          in your browser.
        </p>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="mt-2 rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]/50"
        >
          Choose SVG file
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".svg,image/svg+xml"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void acceptFile(f);
            e.target.value = "";
          }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Float precision
          <input
            type="number"
            min={0}
            max={8}
            value={floatPrecision}
            onChange={(e) => {
              markStart();
              setFloatPrecision(Number(e.target.value));
            }}
            className="w-20 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--foreground)]"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={multipass}
            onChange={(e) => {
              markStart();
              setMultipass(e.target.checked);
            }}
          />
          Multipass
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={pretty}
            onChange={(e) => {
              markStart();
              setPretty(e.target.checked);
            }}
          />
          Pretty print
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={keepViewBox}
            onChange={(e) => {
              markStart();
              setKeepViewBox(e.target.checked);
            }}
          />
          Keep viewBox
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={removeXmlns}
            onChange={(e) => {
              markStart();
              setRemoveXmlns(e.target.checked);
            }}
          />
          Remove xmlns
        </label>
        {result.ok ? (
          <p className="text-sm text-[var(--muted)]">
            {formatBytes(result.originalBytes)} →{" "}
            {formatBytes(result.optimizedBytes)}
            {result.savedPercent > 0
              ? ` (−${result.savedPercent}%)`
              : ""}
          </p>
        ) : null}
        <button
          type="button"
          disabled={!result.ok}
          onClick={downloadOptimized}
          className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--ink)] disabled:opacity-40"
        >
          Download SVG
        </button>
      </div>

      {fileError ? <ToolErrorState message={fileError} /> : null}
      {!result.ok ? <ToolErrorState message={result.error} /> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="Input SVG" getText={() => input} />
          <CodeEditor
            language="text"
            value={input}
            onChange={onChange}
            minHeight="45vh"
          />
        </div>
        <div>
          <EditorPaneHeader
            label="Optimized"
            getText={() => (result.ok ? result.svg : "")}
          />
          <CodeEditor
            language="text"
            value={result.ok ? result.svg : ""}
            editable={false}
            minHeight="45vh"
          />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm text-[var(--muted)]">Preview</p>
        <div className="flex min-h-[180px] items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="SVG preview"
            className="max-h-48 max-w-full"
          />
        </div>
      </div>
    </div>
  );
}
