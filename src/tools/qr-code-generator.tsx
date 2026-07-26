"use client";

import { useCallback, useEffect, useState } from "react";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  DEFAULT_QR_OPTIONS,
  ERROR_LEVELS,
  generateQrDataUrl,
  generateQrSvg,
  type QrErrorCorrection,
  type QrOptions,
} from "@/lib/qr/generate";
import { track } from "@/lib/analytics";

const SAMPLE = "https://forge.tools";

export function QrCodeGeneratorTool() {
  const [text, setText] = useState(SAMPLE);
  const [errorCorrection, setErrorCorrection] =
    useState<QrErrorCorrection>("M");
  const [size, setSize] = useState(280);
  const [dataUrl, setDataUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const options: QrOptions = {
    ...DEFAULT_QR_OPTIONS,
    errorCorrection,
    size,
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const url = await generateQrDataUrl(text, options);
        if (!cancelled) {
          setDataUrl(url);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) {
          setDataUrl("");
          setError(e instanceof Error ? e.message : "Failed to generate QR");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- regenerate when inputs change
  }, [text, errorCorrection, size]);

  const onChange = useCallback(
    (v: string) => {
      if (!started) {
        setStarted(true);
        track({
          name: "tool_start",
          tool: "qr-code-generator",
          family: "tools",
        });
      }
      setText(v);
    },
    [started],
  );

  const downloadPng = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = "forge-qr.png";
    a.click();
    track({
      name: "tool_complete",
      tool: "qr-code-generator",
      family: "tools",
    });
  };

  const downloadSvg = async () => {
    try {
      const svg = await generateQrSvg(text, options);
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "forge-qr.svg";
      a.click();
      URL.revokeObjectURL(url);
      track({
        name: "tool_complete",
        tool: "qr-code-generator",
        family: "tools",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to export SVG");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Error correction
          <select
            value={errorCorrection}
            onChange={(e) =>
              setErrorCorrection(e.target.value as QrErrorCorrection)
            }
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--foreground)]"
          >
            {ERROR_LEVELS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Size ({size}px)
          <input
            type="range"
            min={128}
            max={512}
            step={8}
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-40 accent-[var(--accent)]"
          />
        </label>

        <button
          type="button"
          onClick={downloadPng}
          disabled={!dataUrl}
          className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--accent-bright)] disabled:opacity-50"
        >
          Download PNG
        </button>
        <button
          type="button"
          onClick={downloadSvg}
          className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]/50"
        >
          Download SVG
        </button>
      </div>

      {error ? <ToolErrorState message={error} /> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="Content" getText={() => text} />
          <CodeEditor
            language="text"
            value={text}
            onChange={onChange}
            minHeight="45vh"
          />
        </div>
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
            Preview
          </p>
          <div className="flex min-h-[45vh] items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
            {dataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={dataUrl}
                alt="Generated QR code"
                width={size}
                height={size}
                className="max-w-full"
              />
            ) : (
              <p className="text-sm text-[var(--muted)]">Generating…</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
