"use client";

import { useCallback, useMemo, useState } from "react";
import { CopyButton } from "@/components/editor/CopyButton";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  buildPlaceholderSvg,
  DEFAULT_PLACEHOLDER,
  placeholderSvgToDataUrl,
  PLACEHOLDER_MAX,
  PLACEHOLDER_MIN,
} from "@/lib/image/placeholder";
import {
  canvasToBlob,
  downloadBlob,
  drawImageToCanvas,
} from "@/lib/image/canvas";
import { track } from "@/lib/analytics";

async function downloadPlaceholderPng(
  svg: string,
  width: number,
  height: number,
  filename: string,
) {
  const img = new Image();
  const url = placeholderSvgToDataUrl(svg);
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to render placeholder."));
    img.src = url;
  });
  const canvas = drawImageToCanvas(img, { width, height });
  const blob = await canvasToBlob(canvas, "image/png");
  downloadBlob(blob, filename);
}

export function LoremPicsumAlternativePlaceholderTool() {
  const [width, setWidth] = useState<number>(DEFAULT_PLACEHOLDER.width);
  const [height, setHeight] = useState<number>(DEFAULT_PLACEHOLDER.height);
  const [seed, setSeed] = useState<number>(DEFAULT_PLACEHOLDER.seed);
  const [customText, setCustomText] = useState("");
  const [showDimensions, setShowDimensions] = useState(true);
  const [started, setStarted] = useState(false);
  const [busy, setBusy] = useState(false);

  const result = useMemo(
    () =>
      buildPlaceholderSvg({
        width,
        height,
        seed,
        text: customText || undefined,
        showDimensions,
      }),
    [width, height, seed, customText, showDimensions],
  );

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "lorem-picsum-alternative-placeholder",
        family: "tools",
      });
    }
  }, [started]);

  const touch = useCallback(() => {
    markStart();
    track({
      name: "tool_complete",
      tool: "lorem-picsum-alternative-placeholder",
      family: "tools",
    });
  }, [markStart]);

  const previewUrl = useMemo(() => {
    if (!result.ok) return null;
    return placeholderSvgToDataUrl(result.svg);
  }, [result]);

  const downloadSvg = useCallback(() => {
    if (!result.ok) return;
    touch();
    downloadBlob(
      new Blob([result.svg], { type: "image/svg+xml;charset=utf-8" }),
      `placeholder-${result.width}x${result.height}.svg`,
    );
  }, [result, touch]);

  const downloadPng = useCallback(async () => {
    if (!result.ok) return;
    touch();
    setBusy(true);
    try {
      await downloadPlaceholderPng(
        result.svg,
        result.width,
        result.height,
        `placeholder-${result.width}x${result.height}.png`,
      );
    } finally {
      setBusy(false);
    }
  }, [result, touch]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Width
          <input
            type="number"
            min={PLACEHOLDER_MIN}
            max={PLACEHOLDER_MAX}
            value={width}
            onChange={(e) => {
              touch();
              setWidth(Number(e.target.value));
            }}
            className="w-28 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[var(--foreground)]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Height
          <input
            type="number"
            min={PLACEHOLDER_MIN}
            max={PLACEHOLDER_MAX}
            value={height}
            onChange={(e) => {
              touch();
              setHeight(Number(e.target.value));
            }}
            className="w-28 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[var(--foreground)]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Color seed
          <input
            type="number"
            value={seed}
            onChange={(e) => {
              touch();
              setSeed(Number(e.target.value));
            }}
            className="w-28 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[var(--foreground)]"
          />
        </label>
        <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-sm text-[var(--muted)]">
          Custom label (optional)
          <input
            value={customText}
            onChange={(e) => {
              touch();
              setCustomText(e.target.value);
            }}
            placeholder="Hero banner"
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
          />
        </label>
        <label className="flex items-center gap-2 pb-2 text-sm text-[var(--muted)]">
          <input
            type="checkbox"
            checked={showDimensions}
            onChange={(e) => {
              touch();
              setShowDimensions(e.target.checked);
            }}
            className="rounded border-[var(--border)]"
          />
          Show dimensions
        </label>
      </div>

      {!result.ok ? (
        <ToolErrorState message={result.error} />
      ) : (
        <>
          <div className="flex flex-wrap items-start gap-6">
            <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt={result.label}
                  className="max-h-64 max-w-full object-contain"
                />
              ) : null}
            </div>
            <div className="flex flex-wrap gap-2">
              <CopyButton getText={() => result.svg} label="Copy SVG" />
              <button
                type="button"
                onClick={downloadSvg}
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--foreground)] hover:bg-[var(--surface-hover)]"
              >
                Download SVG
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => void downloadPng()}
                className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--accent-bright)] disabled:opacity-60"
              >
                {busy ? "Encoding…" : "Download PNG"}
              </button>
            </div>
          </div>

          <div>
            <EditorPaneHeader label="SVG markup" />
            <CodeEditor
              value={result.svg}
              language="text"
              editable={false}
              minHeight="200px"
            />
          </div>
        </>
      )}

      <p className="text-xs text-[var(--muted)]">
        Local placeholder images for mocks and layouts — no requests to picsum.photos
        or other external services. Gradient colors follow the seed value.
      </p>
    </div>
  );
}
