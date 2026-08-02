"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  SAMPLE_MARKDOWN_TOC,
  generateMarkdownToc,
  type TocStyle,
} from "@/lib/text/markdown-toc";
import { track } from "@/lib/analytics";

export function MarkdownTocGeneratorTool() {
  const [input, setInput] = useState(SAMPLE_MARKDOWN_TOC);
  const [style, setStyle] = useState<TocStyle>("bullet");
  const [minLevel, setMinLevel] = useState(1);
  const [maxLevel, setMaxLevel] = useState(6);
  const [started, setStarted] = useState(false);

  const result = useMemo(
    () =>
      generateMarkdownToc(input, {
        style,
        minLevel,
        maxLevel,
      }),
    [input, style, minLevel, maxLevel],
  );

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "markdown-toc-generator",
        family: "tools",
      });
    }
  }, [started]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Style
          <select
            value={style}
            onChange={(e) => {
              markStart();
              setStyle(e.target.value as TocStyle);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
          >
            <option value="bullet">Bullet list</option>
            <option value="numbered">Numbered list</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Min level
          <select
            value={minLevel}
            onChange={(e) => {
              markStart();
              setMinLevel(Number(e.target.value));
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                H{n}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Max level
          <select
            value={maxLevel}
            onChange={(e) => {
              markStart();
              setMaxLevel(Number(e.target.value));
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
          >
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>
                H{n}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="Markdown source" getText={() => input} />
          <CodeEditor
            language="markdown"
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
            label="Table of contents"
            getText={() => (result.ok ? result.toc : "")}
          />
          {result.ok ? (
            <CodeEditor
              language="markdown"
              value={result.toc}
              editable={false}
              minHeight="60vh"
            />
          ) : (
            <ToolErrorState message={result.error} />
          )}
        </div>
      </div>

      {result.ok ? (
        <p className="text-xs text-[var(--muted)]">
          Found {result.headings.length} heading
          {result.headings.length === 1 ? "" : "s"}. Anchor slugs follow
          GitHub-style rules for compatibility with most Markdown renderers.
        </p>
      ) : null}
    </div>
  );
}
