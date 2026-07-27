"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { safeMinifyJson } from "@/lib/json/safe";
import { track } from "@/lib/analytics";

const SAMPLE = `{
  "name": "Forge",
  "tagline": "Everything you need. One website.",
  "tools": ["json-minifier", "json-formatter"],
  "local": true
}`;

export function JsonMinifierTool() {
  const [input, setInput] = useState(SAMPLE);
  const [started, setStarted] = useState(false);

  const result = useMemo(() => safeMinifyJson(input), [input]);
  const saved =
    result.ok && input.length > 0
      ? Math.max(0, Math.round((1 - result.json.length / input.length) * 100))
      : 0;

  const onChange = useCallback(
    (v: string) => {
      if (!started) {
        setStarted(true);
        track({ name: "tool_start", tool: "json-minifier", family: "tools" });
      }
      setInput(v);
    },
    [started],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {result.ok ? (
          <p className="text-sm text-[var(--muted)]">
            Output:{" "}
            <strong className="font-[family-name:var(--font-mono)] text-[var(--foreground)]">
              {result.chars}
            </strong>{" "}
            chars ({saved}% smaller than input)
          </p>
        ) : null}
        <Link
          href="/tools/json-formatter"
          className="text-sm text-[var(--copper-bright)] hover:underline"
        >
          Need pretty-print? JSON Formatter →
        </Link>
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
            label="Minified"
            getText={() => (result.ok ? result.json : "")}
          />
          <CodeEditor
            language="json"
            value={result.ok ? result.json : ""}
            editable={false}
            minHeight="60vh"
          />
        </div>
      </div>
    </div>
  );
}
