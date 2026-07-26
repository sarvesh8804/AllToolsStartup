"use client";

import { useCallback, useMemo, useState } from "react";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { CopyButton } from "@/components/editor/CopyButton";
import { diffLines, unifiedDiff } from "@/lib/text/diff";
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

export function TextDiffTool() {
  const [left, setLeft] = useState(LEFT);
  const [right, setRight] = useState(RIGHT);
  const [started, setStarted] = useState(false);

  const result = useMemo(() => diffLines(left, right), [left, right]);
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
        <div className="flex flex-wrap gap-3 text-sm">
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
                      row.right.type === "empty" && "bg-[var(--surface-2)]/40",
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
