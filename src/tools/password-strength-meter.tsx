"use client";

import { useCallback, useMemo, useState } from "react";
import { analyzePassword } from "@/lib/security/password-strength";
import { track } from "@/lib/analytics";
import Link from "next/link";

const STRENGTH_COLOR: Record<string, string> = {
  "Very weak": "var(--danger)",
  Weak: "var(--danger)",
  Fair: "var(--accent-bright)",
  Strong: "var(--success)",
  "Very strong": "var(--success)",
};

const CHECK_LABELS: { key: keyof ReturnType<typeof analyzePassword>["checks"]; label: string }[] = [
  { key: "length", label: "At least 12 characters" },
  { key: "lowercase", label: "Lowercase letter" },
  { key: "uppercase", label: "Uppercase letter" },
  { key: "number", label: "Number" },
  { key: "symbol", label: "Symbol" },
  { key: "noCommon", label: "Not a common password" },
  { key: "noRepeat", label: "No long repeated runs" },
];

export function PasswordStrengthMeterTool() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "password-strength-meter",
        family: "tools",
      });
    }
  }, [started]);

  const analysis = useMemo(() => analyzePassword(password), [password]);

  return (
    <div className="space-y-5">
      <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
        Password
        <div className="flex gap-2">
          <input
            type={show ? "text" : "password"}
            value={password}
            autoComplete="off"
            spellCheck={false}
            placeholder="Type or paste a password"
            onChange={(e) => {
              markStart();
              setPassword(e.target.value);
            }}
            className="min-w-0 flex-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="shrink-0 rounded-md border border-[var(--border)] px-3 py-2 text-sm hover:border-[var(--accent)]/50"
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>
      </label>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
              Strength
            </p>
            <p
              className="mt-1 font-[family-name:var(--font-display)] text-2xl"
              style={{ color: STRENGTH_COLOR[analysis.label] }}
            >
              {analysis.label}
            </p>
          </div>
          <p className="font-[family-name:var(--font-mono)] text-sm text-[var(--muted)]">
            Score {analysis.score}/100 · ~{analysis.entropyBits} bits
          </p>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--border)]">
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${analysis.score}%`,
              background: STRENGTH_COLOR[analysis.label],
            }}
          />
        </div>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2">
        {CHECK_LABELS.map(({ key, label }) => {
          const ok = analysis.checks[key];
          return (
            <li
              key={key}
              className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm"
            >
              <span
                aria-hidden
                className={ok ? "text-[var(--success)]" : "text-[var(--muted)]"}
              >
                {ok ? "✓" : "○"}
              </span>
              <span
                className={
                  ok ? "text-[var(--foreground)]" : "text-[var(--muted)]"
                }
              >
                {label}
              </span>
            </li>
          );
        })}
      </ul>

      <ul className="space-y-1 text-sm text-[var(--muted)]">
        {analysis.feedback.map((line) => (
          <li key={line}>• {line}</li>
        ))}
      </ul>

      <p className="text-xs text-[var(--muted)]">
        Heuristic estimate only — not a breach check. Your password never
        leaves this browser. Need one? Use the{" "}
        <Link
          href="/tools/random-password-generator"
          className="text-[var(--copper-bright)] hover:underline"
        >
          Random Password Generator
        </Link>
        .
      </p>
    </div>
  );
}
