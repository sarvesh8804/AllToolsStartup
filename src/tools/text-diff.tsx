"use client";

import { useCallback, useMemo, useState } from "react";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { CopyButton } from "@/components/editor/CopyButton";
import { diffInline, diffLines, unifiedDiff } from "@/lib/text/diff";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

const LEFT = `function greet(name) {
  return "Hello, " + name;
}

greet("Forge");`;

const RIGHT = `function greet(name) {
  return \`Hello, \${name}!\`;
}

greet("World");`;

type ViewMode = "side-by-side" | "inline";

export function TextDiffTool() {
  const [left, setLeft] = useState(LEFT);
  const [right, setRight] = useState(RIGHT);
  const [mode, setMode] = useState<ViewMode>("inline");
  const [started, setStarted] = useState(false);

  const result = useMemo(() => diffLines(left, right), [left, right]);
  const inline = useMemo(() => diffInline(left, right), [left, right]);
  const unified = useMemo(() => unifiedDiff(left, right), [left, right]);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "text-diff", family: "tools" });
    }
  }, [started]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["inline", "Inline"],
                ["side-by-side", "Side-by-side"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  markStart();
                  setMode(value);
                }}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-sm transition",
                  mode === value
                    ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--foreground)]"
                    : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/50",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <Stat label="Unchanged" value={result.stats.unchanged} />
          <Stat label="Additions" value={result.stats.additions} tone="add" />
          <Stat label="Deletions" value={result.stats.deletions} tone="del" />
        </div>
        <CopyButton getText={() => unified} label="Copy unified diff" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="Original" getText={() => left} />
          <CodeEditor
            language="text"
            value={left}
            onChange={(v) => {
              markStart();
              setLeft(v);
            }}
            minHeight="28vh"
          />
        </div>
        <div>
          <EditorPaneHeader label="Modified" getText={() => right} />
          <CodeEditor
            language="text"
            value={right}
            onChange={(v) => {
              markStart();
              setRight(v);
            }}
            minHeight="28vh"
          />
        </div>
      </div>

      {mode === "inline" ? (
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
            Inline diff (word highlights on changed lines)
          </p>
          <div className="overflow-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] font-[family-name:var(--font-mono)] text-xs sm:text-sm">
            {inline.lines.map((line, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex gap-2 border-b border-[var(--border)]/60 px-2 py-0.5 last:border-b-0",
                  line.kind === "add" && "bg-[var(--success-bg)]",
                  line.kind === "remove" && "bg-[var(--danger-bg)]",
                  line.kind === "replace" && "bg-[var(--surface-2)]/30",
                )}
              >
                <span className="w-8 shrink-0 select-none text-right text-[var(--muted)]">
                  {line.leftNumber ?? ""}
                </span>
                <span className="w-8 shrink-0 select-none text-right text-[var(--muted)]">
                  {line.rightNumber ?? ""}
                </span>
                <span className="w-4 shrink-0 select-none text-[var(--muted)]">
                  {line.kind === "add"
                    ? "+"
                    : line.kind === "remove"
                      ? "−"
                      : line.kind === "replace"
                        ? "~"
                        : " "}
                </span>
                <span className="min-w-0 flex-1 whitespace-pre-wrap break-all">
                  {line.kind === "replace" && line.segments
                    ? line.segments.map((seg, sIdx) => (
                        <span
                          key={sIdx}
                          className={cn(
                            seg.type === "add" &&
                              "rounded-sm bg-[var(--success-bg)] text-[var(--success)]",
                            seg.type === "remove" &&
                              "rounded-sm bg-[var(--danger-bg)] text-[var(--danger)] line-through",
                          )}
                        >
                          {seg.text}
                        </span>
                      ))
                    : line.text || "\u00a0"}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
            Side-by-side diff
          </p>
          <div className="overflow-auto rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            <table className="w-full min-w-[640px] border-collapse font-[family-name:var(--font-mono)] text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-left text-[var(--muted)]">
                  <th className="w-10 px-2 py-2">#</th>
                  <th className="w-1/2 px-2 py-2">Original</th>
                  <th className="w-10 px-2 py-2">#</th>
                  <th className="w-1/2 px-2 py-2">Modified</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row, idx) => (
                  <tr key={idx} className="align-top">
                    <td className="select-none px-2 py-0.5 text-right text-[var(--muted)]">
                      {row.left.lineNumber ?? ""}
                    </td>
                    <td
                      className={cn(
                        "whitespace-pre-wrap break-all px-2 py-0.5",
                        row.left.type === "remove" &&
                          "bg-[var(--danger-bg)] text-[var(--danger)]",
                        row.left.type === "empty" && "bg-[var(--surface-2)]/40",
                      )}
                    >
                      {row.left.text || "\u00a0"}
                    </td>
                    <td className="select-none px-2 py-0.5 text-right text-[var(--muted)]">
                      {row.right.lineNumber ?? ""}
                    </td>
                    <td
                      className={cn(
                        "whitespace-pre-wrap break-all px-2 py-0.5",
                        row.right.type === "add" &&
                          "bg-[var(--success-bg)] text-[var(--success)]",
                        row.right.type === "empty" &&
                          "bg-[var(--surface-2)]/40",
                      )}
                    >
                      {row.right.text || "\u00a0"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "add" | "del";
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5">
      <dt className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
        {label}
      </dt>
      <dd
        className={cn(
          "font-[family-name:var(--font-mono)] text-lg",
          tone === "add" && "text-[var(--success)]",
          tone === "del" && "text-[var(--danger)]",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
