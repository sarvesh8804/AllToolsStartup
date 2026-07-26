"use client";

import { useCallback, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { validateJson, type JsonValidation } from "@/lib/json/validate";
import { track } from "@/lib/analytics";

const SAMPLE = `{
  "ok": true,
  "items": [1, 2, 3]
}`;

export function JsonValidatorTool() {
  const [input, setInput] = useState(SAMPLE);
  const [result, setResult] = useState<JsonValidation>(() =>
    validateJson(SAMPLE),
  );
  const [started, setStarted] = useState(false);

  const run = useCallback(
    (raw: string) => {
      if (!started) {
        setStarted(true);
        track({ name: "tool_start", tool: "json-validator", family: "tools" });
      }
      const next = validateJson(raw);
      setResult(next);
      if (next.ok) {
        track({
          name: "tool_complete",
          tool: "json-validator",
          family: "tools",
        });
      }
    },
    [started],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => run(input)}
          className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--accent-bright)]"
        >
          Validate
        </button>
        <button
          type="button"
          onClick={() => {
            setInput(SAMPLE);
            run(SAMPLE);
          }}
          className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]/50"
        >
          Reset sample
        </button>
      </div>

      {result.ok ? (
        <div
          role="status"
          className="rounded-xl border border-[var(--success-border)] bg-[var(--success-bg)] px-4 py-3 text-sm text-[var(--success)]"
        >
          {result.message}
        </div>
      ) : (
        <ToolErrorState
          message={
            result.line
              ? `${result.message} (line ${result.line}, column ${result.column})`
              : result.message
          }
        />
      )}

      <div>
        <EditorPaneHeader label="JSON" getText={() => input} copyLabel="Copy" />
        <CodeEditor
          language="json"
          value={input}
          onChange={(v) => {
            setInput(v);
            run(v);
          }}
          minHeight="70vh"
        />
      </div>
    </div>
  );
}
