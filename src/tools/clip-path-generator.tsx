"use client";

import { useCallback, useMemo, useState } from "react";
import { CopyButton } from "@/components/editor/CopyButton";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import {
  buildClipPathCss,
  DEFAULT_CLIP_PATH,
  type ClipPathShape,
} from "@/lib/css/clip-path";
import { track } from "@/lib/analytics";

const SHAPES: { id: ClipPathShape; label: string }[] = [
  { id: "hexagon", label: "Hexagon" },
  { id: "triangle", label: "Triangle" },
  { id: "star", label: "Star" },
  { id: "circle", label: "Circle" },
  { id: "ellipse", label: "Ellipse" },
  { id: "inset", label: "Inset" },
];

export function ClipPathGeneratorTool() {
  const [shape, setShape] = useState<ClipPathShape>(DEFAULT_CLIP_PATH.shape);
  const [radius, setRadius] = useState(50);
  const [inset, setInset] = useState(10);
  const [round, setRound] = useState(0);
  const [started, setStarted] = useState(false);

  const result = useMemo(
    () =>
      buildClipPathCss({
        shape,
        radius,
        insetTop: inset,
        insetRight: inset,
        insetBottom: inset,
        insetLeft: inset,
        round,
      }),
    [shape, radius, inset, round],
  );

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "clip-path-generator", family: "tools" });
    }
  }, [started]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {SHAPES.map((item) => (
          <button key={item.id} type="button" onClick={() => { markStart(); setShape(item.id); }}
            className={`rounded-md border px-3 py-1.5 text-sm ${shape === item.id ? "border-[var(--accent)] bg-[var(--accent)]/15" : "border-[var(--border)] text-[var(--muted)]"}`}>
            {item.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-4">
        {(shape === "circle" || shape === "ellipse") ? (
          <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
            Radius %
            <input type="number" min={1} max={50} value={radius} onChange={(e) => { markStart(); setRadius(Number(e.target.value)); }}
              className="w-24 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5" />
          </label>
        ) : null}
        {shape === "inset" ? (
          <>
            <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
              Inset %
              <input type="number" min={0} max={40} value={inset} onChange={(e) => { markStart(); setInset(Number(e.target.value)); }}
                className="w-24 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5" />
            </label>
            <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
              Round (px)
              <input type="number" min={0} max={40} value={round} onChange={(e) => { markStart(); setRound(Number(e.target.value)); }}
                className="w-24 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5" />
            </label>
          </>
        ) : null}
      </div>
      <div className="flex justify-center">
        <div className="h-48 w-72 bg-gradient-to-br from-[var(--accent)] to-[#243018]" style={{ clipPath: result.value }} />
      </div>
      <CopyButton getText={() => result.rule} label="Copy CSS" />
      <EditorPaneHeader label="CSS" />
      <CodeEditor value={result.rule} language="text" editable={false} minHeight="120px" />
    </div>
  );
}
