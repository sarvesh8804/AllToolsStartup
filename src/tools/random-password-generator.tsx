"use client";

import { useCallback, useEffect, useState } from "react";
import { CopyButton } from "@/components/editor/CopyButton";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  DEFAULT_PASSWORD_OPTIONS,
  estimateStrength,
  generatePassword,
  type PasswordOptions,
} from "@/lib/security/password";
import { track } from "@/lib/analytics";

const TOGGLES: { key: keyof PasswordOptions; label: string }[] = [
  { key: "lowercase", label: "Lowercase (a-z)" },
  { key: "uppercase", label: "Uppercase (A-Z)" },
  { key: "numbers", label: "Numbers (0-9)" },
  { key: "symbols", label: "Symbols (!@#…)" },
  { key: "excludeAmbiguous", label: "Exclude ambiguous (l 1 I O 0 o)" },
];

const STRENGTH_COLOR: Record<string, string> = {
  "Very weak": "var(--danger)",
  Weak: "var(--danger)",
  Fair: "var(--accent-bright)",
  Strong: "var(--success)",
  "Very strong": "var(--success)",
};

export function RandomPasswordTool() {
  const [options, setOptions] = useState<PasswordOptions>(
    DEFAULT_PASSWORD_OPTIONS,
  );
  const [password, setPassword] = useState(() =>
    generatePassword(DEFAULT_PASSWORD_OPTIONS),
  );

  const regenerate = useCallback((opts: PasswordOptions) => {
    setPassword(generatePassword(opts));
    track({
      name: "tool_complete",
      tool: "random-password-generator",
      family: "tools",
    });
  }, []);

  useEffect(() => {
    track({
      name: "tool_start",
      tool: "random-password-generator",
      family: "tools",
    });
  }, []);

  const update = (patch: Partial<PasswordOptions>) => {
    const next = { ...options, ...patch };
    setOptions(next);
    regenerate(next);
  };

  const strength = estimateStrength(options);
  const noSet = password === "";

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
        <div className="flex items-center justify-between gap-3">
          <code className="break-all font-[family-name:var(--font-mono)] text-lg text-[var(--foreground)]">
            {noSet ? "Select at least one character set" : password}
          </code>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => regenerate(options)}
              className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--accent-bright)]"
            >
              Regenerate
            </button>
            <CopyButton
              getText={() => password}
              label="Copy"
              className="!py-1.5 !text-sm"
            />
          </div>
        </div>
      </div>

      {noSet ? (
        <ToolErrorState message="Enable at least one character set to generate a password." />
      ) : (
        <p className="text-sm text-[var(--muted)]">
          Strength:{" "}
          <strong style={{ color: STRENGTH_COLOR[strength.label] }}>
            {strength.label}
          </strong>{" "}
          (~{strength.entropyBits} bits of entropy)
        </p>
      )}

      <div className="space-y-4">
        <label className="flex flex-col gap-2 text-sm text-[var(--muted)]">
          <span>
            Length: <strong className="text-[var(--foreground)]">{options.length}</strong>
          </span>
          <input
            type="range"
            min={4}
            max={64}
            value={options.length}
            onChange={(e) => update({ length: Number(e.target.value) })}
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
      </div>

      <p className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">
        Passwords are generated with your browser&apos;s cryptographic random
        source and never leave this device.
      </p>
    </div>
  );
}
