"use client";

import { useCallback, useState } from "react";
import { CopyButton } from "@/components/editor/CopyButton";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { generateFakeNames } from "@/lib/generate/fake-name";
import { track } from "@/lib/analytics";
import Link from "next/link";

export function FakeNameGeneratorTool() {
  const [count, setCount] = useState(10);
  const [style, setStyle] = useState<"western" | "mixed">("western");
  const [includeUsername, setIncludeUsername] = useState(true);
  const [seed, setSeed] = useState(42);
  const [useSeed, setUseSeed] = useState(true);
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState(() =>
    generateFakeNames({
      count: 10,
      style: "western",
      includeUsername: true,
      seed: 42,
    }),
  );

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "fake-name-generator",
        family: "tools",
      });
    }
  }, [started]);

  const run = () => {
    markStart();
    const out = generateFakeNames({
      count,
      style,
      includeUsername,
      seed: useSeed ? seed : undefined,
    });
    setResult(out);
    if (out.ok) {
      track({
        name: "tool_complete",
        tool: "fake-name-generator",
        family: "tools",
      });
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-[var(--muted)]">
        Synthetic names for demos and fixtures. Also see{" "}
        <Link
          href="/tools/fake-user-json-generator"
          className="text-[var(--accent-bright)] underline-offset-2 hover:underline"
        >
          Fake User JSON
        </Link>{" "}
        and{" "}
        <Link
          href="/tools/fake-address-generator"
          className="text-[var(--accent-bright)] underline-offset-2 hover:underline"
        >
          Fake Address
        </Link>
        .
      </p>

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
          Style
          <select
            value={style}
            onChange={(e) =>
              setStyle(e.target.value as "western" | "mixed")
            }
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-2 text-[var(--foreground)]"
          >
            <option value="western">Western-leaning</option>
            <option value="mixed">Mixed</option>
          </select>
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
            checked={includeUsername}
            onChange={(e) => setIncludeUsername(e.target.checked)}
            className="accent-[var(--accent)]"
          />
          Include username
        </label>

        <button
          type="button"
          onClick={run}
          className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--background)]"
        >
          Generate
        </button>

        {result.ok ? (
          <>
            <CopyButton getText={() => result.plain} label="Copy names" />
            <CopyButton getText={() => result.json} label="Copy JSON" />
          </>
        ) : null}
      </div>

      {!result.ok ? (
        <ToolErrorState message={result.error} />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[var(--surface-2)] text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                <tr>
                  <th className="px-3 py-2 font-medium">Full</th>
                  <th className="px-3 py-2 font-medium">First</th>
                  <th className="px-3 py-2 font-medium">Last</th>
                  <th className="px-3 py-2 font-medium">Initials</th>
                  {includeUsername ? (
                    <th className="px-3 py-2 font-medium">Username</th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {result.names.map((n) => (
                  <tr
                    key={`${n.full}-${n.username}`}
                    className="border-t border-[var(--border)]"
                  >
                    <td className="px-3 py-2 text-[var(--foreground)]">
                      {n.full}
                    </td>
                    <td className="px-3 py-2 text-[var(--foreground)]">
                      {n.first}
                    </td>
                    <td className="px-3 py-2 text-[var(--foreground)]">
                      {n.last}
                    </td>
                    <td className="px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]">
                      {n.initials}
                    </td>
                    {includeUsername ? (
                      <td className="px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]">
                        {n.username}
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <pre className="max-h-[16rem] overflow-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 font-[family-name:var(--font-mono)] text-xs leading-relaxed text-[var(--foreground)]">
            {result.json}
          </pre>
        </>
      )}
    </div>
  );
}
