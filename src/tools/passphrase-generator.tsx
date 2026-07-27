"use client";

import { useCallback, useState } from "react";
import { CopyButton } from "@/components/editor/CopyButton";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  DEFAULT_PASSPHRASE_OPTIONS,
  estimatePassphraseStrength,
  generatePassphrases,
  PASSPHRASE_SEPARATORS,
  type PassphraseOptions,
} from "@/lib/security/passphrase";
import { track } from "@/lib/analytics";
import Link from "next/link";

const STRENGTH_COLOR: Record<string, string> = {
  Weak: "var(--danger)",
  Fair: "var(--accent-bright)",
  Strong: "var(--success)",
  "Very strong": "var(--success)",
};

export function PassphraseGeneratorTool() {
  const [options, setOptions] = useState<PassphraseOptions>(
    DEFAULT_PASSPHRASE_OPTIONS,
  );
  const [phrases, setPhrases] = useState<string[]>(() =>
    generatePassphrases(DEFAULT_PASSPHRASE_OPTIONS),
  );
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "passphrase-generator",
        family: "tools",
      });
    }
  }, [started]);

  const regenerate = useCallback(
    (opts: PassphraseOptions) => {
      markStart();
      setPhrases(generatePassphrases(opts));
      track({
        name: "tool_complete",
        tool: "passphrase-generator",
        family: "tools",
      });
    },
    [markStart],
  );

  const update = (patch: Partial<PassphraseOptions>) => {
    const next = { ...options, ...patch };
    setOptions(next);
    regenerate(next);
  };

  const strength = estimatePassphraseStrength(options);

  return (
    <div className="space-y-5">
      <div className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        {phrases.length === 0 ? (
          <ToolErrorState message="Could not generate passphrases." />
        ) : (
          phrases.map((phrase, i) => (
            <div
              key={`${i}-${phrase}`}
              className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-2 last:border-b-0 last:pb-0"
            >
              <code className="break-all font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)] sm:text-base">
                {phrase}
              </code>
              <CopyButton
                getText={() => phrase}
                label="Copy"
                className="!py-1.5 !text-sm"
              />
            </div>
          ))
        )}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => regenerate(options)}
            className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--ink)]"
          >
            Generate
          </button>
          <span
            className="text-sm"
            style={{ color: STRENGTH_COLOR[strength.label] }}
          >
            ~{strength.entropyBits} bits · {strength.label}
          </span>
        </div>
      </div>

      <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
        Words: {options.wordCount}
        <input
          type="range"
          min={3}
          max={12}
          value={options.wordCount}
          onChange={(e) => update({ wordCount: Number(e.target.value) })}
        />
      </label>

      <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
        Count: {options.count}
        <input
          type="range"
          min={1}
          max={10}
          value={options.count}
          onChange={(e) => update({ count: Number(e.target.value) })}
        />
      </label>

      <fieldset className="space-y-2">
        <legend className="text-sm text-[var(--muted)]">Separator</legend>
        <div className="flex flex-wrap gap-2">
          {PASSPHRASE_SEPARATORS.map((s) => (
            <button
              key={s.id || "none"}
              type="button"
              onClick={() => update({ separator: s.id })}
              className={
                options.separator === s.id
                  ? "rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--ink)]"
                  : "rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] hover:border-[var(--accent)]/50"
              }
            >
              {s.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-wrap gap-4 text-sm text-[var(--muted)]">
        {(
          [
            ["capitalize", "Capitalize words"],
            ["includeNumber", "Add a digit"],
            ["includeSymbol", "Add a symbol"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={options[key]}
              onChange={(e) => update({ [key]: e.target.checked })}
            />
            {label}
          </label>
        ))}
      </div>

      <p className="text-sm text-[var(--muted)]">
        Uses a fixed 1,024-word dictionary (~10 bits per word) and your
        browser’s CSPRNG. Prefer{" "}
        <Link
          href="/tools/password-generator"
          className="text-[var(--accent-bright)] underline-offset-2 hover:underline"
        >
          Password Generator
        </Link>{" "}
        for random-character secrets.
      </p>
    </div>
  );
}
