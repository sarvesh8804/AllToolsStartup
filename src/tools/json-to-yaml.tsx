"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { jsonToYaml } from "@/lib/format/json-yaml";
import { track } from "@/lib/analytics";

const SAMPLE = `{
  "name": "Forge",
  "tagline": "Everything you need. One website.",
  "local": true,
  "tools": ["json-to-yaml", "csv-to-json"],
  "meta": { "version": 1 }
}`;

export function JsonToYamlTool() {
  const [input, setInput] = useState(SAMPLE);
  const [started, setStarted] = useState(false);

  const result = useMemo(() => jsonToYaml(input), [input]);

  const onChange = useCallback(
    (v: string) => {
      if (!started) {
        setStarted(true);
        track({ name: "tool_start", tool: "json-to-yaml", family: "tools" });
      }
      setInput(v);
    },
    [started],
  );

  return (
    <div className="space-y-4">
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
            label="YAML"
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
