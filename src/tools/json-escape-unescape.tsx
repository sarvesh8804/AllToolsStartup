"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  SAMPLE_JSON_ESCAPED,
  SAMPLE_JSON_TEXT,
  convertJsonEscape,
  type JsonEscapeMode,
} from "@/lib/encoding/json-escape";
import { track } from "@/lib/analytics";

export function JsonEscapeUnescapeTool() {
  const [mode, setMode] = useState<JsonEscapeMode>("escape");
  const [wrapQuotes, setWrapQuotes] = useState(true);
  const [input, setInput] = useState(SAMPLE_JSON_TEXT);
  const [started, setStarted] = useState(false);

  const result = useMemo(
    () => convertJsonEscape(input, mode, { wrapQuotes }),
    [input, mode, wrapQuotes],
  );

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "json-escape-unescape", family: "tools" });
    }
  }, [started]);

  const switchMode = (next: JsonEscapeMode) => {
    markStart();
    setMode(next);
    if (result.ok) setInput(result.output);
    else setInput(next === "escape" ? SAMPLE_JSON_TEXT : SAMPLE_JSON_ESCAPED);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div role="tablist" aria-label="JSON mode" className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 text-sm">
          {(["escape", "unescape"] as JsonEscapeMode[]).map((m) => (
            <button key={m} role="tab" aria-selected={mode === m} type="button" onClick={() => switchMode(m)}
              className={mode === m ? "rounded-md bg-[var(--accent)] px-4 py-1.5 font-medium text-[var(--ink)]" : "rounded-md px-4 py-1.5 text-[var(--muted)] hover:text-[var(--foreground)]"}>
              {m === "escape" ? "Escape" : "Unescape"}
            </button>
          ))}
        </div>
        {mode === "escape" ? (
          <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
            <input type="checkbox" checked={wrapQuotes} onChange={(e) => { markStart(); setWrapQuotes(e.target.checked); }} />
            Wrap in quotes
          </label>
        ) : null}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label={mode === "escape" ? "Plain text" : "Escaped input"} getText={() => input} />
          <CodeEditor value={input} onChange={(v) => { markStart(); setInput(v); }} minHeight="55vh" />
        </div>
        <div>
          <EditorPaneHeader label={mode === "escape" ? "JSON string" : "Decoded text"} getText={() => (result.ok ? result.output : "")} />
          {!result.ok ? <ToolErrorState message={result.error} /> : <CodeEditor value={result.output} editable={false} minHeight="55vh" />}
        </div>
      </div>
    </div>
  );
}
