"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  decodeBase64,
  encodeBase64,
} from "@/lib/encoding/base64";
import { track } from "@/lib/analytics";

type Mode = "encode" | "decode";

const SAMPLE = "Forge — everything you need. One website.";

export function Base64Tool() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState(SAMPLE);
  const [started, setStarted] = useState(false);

  const { output, error } = useMemo(() => {
    try {
      const value =
        mode === "encode" ? encodeBase64(input) : decodeBase64(input);
      return { output: value, error: null as string | null };
    } catch {
      return {
        output: "",
        error:
          mode === "decode"
            ? "That input is not valid Base64."
            : "Unable to encode input.",
      };
    }
  }, [mode, input]);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "base64-encode-decode", family: "tools" });
    }
  }, [started]);

  const switchMode = (next: Mode) => {
    setMode(next);
    if (!error && output) setInput(output);
  };

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label="Base64 mode"
        className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 text-sm"
      >
        {(["encode", "decode"] as Mode[]).map((m) => (
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

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader
            label={mode === "encode" ? "Plain text" : "Base64"}
            getText={() => input}
          />
          <CodeEditor
            language="text"
            value={input}
            onChange={(v) => {
              markStart();
              setInput(v);
            }}
            minHeight="60vh"
          />
        </div>
        <div>
          <EditorPaneHeader
            label={mode === "encode" ? "Base64" : "Plain text"}
            getText={() => output}
          />
          {error ? (
            <ToolErrorState message={error} />
          ) : (
            <CodeEditor
              language="text"
              value={output}
              editable={false}
              minHeight="60vh"
            />
          )}
        </div>
      </div>
    </div>
  );
}
