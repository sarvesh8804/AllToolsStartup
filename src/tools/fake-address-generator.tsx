"use client";

import { useCallback, useState } from "react";
import { CopyButton } from "@/components/editor/CopyButton";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  generateFakeAddresses,
  type FakeAddressCountry,
} from "@/lib/generate/fake-address";
import { track } from "@/lib/analytics";
import Link from "next/link";

const COUNTRIES: { id: FakeAddressCountry | "random"; label: string }[] = [
  { id: "random", label: "Random" },
  { id: "US", label: "United States" },
  { id: "CA", label: "Canada" },
  { id: "GB", label: "United Kingdom" },
  { id: "IN", label: "India" },
  { id: "DE", label: "Germany" },
];

export function FakeAddressGeneratorTool() {
  const [count, setCount] = useState(5);
  const [country, setCountry] = useState<FakeAddressCountry | "random">("US");
  const [seed, setSeed] = useState(42);
  const [useSeed, setUseSeed] = useState(true);
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState(() =>
    generateFakeAddresses({ count: 5, country: "US", seed: 42 }),
  );

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "fake-address-generator",
        family: "tools",
      });
    }
  }, [started]);

  const run = () => {
    markStart();
    const out = generateFakeAddresses({
      count,
      country,
      seed: useSeed ? seed : undefined,
    });
    setResult(out);
    if (out.ok) {
      track({
        name: "tool_complete",
        tool: "fake-address-generator",
        family: "tools",
      });
    }
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-[var(--muted)]">
        Synthetic addresses for fixtures only. For full mock users, see the{" "}
        <Link
          href="/tools/fake-user-json-generator"
          className="text-[var(--accent-bright)] underline-offset-2 hover:underline"
        >
          Fake User JSON Generator
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
          Country
          <select
            value={country}
            onChange={(e) =>
              setCountry(e.target.value as FakeAddressCountry | "random")
            }
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-2 text-[var(--foreground)]"
          >
            {COUNTRIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
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

        <button
          type="button"
          onClick={run}
          className="rounded-md bg-[var(--accent)] px-4 py-2 text-sm font-medium text-[var(--background)]"
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
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            {result.addresses.map((addr, i) => (
              <div
                key={`${addr.formatted}-${i}`}
                className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                    {addr.countryCode}
                  </span>
                  <CopyButton
                    getText={() => addr.formatted}
                    label="Copy"
                    className="!py-1 !text-xs"
                  />
                </div>
                <pre className="whitespace-pre-wrap font-[family-name:var(--font-mono)] text-sm leading-relaxed text-[var(--foreground)]">
                  {addr.formatted}
                </pre>
              </div>
            ))}
          </div>
          <pre className="max-h-[20rem] overflow-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 font-[family-name:var(--font-mono)] text-xs leading-relaxed text-[var(--foreground)]">
            {result.json}
          </pre>
        </>
      )}
    </div>
  );
}
