"use client";

import { useCallback, useState } from "react";
import { CopyButton } from "@/components/editor/CopyButton";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { generateFakeUsers } from "@/lib/generate/fake-user";
import { track } from "@/lib/analytics";

export function FakeUserJsonGeneratorTool() {
  const [count, setCount] = useState(5);
  const [rich, setRich] = useState(true);
  const [seed, setSeed] = useState(42);
  const [useSeed, setUseSeed] = useState(true);
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState(() =>
    generateFakeUsers({ count: 5, rich: true, seed: 42 }),
  );

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "fake-user-json-generator",
        family: "tools",
      });
    }
  }, [started]);

  const regenerate = useCallback(
    (next: { count: number; rich: boolean; seed?: number }) => {
      markStart();
      const out = generateFakeUsers(next);
      setResult(out);
      if (out.ok) {
        track({
          name: "tool_complete",
          tool: "fake-user-json-generator",
          family: "tools",
        });
      }
    },
    [markStart],
  );

  const run = () => {
    regenerate({
      count,
      rich,
      seed: useSeed ? seed : undefined,
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Count (1–100)
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-28 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Seed
          <input
            type="number"
            value={seed}
            disabled={!useSeed}
            onChange={(e) => setSeed(Number(e.target.value))}
            className="w-36 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)] disabled:opacity-50"
          />
        </label>

        <label className="flex items-center gap-2 pb-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={useSeed}
            onChange={(e) => setUseSeed(e.target.checked)}
            className="accent-[var(--accent)]"
          />
          Deterministic seed
        </label>

        <label className="flex items-center gap-2 pb-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={rich}
            onChange={(e) => setRich(e.target.checked)}
            className="accent-[var(--accent)]"
          />
          Rich fields (address, company)
        </label>

        <button
          type="button"
          onClick={run}
          className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--accent-fg,var(--background))] transition hover:opacity-90"
        >
          Generate
        </button>

        {result.ok ? (
          <CopyButton getText={() => result.json} label="Copy JSON" />
        ) : null}
      </div>

      {!result.ok ? (
        <ToolErrorState message={result.error} />
      ) : (
        <pre className="max-h-[28rem] overflow-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 font-[family-name:var(--font-mono)] text-xs leading-relaxed text-[var(--foreground)]">
          {result.json}
        </pre>
      )}
    </div>
  );
}
