"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { formatYaml, minifyYaml } from "@/lib/format/yaml";
import { track } from "@/lib/analytics";

const SAMPLE = `name: Forge
tagline: Everything you need. One website.
local: true
tools:
  - yaml-formatter
  - css-flexbox-playground
meta: { version: 1, category: config }
`;

export function YamlFormatterTool() {
  const [input, setInput] = useState(SAMPLE);
  const [indent, setIndent] = useState(2);
  const [sortKeys, setSortKeys] = useState(false);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "yaml-formatter", family: "tools" });
    }
  }, [started]);

  const result = useMemo(
    () => formatYaml(input, { indent, sortKeys }),
    [input, indent, sortKeys],
  );

  const onChange = useCallback(
    (v: string) => {
      markStart();
      setInput(v);
      track({ name: "tool_complete", tool: "yaml-formatter", family: "tools" });
    },
    [markStart],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          Indent
          <select
            value={indent}
            onChange={(e) => {
              markStart();
              setIndent(Number(e.target.value));
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[var(--foreground)]"
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={sortKeys}
            onChange={(e) => {
              markStart();
              setSortKeys(e.target.checked);
            }}
          />
          Sort keys
        </label>
        <button
          type="button"
          onClick={() => {
            markStart();
            const min = minifyYaml(input, { sortKeys });
            if (min.ok) setInput(min.yaml);
          }}
          className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]/50"
        >
          Minify into input
        </button>
      </div>

      {!result.ok ? <ToolErrorState message={result.error} /> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="YAML" getText={() => input} />
          <CodeEditor
            language="text"
            value={input}
            onChange={onChange}
            minHeight="60vh"
          />
        </div>
        <div>
          <EditorPaneHeader
            label="Formatted"
            getText={() => (result.ok ? result.yaml : "")}
          />
          <CodeEditor
            language="text"
            value={result.ok ? result.yaml : ""}
            editable={false}
            minHeight="60vh"
          />
        </div>
      </div>
    </div>
  );
}
