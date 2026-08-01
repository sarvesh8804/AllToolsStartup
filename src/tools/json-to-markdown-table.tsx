"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  SAMPLE_JSON_TO_MARKDOWN_TABLE,
  jsonToMarkdownTable,
} from "@/lib/format/json-to-markdown-table";
import type { CellAlign } from "@/lib/text/markdown-table";
import { track } from "@/lib/analytics";

export function JsonToMarkdownTableTool() {
  const [input, setInput] = useState(SAMPLE_JSON_TO_MARKDOWN_TABLE);
  const [pretty, setPretty] = useState(true);
  const [sortKeys, setSortKeys] = useState(false);
  const [align, setAlign] = useState<CellAlign>("left");
  const [started, setStarted] = useState(false);

  const result = useMemo(
    () =>
      jsonToMarkdownTable(input, {
        pretty,
        sortKeys,
        alignment: align,
      }),
    [input, pretty, sortKeys, align],
  );

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "json-to-markdown-table",
        family: "tools",
      });
    }
  }, [started]);

  const touch = () => {
    markStart();
    if (result.ok) {
      track({
        name: "tool_complete",
        tool: "json-to-markdown-table",
        family: "tools",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          Column align
          <select
            value={align}
            onChange={(e) => {
              touch();
              setAlign(e.target.value as CellAlign);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[var(--foreground)]"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </label>
        {result.ok ? (
          <p className="text-sm text-[var(--muted)]">
            {result.rowCount} rows · {result.columnCount} columns
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={pretty}
            onChange={(e) => {
              touch();
              setPretty(e.target.checked);
            }}
          />
          Pretty columns
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={sortKeys}
            onChange={(e) => {
              touch();
              setSortKeys(e.target.checked);
            }}
          />
          Sort column keys A–Z
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="JSON input" getText={() => input} />
          <CodeEditor
            language="json"
            value={input}
            onChange={(v) => {
              markStart();
              setInput(v);
            }}
            minHeight="16rem"
          />
        </div>
        <div>
          <EditorPaneHeader
            label="Markdown table"
            getText={() => (result.ok ? result.markdown : "")}
          />
          {!result.ok ? (
            <ToolErrorState message={result.error} />
          ) : (
            <CodeEditor
              language="markdown"
              value={result.markdown}
              editable={false}
              minHeight="16rem"
            />
          )}
        </div>
      </div>
    </div>
  );
}
