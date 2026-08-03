"use client";

import { useCallback, useMemo, useState } from "react";
import { CopyButton } from "@/components/editor/CopyButton";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import {
  generateRandomPalette,
  type RandomPaletteOptions,
} from "@/lib/color/random-palette";
import { track } from "@/lib/analytics";

export function RandomPaletteGeneratorTool() {
  const [count, setCount] = useState(5);
  const [seed, setSeed] = useState(42);
  const [scheme, setScheme] = useState<RandomPaletteOptions["scheme"]>("analogous");
  const [started, setStarted] = useState(false);

  const result = useMemo(
    () => generateRandomPalette({ count, seed, scheme }),
    [count, seed, scheme],
  );

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "random-palette-generator", family: "tools" });
    }
  }, [started]);

  const reroll = () => {
    markStart();
    setSeed(Math.floor(Math.random() * 100000));
    track({ name: "tool_complete", tool: "random-palette-generator", family: "tools" });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Colors
          <input type="number" min={3} max={8} value={count} onChange={(e) => { markStart(); setCount(Number(e.target.value)); }}
            className="w-24 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5" />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Seed
          <input type="number" value={seed} onChange={(e) => { markStart(); setSeed(Number(e.target.value)); }}
            className="w-28 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5" />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Scheme
          <select value={scheme} onChange={(e) => { markStart(); setScheme(e.target.value as RandomPaletteOptions["scheme"]); }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--foreground)]">
            <option value="analogous">Analogous</option>
            <option value="complementary">Complementary</option>
            <option value="triadic">Triadic</option>
            <option value="random">Random</option>
          </select>
        </label>
        <button type="button" onClick={reroll}
          className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--ink)]">Reroll</button>
      </div>
      {result.ok ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {result.colors.map((swatch) => (
              <div key={swatch.name} className="overflow-hidden rounded-xl border border-[var(--border)]">
                <div className="h-20" style={{ background: swatch.hex }} />
                <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs">
                  <code>{swatch.hex}</code>
                  <CopyButton getText={() => swatch.hex} label="Copy" className="!py-1 !text-xs" />
                </div>
              </div>
            ))}
          </div>
          <CopyButton getText={() => result.cssVariables} label="Copy CSS variables" />
          <EditorPaneHeader label="CSS variables" />
          <CodeEditor value={result.cssVariables} language="text" editable={false} minHeight="160px" />
        </>
      ) : null}
    </div>
  );
}
