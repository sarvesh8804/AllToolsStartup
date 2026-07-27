"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { CopyButton } from "@/components/editor/CopyButton";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  REGEX_EXPLAIN_EXAMPLES,
  SAMPLE_REGEX_EXPLAIN,
  explainRegex,
  tokensToPlainText,
} from "@/lib/regex/explain";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

const KIND_COLORS: Record<string, string> = {
  literal: "border-[var(--border)] bg-[var(--surface)]",
  escape: "border-sky-500/40 bg-sky-500/10",
  dot: "border-violet-500/40 bg-violet-500/10",
  anchor: "border-amber-500/40 bg-amber-500/10",
  quantifier: "border-rose-500/40 bg-rose-500/10",
  alternation: "border-orange-500/40 bg-orange-500/10",
  "group-open": "border-emerald-500/40 bg-emerald-500/10",
  "group-close": "border-emerald-500/40 bg-emerald-500/10",
  class: "border-cyan-500/40 bg-cyan-500/10",
  unknown: "border-red-500/40 bg-red-500/10",
};

export function RegexExplainerTool() {
  const [pattern, setPattern] = useState(SAMPLE_REGEX_EXPLAIN);
  const [active, setActive] = useState(0);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "regex-explainer", family: "tools" });
    }
  }, [started]);

  const markComplete = useCallback(() => {
    if (!completed) {
      setCompleted(true);
      track({
        name: "tool_complete",
        tool: "regex-explainer",
        family: "tools",
      });
    }
  }, [completed]);

  const result = useMemo(() => explainRegex(pattern), [pattern]);

  const plain = useMemo(
    () => (result.tokens.length ? tokensToPlainText(result.tokens) : ""),
    [result],
  );

  const onPattern = (v: string) => {
    markStart();
    markComplete();
    setPattern(v);
    setActive(0);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {REGEX_EXPLAIN_EXAMPLES.map((ex) => (
          <button
            key={ex.label}
            type="button"
            onClick={() => onPattern(ex.pattern)}
            className="rounded-md border border-[var(--border)] px-2.5 py-1 text-sm text-[var(--muted)] hover:border-[var(--accent)]/50 hover:text-[var(--foreground)]"
          >
            {ex.label}
          </button>
        ))}
        <Link
          href="/tools/regex-tester"
          className="ml-auto text-sm text-[var(--copper-bright)] hover:underline"
        >
          Open Regex Tester →
        </Link>
      </div>

      <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
        Pattern
        <input
          value={pattern}
          onChange={(e) => onPattern(e.target.value)}
          spellCheck={false}
          className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
          aria-label="Regular expression to explain"
        />
      </label>

      {!result.ok ? <ToolErrorState message={result.error} /> : null}

      {result.ok ? (
        <p className="text-sm text-[var(--muted)]">{result.summary}</p>
      ) : result.tokens.length > 0 ? (
        <p className="text-sm text-[var(--muted)]">
          Partial tokenization ({result.tokens.length} tokens) despite the syntax
          error.
        </p>
      ) : null}

      {result.tokens.length > 0 ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
              Tokens
            </span>
            <CopyButton getText={() => plain} label="Copy explanation" />
          </div>

          <div className="flex flex-wrap gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 font-[family-name:var(--font-mono)] text-sm">
            {result.tokens.map((t, i) => (
              <button
                key={`${t.start}-${t.end}-${i}`}
                type="button"
                onClick={() => {
                  markStart();
                  setActive(i);
                }}
                title={t.title}
                className={cn(
                  "rounded border px-1.5 py-0.5 transition",
                  KIND_COLORS[t.kind] ?? KIND_COLORS.unknown,
                  active === i && "ring-2 ring-[var(--accent)]",
                )}
                style={{ marginLeft: t.depth > 0 ? t.depth * 2 : undefined }}
              >
                {t.raw || "∅"}
              </button>
            ))}
          </div>

          {result.tokens[active] ? (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
              <p className="font-[family-name:var(--font-mono)] text-sm text-[var(--copper-bright)]">
                {result.tokens[active].raw}
              </p>
              <h3 className="mt-1 text-lg text-[var(--foreground)]">
                {result.tokens[active].title}
              </h3>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {result.tokens[active].explanation}
              </p>
              <p className="mt-2 text-xs text-[var(--muted)]">
                Positions {result.tokens[active].start}–
                {result.tokens[active].end}
                {result.tokens[active].depth > 0
                  ? ` · nest depth ${result.tokens[active].depth}`
                  : ""}
              </p>
            </div>
          ) : null}

          <ol className="space-y-2">
            {result.tokens.map((t, i) => (
              <li
                key={`row-${t.start}-${i}`}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm",
                  active === i
                    ? "border-[var(--accent)] bg-[var(--accent)]/10"
                    : "border-[var(--border)] bg-[var(--surface)]",
                )}
              >
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => setActive(i)}
                >
                  <span className="font-[family-name:var(--font-mono)] text-[var(--foreground)]">
                    {t.raw}
                  </span>
                  <span className="mt-0.5 block text-[var(--muted)]">
                    <strong className="font-medium text-[var(--foreground)]">
                      {t.title}.
                    </strong>{" "}
                    {t.explanation}
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </>
      ) : null}
    </div>
  );
}
