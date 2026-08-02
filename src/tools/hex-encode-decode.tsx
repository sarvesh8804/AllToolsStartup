"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  SAMPLE_HEX_ENCODED,
  SAMPLE_HEX_TEXT,
  convertHex,
  type HexMode,
  type HexSeparator,
} from "@/lib/encoding/hex";
import { track } from "@/lib/analytics";

export function HexEncodeDecodeTool() {
  const [mode, setMode] = useState<HexMode>("encode");
  const [separator, setSeparator] = useState<HexSeparator>("none");
  const [uppercase, setUppercase] = useState(false);
  const [input, setInput] = useState(SAMPLE_HEX_TEXT);
  const [started, setStarted] = useState(false);

  const result = useMemo(
    () => convertHex(input, mode, { separator, uppercase }),
    [input, mode, separator, uppercase],
  );

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "hex-encode-decode",
        family: "tools",
      });
    }
  }, [started]);

  const switchMode = (next: HexMode) => {
    markStart();
    setMode(next);
    if (result.ok) {
      setInput(result.output);
    } else if (next === "encode") {
      setInput(SAMPLE_HEX_TEXT);
    } else {
      setInput(SAMPLE_HEX_ENCODED);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div
          role="tablist"
          aria-label="Hex mode"
          className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 text-sm"
        >
          {(["encode", "decode"] as HexMode[]).map((m) => (
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

        {mode === "encode" ? (
          <>
            <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
              Byte separator
              <select
                value={separator}
                onChange={(e) => {
                  markStart();
                  setSeparator(e.target.value as HexSeparator);
                }}
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[var(--foreground)]"
              >
                <option value="none">None</option>
                <option value="space">Space</option>
              </select>
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
              Uppercase
            </label>
          </>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader
            label={mode === "encode" ? "Plain text" : "Hex input"}
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
            label={mode === "encode" ? "Hex output" : "Decoded text"}
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
        UTF-8 bytes as hexadecimal pairs. Decode accepts spaces and optional{" "}
        <code>0x</code> prefixes.
      </p>
    </div>
  );
}
