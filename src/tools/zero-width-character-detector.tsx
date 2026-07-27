"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { CopyButton } from "@/components/editor/CopyButton";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { scanZeroWidth } from "@/lib/text/zero-width";
import { track } from "@/lib/analytics";

const SAMPLE = `Hello\u200B world\uFEFF — paste text with hidden\u200Dchars.`;

export function ZeroWidthCharacterDetectorTool() {
  const [input, setInput] = useState(SAMPLE);
  const [started, setStarted] = useState(false);

  const result = useMemo(() => scanZeroWidth(input), [input]);

  const onChange = useCallback(
    (v: string) => {
      if (!started) {
        setStarted(true);
        track({
          name: "tool_start",
          tool: "zero-width-character-detector",
          family: "tools",
        });
      }
      setInput(v);
      track({
        name: "tool_complete",
        tool: "zero-width-character-detector",
        family: "tools",
      });
    },
    [started],
  );

  const applyCleaned = () => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "zero-width-character-detector",
        family: "tools",
      });
    }
    setInput(result.cleaned);
    track({
      name: "tool_complete",
      tool: "zero-width-character-detector",
      family: "tools",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--muted)]">
          Found{" "}
          <span className="font-[family-name:var(--font-mono)] text-[var(--foreground)]">
            {result.count}
          </span>{" "}
          invisible
          {result.uniqueCodes.length > 0 ? (
            <>
              {" "}
              ·{" "}
              <span className="font-[family-name:var(--font-mono)] text-[var(--foreground)]">
                {result.uniqueCodes.join(", ")}
              </span>
            </>
          ) : null}
        </span>
        <button
          type="button"
          onClick={applyCleaned}
          disabled={result.count === 0}
          className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--ink)] disabled:opacity-40"
        >
          Strip & replace input
        </button>
        <CopyButton getText={() => result.cleaned} label="Copy cleaned" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="Input" getText={() => input} />
          <CodeEditor
            language="text"
            value={input}
            onChange={onChange}
            minHeight="36vh"
          />
        </div>
        <div>
          <EditorPaneHeader
            label="Highlighted (⟨markers⟩)"
            getText={() => result.highlighted}
          />
          <CodeEditor
            language="text"
            value={result.highlighted}
            editable={false}
            minHeight="36vh"
          />
        </div>
      </div>

      {result.matches.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-[var(--border)]">
          <div className="border-b border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)]">
            Matches
          </div>
          <div className="max-h-64 overflow-auto divide-y divide-[var(--border)]">
            {result.matches.map((m, i) => (
              <div
                key={`${m.index}-${m.code}-${i}`}
                className="flex flex-wrap gap-3 px-4 py-2 text-sm"
              >
                <code className="font-[family-name:var(--font-mono)] text-[var(--foreground)]">
                  {m.code}
                </code>
                <span className="text-[var(--muted)]">{m.name}</span>
                <span className="text-[var(--muted)]">index {m.index}</span>
                <span className="font-[family-name:var(--font-mono)] text-[var(--accent-bright)]">
                  ⟨{m.label}⟩
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-[var(--muted)]">
          No known zero-width or invisible characters detected.
        </p>
      )}
    </div>
  );
}
