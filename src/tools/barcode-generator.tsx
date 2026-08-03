"use client";

import { useCallback, useMemo, useState } from "react";
import { CopyButton } from "@/components/editor/CopyButton";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { buildCode128Svg, SAMPLE_BARCODE_TEXT } from "@/lib/barcode/code128";
import { downloadBlob } from "@/lib/image/canvas";
import { track } from "@/lib/analytics";

export function BarcodeGeneratorTool() {
  const [text, setText] = useState(SAMPLE_BARCODE_TEXT);
  const [height, setHeight] = useState(80);
  const [moduleWidth, setModuleWidth] = useState(2);
  const [started, setStarted] = useState(false);

  const result = useMemo(
    () => buildCode128Svg(text, { height, moduleWidth }),
    [text, height, moduleWidth],
  );

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "barcode-generator", family: "tools" });
    }
  }, [started]);

  const previewUrl = useMemo(() => {
    if (!result.ok) return null;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(result.svg)}`;
  }, [result]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex min-w-[14rem] flex-1 flex-col gap-1 text-sm text-[var(--muted)]">
          Text (Code 128 Set B)
          <input value={text} onChange={(e) => { markStart(); setText(e.target.value); }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]" />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Bar height
          <input type="number" min={40} max={240} value={height} onChange={(e) => { markStart(); setHeight(Number(e.target.value)); }}
            className="w-24 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--foreground)]" />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Module width
          <input type="number" min={1} max={4} value={moduleWidth} onChange={(e) => { markStart(); setModuleWidth(Number(e.target.value)); }}
            className="w-24 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--foreground)]" />
        </label>
      </div>
      {!result.ok ? <ToolErrorState message={result.error} /> : (
        <>
          <div className="flex flex-wrap items-center gap-4">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Barcode preview" className="max-w-full rounded-lg border border-[var(--border)] bg-white p-4" />
            ) : null}
            <div className="flex gap-2">
              <CopyButton getText={() => result.ok ? result.svg : ""} label="Copy SVG" />
              <button type="button" onClick={() => {
                if (!result.ok) return;
                markStart();
                downloadBlob(new Blob([result.svg], { type: "image/svg+xml" }), "barcode.svg");
                track({ name: "tool_complete", tool: "barcode-generator", family: "tools" });
              }} className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm text-[var(--foreground)]">
                Download SVG
              </button>
            </div>
          </div>
          <div>
            <EditorPaneHeader label="SVG" />
            <CodeEditor value={result.svg} language="text" editable={false} minHeight="180px" />
          </div>
        </>
      )}
      <p className="text-xs text-[var(--muted)]">Code 128 Set B — ASCII printable characters (space through ~). Generated locally as SVG.</p>
    </div>
  );
}
