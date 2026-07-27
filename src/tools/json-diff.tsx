"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { CopyButton } from "@/components/editor/CopyButton";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  diffJson,
  formatJsonValue,
  type JsonDiffKind,
} from "@/lib/json/diff";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

const LEFT = `{
  "name": "Ada",
  "age": 30,
  "roles": ["admin", "editor"],
  "meta": { "active": true }
}`;

const RIGHT = `{
  "name": "Ada",
  "age": 31,
  "roles": ["admin", "viewer"],
  "meta": { "active": true, "plan": "pro" }
}`;

const KIND_STYLE: Record<JsonDiffKind, string> = {
  added: "text-[var(--success)]",
  removed: "text-[var(--danger)]",
  changed: "text-[var(--accent-bright)]",
};

export function JsonDiffTool() {
  const [left, setLeft] = useState(LEFT);
  const [right, setRight] = useState(RIGHT);
  const [view, setView] = useState<"structural" | "text">("structural");
  const [started, setStarted] = useState(false);

  const result = useMemo(() => diffJson(left, right), [left, right]);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "json-diff", family: "tools" });
    }
  }, [started]);

  const onEdit = (side: "left" | "right", value: string) => {
    markStart();
    if (side === "left") setLeft(value);
    else setRight(value);
    track({ name: "tool_complete", tool: "json-diff", family: "tools" });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["structural", "Paths"],
                ["text", "Text unified"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  markStart();
                  setView(value);
                }}
                className={cn(
                  "rounded-md border px-3 py-1.5 text-sm transition",
                  view === value
                    ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--foreground)]"
                    : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/50",
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {result.ok ? (
            <>
              <Stat label="Added" value={result.stats.added} tone="add" />
              <Stat label="Removed" value={result.stats.removed} tone="del" />
              <Stat label="Changed" value={result.stats.changed} tone="chg" />
              {result.equal ? (
                <span className="text-sm text-[var(--success)]">Identical</span>
              ) : null}
            </>
          ) : null}
        </div>
        {result.ok ? (
          <CopyButton getText={() => result.textDiff} label="Copy text diff" />
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="Original" getText={() => left} />
          <CodeEditor
            language="json"
            value={left}
            onChange={(v) => onEdit("left", v)}
            minHeight="28vh"
          />
        </div>
        <div>
          <EditorPaneHeader label="Modified" getText={() => right} />
          <CodeEditor
            language="json"
            value={right}
            onChange={(v) => onEdit("right", v)}
            minHeight="28vh"
          />
        </div>
      </div>

      {!result.ok ? <ToolErrorState message={result.error} /> : null}

      {result.ok && view === "structural" ? (
        <div className="overflow-hidden rounded-xl border border-[var(--border)]">
          {result.equal ? (
            <p className="px-4 py-6 text-center text-sm text-[var(--muted)]">
              No structural differences (key order ignored).
            </p>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {result.changes.map((c) => (
                <div key={`${c.kind}-${c.path}`} className="px-4 py-3">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <code className="font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]">
                      {c.path}
                    </code>
                    <span
                      className={cn(
                        "text-xs uppercase tracking-wide",
                        KIND_STYLE[c.kind],
                      )}
                    >
                      {c.kind}
                    </span>
                  </div>
                  {c.kind === "changed" ? (
                    <p className="mt-1 break-all font-[family-name:var(--font-mono)] text-sm text-[var(--muted)]">
                      <span className="text-[var(--danger)]">
                        {formatJsonValue(c.before)}
                      </span>
                      {" → "}
                      <span className="text-[var(--success)]">
                        {formatJsonValue(c.after)}
                      </span>
                    </p>
                  ) : null}
                  {c.kind === "added" ? (
                    <p className="mt-1 break-all font-[family-name:var(--font-mono)] text-sm text-[var(--success)]">
                      {formatJsonValue(c.after)}
                    </p>
                  ) : null}
                  {c.kind === "removed" ? (
                    <p className="mt-1 break-all font-[family-name:var(--font-mono)] text-sm text-[var(--danger)]">
                      {formatJsonValue(c.before)}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {result.ok && view === "text" ? (
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
            Unified text diff (sorted keys)
          </p>
          <pre className="overflow-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 font-[family-name:var(--font-mono)] text-xs sm:text-sm">
            {result.textDiff.split("\n").map((line, i) => (
              <div
                key={i}
                className={cn(
                  line.startsWith("+ ") && "bg-[var(--success-bg)] text-[var(--success)]",
                  line.startsWith("- ") && "bg-[var(--danger-bg)] text-[var(--danger)]",
                )}
              >
                {line || " "}
              </div>
            ))}
          </pre>
        </div>
      ) : null}
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
  tone: "add" | "del" | "chg";
}) {
  const color =
    tone === "add"
      ? "text-[var(--success)]"
      : tone === "del"
        ? "text-[var(--danger)]"
        : "text-[var(--accent-bright)]";
  return (
    <span className="text-sm text-[var(--muted)]">
      {label}{" "}
      <span className={cn("font-medium", color)}>{value}</span>
    </span>
  );
}
