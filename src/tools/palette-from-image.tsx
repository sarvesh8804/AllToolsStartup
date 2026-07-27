"use client";

import { useCallback, useRef, useState } from "react";
import { CopyButton } from "@/components/editor/CopyButton";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  extractPaletteFromImageData,
  formatPaletteCss,
  type PaletteColor,
} from "@/lib/color/palette-from-image";
import {
  drawImageToCanvas,
  loadImageBitmap,
  type LoadedImage,
} from "@/lib/image/canvas";
import { isRasterImageFile } from "@/lib/image/format";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

const MAX_ANALYSIS_SIDE = 200;

export function PaletteFromImageTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loaded, setLoaded] = useState<LoadedImage | null>(null);
  const [palette, setPalette] = useState<PaletteColor[]>([]);
  const [maxColors, setMaxColors] = useState(6);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [started, setStarted] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "palette-from-image",
        family: "tools",
      });
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
    setPalette([]);
    setError(null);
  }, []);

  const analyze = useCallback(
    (img: LoadedImage, colors: number) => {
      const scale = Math.min(
        1,
        MAX_ANALYSIS_SIDE / Math.max(img.width, img.height),
      );
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = drawImageToCanvas(img.bitmap, { width: w, height: h });
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas 2D context.");
      const imageData = ctx.getImageData(0, 0, w, h);
      return extractPaletteFromImageData(imageData, {
        maxColors: colors,
        sampleStep: 1,
      });
    },
    [],
  );

  const acceptFile = useCallback(
    async (f: File) => {
      markStart();
      if (!isRasterImageFile(f)) {
        setError("Choose a PNG, JPEG, WebP, GIF, or BMP image.");
        return;
      }
      setBusy(true);
      setError(null);
      try {
        const img = await loadImageBitmap(f);
        clear();
        setLoaded(img);
        setPreviewUrl(URL.createObjectURL(f));
        const colors = analyze(img, maxColors);
        setPalette(colors);
        track({
          name: "tool_complete",
          tool: "palette-from-image",
          family: "tools",
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to read image.");
      } finally {
        setBusy(false);
      }
    },
    [analyze, clear, markStart, maxColors],
  );

  const reanalyze = (colors: number) => {
    setMaxColors(colors);
    if (!loaded) return;
    markStart();
    try {
      setPalette(analyze(loaded, colors));
      track({
        name: "tool_complete",
        tool: "palette-from-image",
        family: "tools",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to extract palette.");
    }
  };

  const cssBlock = formatPaletteCss(palette);
  const hexList = palette.map((c) => c.hex).join("\n");

  const copyHex = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopiedHex(hex);
      window.setTimeout(() => setCopiedHex(null), 1200);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-5">
      {error ? <ToolErrorState message={error} /> : null}

      <div
        className={cn(
          "rounded-xl border border-dashed px-4 py-8 text-center transition",
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
          Drop an image here, or choose a file. Extraction runs locally in your
          browser.
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--ink)]"
          >
            {busy ? "Reading…" : "Choose image"}
          </button>
          {loaded ? (
            <button
              type="button"
              onClick={clear}
              className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]/50"
            >
              Clear
            </button>
          ) : null}
          <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
            Colors
            <input
              type="number"
              min={1}
              max={12}
              value={maxColors}
              onChange={(e) => reanalyze(Number(e.target.value))}
              className="w-16 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-[var(--foreground)]"
            />
          </label>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,image/bmp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void acceptFile(f);
            e.target.value = "";
          }}
        />
      </div>

      {previewUrl ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Uploaded preview"
              className="max-h-80 w-full rounded-xl border border-[var(--border)] object-contain bg-[var(--surface)]"
            />
            {loaded ? (
              <p className="mt-2 text-sm text-[var(--muted)]">
                {loaded.width}×{loaded.height}px
              </p>
            ) : null}
          </div>

          <div className="space-y-4">
            {palette.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">
                No opaque colors found.
              </p>
            ) : (
              <ul className="space-y-2">
                {palette.map((c) => (
                  <li key={c.hex}>
                    <button
                      type="button"
                      onClick={() => copyHex(c.hex)}
                      className="flex w-full items-center gap-3 rounded-xl border border-[var(--border)] px-3 py-2 text-left transition hover:border-[var(--accent)]/50"
                    >
                      <span
                        className="h-10 w-10 shrink-0 rounded-md border border-[var(--border)]"
                        style={{ background: c.hex }}
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]">
                          {c.hex}
                          {copiedHex === c.hex ? (
                            <span className="ml-2 text-xs text-[var(--muted)]">
                              Copied
                            </span>
                          ) : null}
                        </span>
                        <span className="text-xs text-[var(--muted)]">
                          rgb({c.rgb.r}, {c.rgb.g}, {c.rgb.b}) · {c.percent}%
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {cssBlock ? (
              <div>
                <EditorPaneHeader label="CSS variables" getText={() => cssBlock} />
                <pre className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]">
                  {cssBlock}
                </pre>
                <div className="mt-2 flex flex-wrap gap-2">
                  <CopyButton getText={() => hexList} label="Copy HEX list" />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
