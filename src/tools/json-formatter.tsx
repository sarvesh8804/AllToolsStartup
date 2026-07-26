"use client";

import { useCallback, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { DownloadButton } from "@/components/editor/DownloadButton";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { formatJson, minifyJson } from "@/lib/json/format";
import { track } from "@/lib/analytics";

const SAMPLE = `{
  "name": "Forge",
  "tagline": "Everything you need. One website.",
  "local": true
}`;

export function JsonFormatterTool() {
  const [input, setInput] = useState(SAMPLE);
  const [indent, setIndent] = useState(2);
  const [output, setOutput] = useState(() => formatJson(SAMPLE, 2));
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const format = useCallback(
    (raw: string, spaces: number) => {
      if (!started) {
        setStarted(true);
        track({ name: "tool_start", tool: "json-formatter", family: "tools" });
      }
      try {
        const pretty = formatJson(raw, spaces);
        setOutput(pretty);
        setError(null);
        track({
          name: "tool_complete",
          tool: "json-formatter",
          family: "tools",
        });
      } catch (e) {
        setOutput("");
        setError(e instanceof Error ? e.message : "Invalid JSON");
      }
    },
    [started],
  );

  const minify = () => {
    try {
      const mini = minifyJson(input);
      setInput(mini);
      setOutput(mini);
      setError(null);
      track({ name: "tool_complete", tool: "json-formatter", family: "tools" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          Indent
          <select
            value={indent}
            onChange={(e) => {
              const next = Number(e.target.value);
              setIndent(next);
              format(input, next);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[var(--foreground)]"
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value={0}>Minified</option>
          </select>
        </label>
        <button
          type="button"
          onClick={() => format(input, indent)}
          className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--ink)] hover:bg-[var(--accent-bright)]"
        >
          Format
        </button>
        <button
          type="button"
          onClick={minify}
          className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]/50"
        >
          Minify
        </button>
        <DownloadButton
          filename="formatted.json"
          getBlob={() => output || input}
        />
      </div>

      {error ? <ToolErrorState message={error} /> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="min-w-0">
          <EditorPaneHeader label="Input" getText={() => input} copyLabel="Copy" />
          <CodeEditor
            language="json"
            value={input}
            onChange={(v) => {
              setInput(v);
              format(v, indent);
            }}
            minHeight="70vh"
          />
        </div>
        <div className="min-w-0">
          <EditorPaneHeader
            label="Output"
            getText={() => output}
            copyLabel="Copy"
          />
          <CodeEditor
            language="json"
            value={output}
            editable={false}
            minHeight="70vh"
          />
        </div>
      </div>
    </div>
  );
}
