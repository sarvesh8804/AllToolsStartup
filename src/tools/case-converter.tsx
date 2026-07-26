"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import {
  CASE_STYLES,
  convertCase,
  type CaseStyle,
} from "@/lib/text/case";
import { track } from "@/lib/analytics";

const SAMPLE = "hello world from Forge tools";

export function CaseConverterTool() {
  const [input, setInput] = useState(SAMPLE);
  const [style, setStyle] = useState<CaseStyle>("camel");
  const [started, setStarted] = useState(false);

  const output = useMemo(() => convertCase(input, style), [input, style]);

  const onChange = useCallback(
    (v: string) => {
      if (!started) {
        setStarted(true);
        track({ name: "tool_start", tool: "case-converter", family: "tools" });
      }
      setInput(v);
    },
    [started],
  );

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label="Case style"
        className="flex flex-wrap gap-2"
      >
        {CASE_STYLES.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={style === s.id}
            onClick={() => setStyle(s.id)}
            className={
              style === s.id
                ? "rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--ink)]"
                : "rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] hover:border-[var(--accent)]/50 hover:text-[var(--foreground)]"
            }
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="Input" getText={() => input} />
          <CodeEditor
            language="text"
            value={input}
            onChange={onChange}
            minHeight="55vh"
          />
        </div>
        <div>
          <EditorPaneHeader label="Output" getText={() => output} />
          <CodeEditor
            language="text"
            value={output}
            editable={false}
            minHeight="55vh"
          />
        </div>
      </div>
    </div>
  );
}
