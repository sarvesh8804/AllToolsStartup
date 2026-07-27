"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { CopyButton } from "@/components/editor/CopyButton";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  guessImageMime,
  imageBytesToBase64,
  isEncodableImageFile,
  selectImageBase64Output,
  type ImageBase64OutputFormat,
  type ImageToBase64Result,
} from "@/lib/image/to-base64";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

const FORMATS: { id: ImageBase64OutputFormat; label: string }[] = [
  { id: "data-url", label: "Data URL" },
  { id: "raw", label: "Raw Base64" },
  { id: "css", label: "CSS background" },
  { id: "html", label: "HTML <img>" },
];

export function ImageToBase64Tool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ImageToBase64Result | null>(null);
  const [format, setFormat] = useState<ImageBase64OutputFormat>("data-url");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [started, setStarted] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "image-to-base64",
        family: "image",
      });
    }
  }, [started]);

  const clearPreview = useCallback(() => {
    setPreviewUrl((url) => {
      if (url) URL.revokeObjectURL(url);
      return null;
    });
  }, []);

  const acceptFile = useCallback(
    async (file: File) => {
      markStart();
      if (!isEncodableImageFile(file)) {
        setError("Choose an image file (PNG, JPEG, WebP, GIF, BMP, or SVG).");
        return;
      }
      setBusy(true);
      setError(null);
      try {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const mime = guessImageMime(file);
        const next = imageBytesToBase64(bytes, mime, file.name);
        clearPreview();
        setFileName(file.name);
        setResult(next);
        setPreviewUrl(URL.createObjectURL(file));
        track({
          name: "tool_complete",
          tool: "image-to-base64",
          family: "image",
        });
      } catch {
        setResult(null);
        setFileName(null);
        clearPreview();
        setError("Could not read that image.");
      } finally {
        setBusy(false);
      }
    },
    [clearPreview, markStart],
  );

  const output = useMemo(
    () => (result ? selectImageBase64Output(result, format) : ""),
    [result, format],
  );

  return (
    <div className="space-y-5">
      <div
        className={cn(
          "rounded-xl border border-dashed px-4 py-10 text-center transition",
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
          Drop an image to encode as Base64 locally. Nothing is uploaded.
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-3 rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--ink)]"
        >
          {busy ? "Reading…" : "Choose image"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.svg"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void acceptFile(f);
            e.target.value = "";
          }}
        />
      </div>

      {error ? <ToolErrorState message={error} /> : null}

      {result && fileName ? (
        <>
          <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
            <span className="text-[var(--foreground)]">{fileName}</span>
            <span>
              {result.sizeLabel} · {result.mime}
            </span>
            <span>{result.charLength.toLocaleString()} Base64 chars</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {FORMATS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  markStart();
                  setFormat(f.id);
                }}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-sm",
                  format === f.id
                    ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--foreground)]"
                    : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/50",
                )}
              >
                {f.label}
              </button>
            ))}
            <CopyButton getText={() => output} label="Copy" />
          </div>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt={fileName}
                className="max-h-56 w-full rounded-xl border border-[var(--border)] object-contain bg-[var(--surface)]"
              />
            ) : null}
            <div>
              <EditorPaneHeader label="Output" getText={() => output} />
              <CodeEditor
                language="text"
                value={output}
                editable={false}
                minHeight="36vh"
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
