"use client";

import { useCallback, useMemo, useState } from "react";
import { CopyButton } from "@/components/editor/CopyButton";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import {
  buildKeyframesCss,
  DEFAULT_KEYFRAMES,
  type KeyframeStop,
} from "@/lib/css/keyframes";
import { track } from "@/lib/analytics";

export function CssAnimationKeyframesBuilderTool() {
  const [options, setOptions] = useState(DEFAULT_KEYFRAMES);
  const [started, setStarted] = useState(false);

  const css = useMemo(() => buildKeyframesCss(options), [options]);
  const previewClass = "forge-keyframes-preview";
  const previewCss = useMemo(
    () => `${css.keyframes}\n.${previewClass} { ${css.animation} }`,
    [css],
  );

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "css-animation-keyframes-builder", family: "tools" });
    }
  }, [started]);

  const updateStop = (id: string, patch: Partial<KeyframeStop>) => {
    markStart();
    setOptions((prev) => ({
      ...prev,
      stops: prev.stops.map((stop) => (stop.id === id ? { ...stop, ...patch } : stop)),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Name
          <input value={options.name} onChange={(e) => { markStart(); setOptions((p) => ({ ...p, name: e.target.value })); }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm" />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Duration (s)
          <input type="number" min={0.1} step={0.1} value={options.duration} onChange={(e) => { markStart(); setOptions((p) => ({ ...p, duration: Number(e.target.value) })); }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Timing
          <input value={options.timingFunction} onChange={(e) => { markStart(); setOptions((p) => ({ ...p, timingFunction: e.target.value })); }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Iterations
          <input value={options.iterationCount} onChange={(e) => { markStart(); setOptions((p) => ({ ...p, iterationCount: e.target.value })); }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2" />
        </label>
      </div>

      <div className="flex items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] p-10">
        <style dangerouslySetInnerHTML={{ __html: previewCss }} />
        <div
          key={css.keyframes}
          className={`${previewClass} h-16 w-16 rounded-xl bg-[var(--accent)]`}
        />
      </div>

      {options.stops.map((stop) => (
        <div key={stop.id} className="grid gap-3 rounded-lg border border-[var(--border)] p-3 sm:grid-cols-5">
          <label className="text-sm text-[var(--muted)]">Offset %
            <input type="number" min={0} max={100} value={stop.offset} onChange={(e) => updateStop(stop.id, { offset: Number(e.target.value) })}
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5" />
          </label>
          <label className="text-sm text-[var(--muted)]">Y
            <input type="number" value={stop.translateY} onChange={(e) => updateStop(stop.id, { translateY: Number(e.target.value) })}
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5" />
          </label>
          <label className="text-sm text-[var(--muted)]">Scale
            <input type="number" step={0.05} value={stop.scale} onChange={(e) => updateStop(stop.id, { scale: Number(e.target.value) })}
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5" />
          </label>
          <label className="text-sm text-[var(--muted)]">Rotate
            <input type="number" value={stop.rotate} onChange={(e) => updateStop(stop.id, { rotate: Number(e.target.value) })}
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5" />
          </label>
          <label className="text-sm text-[var(--muted)]">Opacity
            <input type="number" min={0} max={1} step={0.05} value={stop.opacity} onChange={(e) => updateStop(stop.id, { opacity: Number(e.target.value) })}
              className="mt-1 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5" />
          </label>
        </div>
      ))}

      <div className="flex gap-2">
        <CopyButton getText={() => css.rule} label="Copy CSS" />
      </div>
      <EditorPaneHeader label="CSS" />
      <CodeEditor value={css.rule} language="text" editable={false} minHeight="220px" />
    </div>
  );
}
