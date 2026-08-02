"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { SAMPLE_MORSE, morseToText } from "@/lib/text/morse";
import { track } from "@/lib/analytics";

export function MorseToTextTool() {
  const [input, setInput] = useState(SAMPLE_MORSE);
  const [started, setStarted] = useState(false);

  const result = useMemo(() => morseToText(input), [input]);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "morse-to-text", family: "tools" });
    }
  }, [started]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            markStart();
            setInput(SAMPLE_MORSE);
          }}
          className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] hover:border-[var(--accent)]/50 hover:text-[var(--foreground)]"
        >
          Sample: HELLO WORLD!
        </button>
        <button
          type="button"
          onClick={() => {
            markStart();
            setInput("... --- ...");
          }}
          className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] hover:border-[var(--accent)]/50 hover:text-[var(--foreground)]"
        >
          Sample: SOS
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="Morse code" getText={() => input} />
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
            label="Decoded text"
            getText={() => (result.ok ? result.text : "")}
          />
          {result.ok ? (
            <CodeEditor
              value={result.text}
              editable={false}
              minHeight="55vh"
            />
          ) : (
            <ToolErrorState message={result.error} />
          )}
        </div>
      </div>

      <p className="text-xs text-[var(--muted)]">
        Use spaces between letters and <code>/</code> or <code>|</code> between
        words. Supports A–Z, 0–9, and common punctuation.
      </p>
    </div>
  );
}
