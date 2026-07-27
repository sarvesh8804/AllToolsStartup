"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { formatGraphql, minifyGraphql } from "@/lib/format/graphql";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

const SAMPLE = `query GetUser($id: ID!) { user(id: $id) { id name email posts { title } } }`;

export function GraphqlFormatterTool() {
  const [input, setInput] = useState(SAMPLE);
  const [mode, setMode] = useState<"pretty" | "minify">("pretty");
  const [indent, setIndent] = useState(2);
  const [started, setStarted] = useState(false);

  const result = useMemo(
    () =>
      mode === "pretty"
        ? formatGraphql(input, indent)
        : minifyGraphql(input),
    [input, mode, indent],
  );

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "graphql-formatter",
        family: "tools",
      });
    }
  }, [started]);

  const onChange = (v: string) => {
    markStart();
    setInput(v);
    track({
      name: "tool_complete",
      tool: "graphql-formatter",
      family: "tools",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {(
            [
              ["pretty", "Pretty"],
              ["minify", "Minify"],
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
                "rounded-md border px-2.5 py-1 text-sm",
                mode === value
                  ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--foreground)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/50",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        {mode === "pretty" ? (
          <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
            Indent
            <select
              value={indent}
              onChange={(e) => {
                markStart();
                setIndent(Number(e.target.value));
              }}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[var(--foreground)]"
            >
              <option value={2}>2 spaces</option>
              <option value={4}>4 spaces</option>
            </select>
          </label>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="GraphQL" getText={() => input} />
          <CodeEditor
            language="text"
            value={input}
            onChange={onChange}
            minHeight="50vh"
          />
        </div>
        <div>
          <EditorPaneHeader
            label={mode === "pretty" ? "Formatted" : "Minified"}
            getText={() => (result.ok ? result.text : "")}
          />
          {result.ok ? (
            <CodeEditor
              language="text"
              value={result.text}
              editable={false}
              minHeight="50vh"
            />
          ) : (
            <ToolErrorState message={result.error} />
          )}
        </div>
      </div>
    </div>
  );
}
