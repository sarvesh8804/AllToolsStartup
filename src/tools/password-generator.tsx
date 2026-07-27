"use client";

import { useCallback, useState } from "react";
import { CopyButton } from "@/components/editor/CopyButton";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  DEFAULT_ADVANCED_PASSWORD_OPTIONS,
  estimateAdvancedStrength,
  generateAdvancedPasswords,
  type AdvancedPasswordOptions,
} from "@/lib/security/password";
import { track } from "@/lib/analytics";
import Link from "next/link";

const STRENGTH_COLOR: Record<string, string> = {
  "Very weak": "var(--danger)",
  Weak: "var(--danger)",
  Fair: "var(--accent-bright)",
  Strong: "var(--success)",
  "Very strong": "var(--success)",
};

const TOGGLES: {
  key: keyof AdvancedPasswordOptions;
  label: string;
}[] = [
  { key: "lowercase", label: "Lowercase (a-z)" },
  { key: "uppercase", label: "Uppercase (A-Z)" },
  { key: "numbers", label: "Numbers (0-9)" },
  { key: "symbols", label: "Symbols (!@#…)" },
  { key: "excludeAmbiguous", label: "Exclude ambiguous (l 1 I O 0 o)" },
  { key: "requireEverySet", label: "Require every selected set" },
  { key: "beginWithLetter", label: "Begin with a letter" },
  { key: "includeCustomSymbols", label: "Include custom symbols" },
];

export function PasswordGeneratorTool() {
  const [options, setOptions] = useState<AdvancedPasswordOptions>(
    DEFAULT_ADVANCED_PASSWORD_OPTIONS,
  );
  const [passwords, setPasswords] = useState<string[]>(() =>
    generateAdvancedPasswords(DEFAULT_ADVANCED_PASSWORD_OPTIONS),
  );
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "password-generator",
        family: "tools",
      });
    }
  }, [started]);

  const regenerate = useCallback(
    (opts: AdvancedPasswordOptions) => {
      markStart();
      setPasswords(generateAdvancedPasswords(opts));
      track({
        name: "tool_complete",
        tool: "password-generator",
        family: "tools",
      });
    },
    [markStart],
  );

  const update = (patch: Partial<AdvancedPasswordOptions>) => {
    const next = { ...options, ...patch };
    setOptions(next);
    regenerate(next);
  };

  const strength = estimateAdvancedStrength(options);
  const empty = passwords.length === 0 || passwords.every((p) => p === "");

  return (
    <div className="space-y-5">
      <div className="space-y-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        {empty ? (
          <ToolErrorState message="Enable at least one character set to generate passwords." />
        ) : (
          passwords.map((pw, i) => (
            <div
              key={`${i}-${pw}`}
              className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-2 last:border-b-0 last:pb-0"
            >
              <code className="break-all font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)] sm:text-base">
                {pw}
              </code>
              <CopyButton getText={() => pw} label="Copy" className="!py-1.5 !text-sm" />
            </div>
          ))
        )}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => regenerate(options)}
            className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--accent-bright)]"
          >
            Regenerate
          </button>
          {!empty && passwords.length > 1 ? (
            <CopyButton
              getText={() => passwords.join("\n")}
              label="Copy all"
              className="!py-1.5 !text-sm"
            />
          ) : null}
        </div>
      </div>

      {!empty ? (
        <p className="text-sm text-[var(--muted)]">
          Strength:{" "}
          <strong style={{ color: STRENGTH_COLOR[strength.label] }}>
            {strength.label}
          </strong>{" "}
          (~{strength.entropyBits} bits of entropy per password)
        </p>
      ) : null}

      <div className="space-y-4">
        <label className="flex flex-col gap-2 text-sm text-[var(--muted)]">
          <span>
            Length:{" "}
            <strong className="text-[var(--foreground)]">{options.length}</strong>
          </span>
          <input
            type="range"
            min={4}
            max={128}
            value={options.length}
            onChange={(e) => update({ length: Number(e.target.value) })}
            className="w-full accent-[var(--accent)]"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-[var(--muted)]">
          <span>
            Count:{" "}
            <strong className="text-[var(--foreground)]">{options.count}</strong>
          </span>
          <input
            type="range"
            min={1}
            max={20}
            value={options.count}
            onChange={(e) => update({ count: Number(e.target.value) })}
            className="w-full accent-[var(--accent)]"
          />
        </label>

        <div className="grid gap-2 sm:grid-cols-2">
          {TOGGLES.map((t) => (
            <label
              key={t.key}
              className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)]"
            >
              <input
                type="checkbox"
                checked={Boolean(options[t.key])}
                onChange={(e) => update({ [t.key]: e.target.checked })}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              {t.label}
            </label>
          ))}
        </div>

        {options.includeCustomSymbols ? (
          <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
            Custom symbols
            <input
              type="text"
              value={options.customSymbols}
              onChange={(e) => update({ customSymbols: e.target.value })}
              placeholder="e.g. ~`|$€"
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
            />
          </label>
        ) : null}
      </div>

      <p className="text-xs text-[var(--muted)]">
        Advanced generator with CSPRNG, set guarantees, and batch output. Check
        a candidate with the{" "}
        <Link
          href="/tools/password-strength-meter"
          className="text-[var(--copper-bright)] hover:underline"
        >
          Password Strength Meter
        </Link>
        .
      </p>
    </div>
  );
}
