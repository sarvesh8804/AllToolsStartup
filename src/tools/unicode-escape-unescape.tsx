"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  SAMPLE_UNICODE_ESCAPED,
  SAMPLE_UNICODE_TEXT,
  convertUnicodeEscape,
  type UnicodeEscapeMode,
} from "@/lib/encoding/unicode-escape";
import { track } from "@/lib/analytics";

export function UnicodeEscapeUnescapeTool() {
  const [mode, setMode] = useState<UnicodeEscapeMode>("escape");
  const [escapeAscii, setEscapeAscii] = useState(false);
  const [uppercase, setUppercase] = useState(false);
  const [input, setInput] = useState(SAMPLE_UNICODE_TEXT);
  const [started, setStarted] = useState(false);

  const result = useMemo(
    () => convertUnicodeEscape(input, mode, { escapeAscii, uppercase }),
    [input, mode, escapeAscii, uppercase],
  );

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "unicode-escape-unescape",
        family: "tools",
      });
    }
  }, [started]);

  const switchMode = (next: UnicodeEscapeMode) => {
    markStart();
    setMode(next);
    if (result.ok) {
      setInput(result.output);
    } else if (next === "escape") {
      setInput(SAMPLE_UNICODE_TEXT);
    } else {
      setInput(SAMPLE_UNICODE_ESCAPED);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div
          role="tablist"
          aria-label="Unicode mode"
          className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 text-sm"
        >
          {(["escape", "unescape"] as UnicodeEscapeMode[]).map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              type="button"
              onClick={() => switchMode(m)}
              className={
                mode === m
                  ? "rounded-md bg-[var(--accent)] px-4 py-1.5 font-medium text-[var(--ink)]"
                  : "rounded-md px-4 py-1.5 text-[var(--muted)] hover:text-[var(--foreground)]"
              }
            >
              {m === "escape" ? "Escape" : "Unescape"}
            </button>
          ))}
        </div>

        {mode === "escape" ? (
          <>
            <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
              <input
                type="checkbox"
                checked={escapeAscii}
                onChange={(e) => {
                  markStart();
                  setEscapeAscii(e.target.checked);
                }}
              />
              Escape ASCII too
            </label>
            <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => {
                  markStart();
                  setUppercase(e.target.checked);
                }}
              />
              Uppercase hex
            </label>
          </>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader
            label={mode === "escape" ? "Plain text" : "Escaped input"}
            getText={() => input}
          />
          <CodeEditor
            value={input}
            onChange={(v) => {
              markStart();
              setInput(v);
            }}
            minHeight="55vh"
          />
        </div>
        <div>
          <EditorPaneHeader
            label={mode === "escape" ? "Escaped output" : "Decoded text"}
            getText={() => (result.ok ? result.output : "")}
          />
          {!result.ok ? (
            <ToolErrorState message={result.error} />
          ) : (
            <CodeEditor
              value={result.output}
              editable={false}
              minHeight="55vh"
            />
          )}
        </div>
      </div>

      <p className="text-xs text-[var(--muted)]">
        Supports JavaScript-style <code>\uXXXX</code>,{" "}
        <code>\u{"{1F680}"}</code>, <code>\xNN</code>, and common short escapes
        like <code>\n</code>.
      </p>
    </div>
  );
}
