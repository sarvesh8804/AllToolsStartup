"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  DEFAULT_REGEX_FLAGS,
  highlightMatches,
  testRegex,
  type RegexFlags,
} from "@/lib/text/regex";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

const SAMPLE_PATTERN = "\\b([A-Z][a-z]+)\\b";
const SAMPLE_TEXT = `Forge ships tools every day.
Ada loves Regex.
JSON Formatter is ready.`;

const FLAG_META: { key: keyof RegexFlags; label: string; title: string }[] = [
  { key: "g", label: "g", title: "Global" },
  { key: "i", label: "i", title: "Ignore case" },
  { key: "m", label: "m", title: "Multiline ^ $" },
  { key: "s", label: "s", title: "Dotall ." },
  { key: "u", label: "u", title: "Unicode" },
  { key: "y", label: "y", title: "Sticky" },
];

export function RegexTesterTool() {
  const [pattern, setPattern] = useState(SAMPLE_PATTERN);
  const [text, setText] = useState(SAMPLE_TEXT);
  const [replacement, setReplacement] = useState("$1");
  const [flags, setFlags] = useState<RegexFlags>(DEFAULT_REGEX_FLAGS);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "regex-tester", family: "tools" });
    }
  }, [started]);

  const result = useMemo(
    () => testRegex(pattern, text, flags, replacement),
    [pattern, text, flags, replacement],
  );

  const segments = useMemo(() => {
    if (!result.ok) return [{ text, isMatch: false }];
    return highlightMatches(text, result.matches);
  }, [result, text]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-[16rem] flex-1 flex-col gap-1 text-sm text-[var(--muted)]">
          Pattern
          <input
            value={pattern}
            onChange={(e) => {
              markStart();
              setPattern(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
            spellCheck={false}
            aria-label="Regular expression pattern"
          />
        </label>

        <div className="flex flex-wrap gap-1 pb-0.5">
          {FLAG_META.map((f) => (
            <button
              key={f.key}
              type="button"
              title={f.title}
              aria-pressed={flags[f.key]}
              onClick={() => {
                markStart();
                setFlags((prev) => ({ ...prev, [f.key]: !prev[f.key] }));
              }}
              className={
                flags[f.key]
                  ? "rounded-md bg-[var(--accent)] px-2.5 py-1.5 font-[family-name:var(--font-mono)] text-sm font-medium text-[var(--ink)]"
                  : "rounded-md border border-[var(--border)] px-2.5 py-1.5 font-[family-name:var(--font-mono)] text-sm text-[var(--muted)] hover:border-[var(--accent)]/50"
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {!result.ok ? <ToolErrorState message={result.error} /> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="Test string" getText={() => text} />
          <CodeEditor
            language="text"
            value={text}
            onChange={(v) => {
              markStart();
              setText(v);
            }}
            minHeight="28vh"
          />
        </div>
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
            Highlighted matches
            {result.ok ? ` (${result.matches.length})` : ""}
          </p>
          <div className="min-h-[28vh] whitespace-pre-wrap break-words rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 font-[family-name:var(--font-mono)] text-sm leading-relaxed text-[var(--foreground)]">
            {segments.map((seg, i) => (
              <span
                key={i}
                className={cn(
                  seg.isMatch &&
                    "rounded-sm bg-[var(--accent)]/35 text-[var(--ink)]",
                )}
              >
                {seg.text || "\u00a0"}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Replacement
          <input
            value={replacement}
            onChange={(e) => {
              markStart();
              setReplacement(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
            spellCheck={false}
          />
        </label>
        <div>
          <EditorPaneHeader
            label="Replace preview"
            getText={() => (result.ok ? result.replaced : "")}
          />
          <CodeEditor
            language="text"
            value={result.ok ? result.replaced : ""}
            editable={false}
            minHeight="12vh"
          />
        </div>
      </div>

      {result.ok && result.matches.length > 0 ? (
        <div className="overflow-auto rounded-xl border border-[var(--border)]">
          <table className="w-full min-w-[560px] text-sm">
            <thead className="bg-[var(--surface)] text-left text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Index</th>
                <th className="px-3 py-2">Match</th>
                <th className="px-3 py-2">Groups</th>
              </tr>
            </thead>
            <tbody>
              {result.matches.map((m, i) => (
                <tr key={`${m.index}-${i}`} className="border-t border-[var(--border)]">
                  <td className="px-3 py-2 text-[var(--muted)]">{i + 1}</td>
                  <td className="px-3 py-2 font-[family-name:var(--font-mono)]">
                    {m.index}
                  </td>
                  <td className="px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]">
                    {m.match || "(empty)"}
                  </td>
                  <td className="px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--muted)]">
                    {m.groups.length
                      ? m.groups.map((g, gi) => `$${gi + 1}=${JSON.stringify(g)}`).join(" · ")
                      : "—"}
                    {Object.keys(m.namedGroups).length
                      ? " · " +
                        Object.entries(m.namedGroups)
                          .map(([k, v]) => `${k}=${JSON.stringify(v)}`)
                          .join(" · ")
                      : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
