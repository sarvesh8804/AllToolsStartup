"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  SAMPLE_TEXT_MORSE,
  textToMorse,
  type TextToMorseOptions,
} from "@/lib/text/morse";
import { track } from "@/lib/analytics";

export function TextToMorseTool() {
  const [input, setInput] = useState(SAMPLE_TEXT_MORSE);
  const [wordSeparator, setWordSeparator] =
    useState<TextToMorseOptions["wordSeparator"]>("/");
  const [started, setStarted] = useState(false);

  const result = useMemo(
    () => textToMorse(input, { wordSeparator }),
    [input, wordSeparator],
  );

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "text-to-morse", family: "tools" });
    }
  }, [started]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <button
          type="button"
          onClick={() => {
            markStart();
            setInput(SAMPLE_TEXT_MORSE);
          }}
          className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] hover:border-[var(--accent)]/50 hover:text-[var(--foreground)]"
        >
          Sample: HELLO WORLD!
        </button>
        <button
          type="button"
          onClick={() => {
            markStart();
            setInput("SOS");
          }}
          className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] hover:border-[var(--accent)]/50 hover:text-[var(--foreground)]"
        >
          Sample: SOS
        </button>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Word separator
          <select
            value={wordSeparator}
            onChange={(e) => {
              markStart();
              setWordSeparator(e.target.value as "/" | "|");
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
          >
            <option value="/">Slash (/)</option>
            <option value="|">Pipe (|)</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="Plain text" getText={() => input} />
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
            label="Morse code"
            getText={() => (result.ok ? result.morse : "")}
          />
          {result.ok ? (
            <CodeEditor
              value={result.morse}
              editable={false}
              minHeight="55vh"
            />
          ) : (
            <ToolErrorState message={result.error} />
          )}
        </div>
      </div>

      <p className="text-xs text-[var(--muted)]">
        Encodes A–Z, 0–9, and common punctuation. Pair with{" "}
        <span className="text-[var(--foreground)]">Morse to Text</span> to
        decode results.
      </p>
    </div>
  );
}
