"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  SAMPLE_BINARY_ENCODED,
  SAMPLE_BINARY_TEXT,
  convertBinary,
  type BinaryMode,
  type BinarySeparator,
} from "@/lib/encoding/binary";
import { track } from "@/lib/analytics";

export function BinaryEncodeDecodeTool() {
  const [mode, setMode] = useState<BinaryMode>("encode");
  const [separator, setSeparator] = useState<BinarySeparator>("space");
  const [input, setInput] = useState(SAMPLE_BINARY_TEXT);
  const [started, setStarted] = useState(false);

  const result = useMemo(
    () => convertBinary(input, mode, { separator }),
    [input, mode, separator],
  );

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "binary-encode-decode",
        family: "tools",
      });
    }
  }, [started]);

  const switchMode = (next: BinaryMode) => {
    markStart();
    setMode(next);
    if (result.ok) {
      setInput(result.output);
    } else if (next === "encode") {
      setInput(SAMPLE_BINARY_TEXT);
    } else {
      setInput(SAMPLE_BINARY_ENCODED);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div
          role="tablist"
          aria-label="Binary mode"
          className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 text-sm"
        >
          {(["encode", "decode"] as BinaryMode[]).map((m) => (
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
              {m === "encode" ? "Encode" : "Decode"}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          Byte separator
          <select
            value={separator}
            onChange={(e) => {
              markStart();
              setSeparator(e.target.value as BinarySeparator);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[var(--foreground)]"
          >
            <option value="space">Space between bytes</option>
            <option value="none">No separator</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader
            label={mode === "encode" ? "Plain text" : "Binary input"}
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
            label={mode === "encode" ? "Binary output" : "Decoded text"}
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
        UTF-8 bytes encoded as 8-bit groups of 0 and 1. Decode expects only
        binary digits with optional spaces between bytes.
      </p>
    </div>
  );
}
