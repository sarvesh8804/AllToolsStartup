"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { CopyButton } from "@/components/editor/CopyButton";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { generateFakeEmails } from "@/lib/generate/fake-email";
import { track } from "@/lib/analytics";

export function FakeEmailGeneratorTool() {
  const [count, setCount] = useState(10);
  const [domain, setDomain] = useState("example.com");
  const [randomDomain, setRandomDomain] = useState(false);
  const [seed, setSeed] = useState(42);
  const [useSeed, setUseSeed] = useState(true);
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState(() =>
    generateFakeEmails({
      count: 10,
      domain: "example.com",
      randomDomain: false,
      seed: 42,
    }),
  );

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "fake-email-generator",
        family: "tools",
      });
    }
  }, [started]);

  const run = () => {
    markStart();
    const out = generateFakeEmails({
      count,
      domain,
      randomDomain,
      seed: useSeed ? seed : undefined,
    });
    setResult(out);
    if (out.ok) {
      track({
        name: "tool_complete",
        tool: "fake-email-generator",
        family: "tools",
      });
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-[var(--muted)]">
        Synthetic addresses for fixtures only — not real inboxes. Related:{" "}
        <Link
          href="/tools/fake-name-generator"
          className="text-[var(--accent-bright)] underline-offset-2 hover:underline"
        >
          Fake Name
        </Link>
        ,{" "}
        <Link
          href="/tools/fake-user-json-generator"
          className="text-[var(--accent-bright)] underline-offset-2 hover:underline"
        >
          Fake User JSON
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
          Domain
          <input
            type="text"
            value={domain}
            disabled={randomDomain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-48 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)] disabled:opacity-50"
          />
        </label>

        <label className="flex items-center gap-2 pb-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={randomDomain}
            onChange={(e) => setRandomDomain(e.target.checked)}
            className="accent-[var(--accent)]"
          />
          Random example domains
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

        <button
          type="button"
          onClick={run}
          className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--background)]"
        >
          Generate
        </button>

        {result.ok ? (
          <>
            <CopyButton getText={() => result.plain} label="Copy list" />
            <CopyButton getText={() => result.json} label="Copy JSON" />
          </>
        ) : null}
      </div>

      {!result.ok ? (
        <ToolErrorState message={result.error} />
      ) : (
        <pre className="max-h-[28rem] overflow-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 font-[family-name:var(--font-mono)] text-sm leading-relaxed text-[var(--foreground)]">
          {result.plain}
        </pre>
      )}
    </div>
  );
}
