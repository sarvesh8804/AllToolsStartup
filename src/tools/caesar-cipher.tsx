"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import {
  SAMPLE_CAESAR,
  caesarCipher,
  type CaesarMode,
} from "@/lib/text/caesar-cipher";
import { track } from "@/lib/analytics";

export function CaesarCipherTool() {
  const [mode, setMode] = useState<CaesarMode>("encode");
  const [shift, setShift] = useState(13);
  const [input, setInput] = useState(SAMPLE_CAESAR);
  const [started, setStarted] = useState(false);

  const output = useMemo(
    () => caesarCipher(input, shift, mode),
    [input, shift, mode],
  );

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "caesar-cipher", family: "tools" });
    }
  }, [started]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div
          role="tablist"
          aria-label="Cipher mode"
          className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 text-sm"
        >
          {(["encode", "decode"] as CaesarMode[]).map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              type="button"
              onClick={() => {
                markStart();
                setMode(m);
              }}
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

        <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-sm text-[var(--muted)] sm:max-w-xs">
          Shift ({shift})
          <input
            type="range"
            min={1}
            max={25}
            value={shift}
            onChange={(e) => {
              markStart();
              setShift(Number(e.target.value));
            }}
            className="accent-[var(--accent)]"
          />
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="Input" getText={() => input} />
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
          <EditorPaneHeader label="Output" getText={() => output} />
          <CodeEditor value={output} editable={false} minHeight="55vh" />
        </div>
      </div>

      <p className="text-xs text-[var(--muted)]">
        Letters shift through the alphabet; numbers, punctuation, and spaces stay
        unchanged. Shift 13 is classic ROT13 (encode and decode are identical).
      </p>
    </div>
  );
}
