"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  SAMPLE_JSON_PATH,
  SAMPLE_JSON_PATH_EXPR,
  testJsonPath,
} from "@/lib/json/path";
import { track } from "@/lib/analytics";

export function JsonPathTesterTool() {
  const [json, setJson] = useState(SAMPLE_JSON_PATH);
  const [path, setPath] = useState(SAMPLE_JSON_PATH_EXPR);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "json-path-tester", family: "tools" });
    }
  }, [started]);

  const result = useMemo(() => testJsonPath(json, path), [json, path]);

  const output = result.ok
    ? JSON.stringify(result.matches, null, 2)
  : "";

  return (
    <div className="space-y-4">
      <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
        JSON Path
        <input
          value={path}
          onChange={(e) => {
            markStart();
            setPath(e.target.value);
          }}
          className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
          spellCheck={false}
          aria-label="JSON Path expression"
        />
      </label>

      {!result.ok ? <ToolErrorState message={result.error} /> : (
        <p className="text-sm text-[var(--muted)]">
          {result.count} match{result.count === 1 ? "" : "es"}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="JSON" getText={() => json} />
          <CodeEditor
            language="json"
            value={json}
            onChange={(v) => {
              markStart();
              setJson(v);
            }}
            minHeight="50vh"
          />
        </div>
        <div>
          <EditorPaneHeader label="Matches" getText={() => output} />
          <CodeEditor language="json" value={output} editable={false} minHeight="50vh" />
        </div>
      </div>
      <p className="text-xs text-[var(--muted)]">
        Supports dot keys, bracket indexes, and [*] wildcards on arrays.
      </p>
    </div>
  );
}
