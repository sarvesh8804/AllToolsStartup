"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { xmlToJson } from "@/lib/format/json-xml";
import { track } from "@/lib/analytics";

const SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<person id="42">
  <name>Ada Lovelace</name>
  <skills>
    <skill>math</skill>
    <skill>programming</skill>
  </skills>
</person>
`;

export function XmlToJsonTool() {
  const [input, setInput] = useState(SAMPLE);
  const [indent, setIndent] = useState(2);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "xml-to-json", family: "tools" });
    }
  }, [started]);

  const result = useMemo(
    () => xmlToJson(input, { indent }),
    [input, indent],
  );

  const onChange = useCallback(
    (v: string) => {
      markStart();
      setInput(v);
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
        <Link
          href="/tools/json-to-xml"
          className="text-sm text-[var(--accent-bright)] underline-offset-2 hover:underline"
        >
          JSON to XML →
        </Link>
      </div>

      <p className="text-sm text-[var(--muted)]">
        Attributes become{" "}
        <code className="font-[family-name:var(--font-mono)]">@name</code>{" "}
        fields; repeated tags become arrays.
      </p>

      {!result.ok ? <ToolErrorState message={result.error} /> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="XML" getText={() => input} />
          <CodeEditor
            language="text"
            value={input}
            onChange={onChange}
            minHeight="55vh"
          />
        </div>
        <div>
          <EditorPaneHeader
            label="JSON"
            getText={() => (result.ok ? result.json : "")}
          />
          <CodeEditor
            language="json"
            value={result.ok ? result.json : ""}
            editable={false}
            minHeight="55vh"
          />
        </div>
      </div>
    </div>
  );
}
