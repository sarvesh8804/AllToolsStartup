"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { jsonToTypescript } from "@/lib/json/to-typescript";
import { track } from "@/lib/analytics";

const SAMPLE = `{
  "name": "Forge",
  "local": true,
  "version": 1,
  "tools": ["json-formatter", "business-days-calculator"],
  "meta": {
    "category": "devtools",
    "tags": ["privacy", "local"]
  },
  "authors": [
    { "id": 1, "name": "Ada" },
    { "id": 2 }
  ]
}`;

export function JsonToTypescriptInterfaceTool() {
  const [input, setInput] = useState(SAMPLE);
  const [rootName, setRootName] = useState("Root");
  const [useInterface, setUseInterface] = useState(true);
  const [exportTypes, setExportTypes] = useState(true);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "json-to-typescript-interface",
        family: "tools",
      });
    }
  }, [started]);

  const result = useMemo(
    () =>
      jsonToTypescript(input, {
        rootName,
        useInterface,
        exportTypes,
      }),
    [input, rootName, useInterface, exportTypes],
  );

  const onChange = useCallback(
    (v: string) => {
      markStart();
      setInput(v);
      track({
        name: "tool_complete",
        tool: "json-to-typescript-interface",
        family: "tools",
      });
    },
    [markStart],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          Root name
          <input
            value={rootName}
            onChange={(e) => {
              markStart();
              setRootName(e.target.value);
            }}
            className="w-36 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={useInterface}
            onChange={(e) => {
              markStart();
              setUseInterface(e.target.checked);
            }}
          />
          Use interface
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={exportTypes}
            onChange={(e) => {
              markStart();
              setExportTypes(e.target.checked);
            }}
          />
          Export types
        </label>
      </div>

      {!result.ok ? <ToolErrorState message={result.error} /> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="JSON" getText={() => input} />
          <CodeEditor
            language="json"
            value={input}
            onChange={onChange}
            minHeight="60vh"
          />
        </div>
        <div>
          <EditorPaneHeader
            label="TypeScript"
            getText={() => (result.ok ? result.typescript : "")}
          />
          <CodeEditor
            language="text"
            value={result.ok ? result.typescript : ""}
            editable={false}
            minHeight="60vh"
          />
        </div>
      </div>
    </div>
  );
}
