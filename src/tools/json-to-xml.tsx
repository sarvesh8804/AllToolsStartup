"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { jsonToXml } from "@/lib/format/json-xml";
import { track } from "@/lib/analytics";

const SAMPLE = `{
  "person": {
    "@id": "42",
    "name": "Ada Lovelace",
    "skills": {
      "skill": ["math", "programming"]
    }
  }
}`;

export function JsonToXmlTool() {
  const [input, setInput] = useState(SAMPLE);
  const [rootName, setRootName] = useState("root");
  const [pretty, setPretty] = useState(true);
  const [declaration, setDeclaration] = useState(true);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "json-to-xml", family: "tools" });
    }
  }, [started]);

  const result = useMemo(
    () => jsonToXml(input, { rootName, pretty, declaration }),
    [input, rootName, pretty, declaration],
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
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Fallback root name
          <input
            value={rootName}
            onChange={(e) => {
              markStart();
              setRootName(e.target.value);
            }}
            className="w-40 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]"
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={pretty}
            onChange={(e) => {
              markStart();
              setPretty(e.target.checked);
            }}
            className="accent-[var(--accent)]"
          />
          Pretty print
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={declaration}
            onChange={(e) => {
              markStart();
              setDeclaration(e.target.checked);
            }}
            className="accent-[var(--accent)]"
          />
          XML declaration
        </label>
        <Link
          href="/tools/xml-to-json"
          className="text-sm text-[var(--accent-bright)] underline-offset-2 hover:underline"
        >
          XML to JSON →
        </Link>
      </div>

      <p className="text-sm text-[var(--muted)]">
        Use <code className="font-[family-name:var(--font-mono)]">@attr</code>{" "}
        keys for attributes and{" "}
        <code className="font-[family-name:var(--font-mono)]">#text</code> for
        mixed text.
      </p>

      {!result.ok ? <ToolErrorState message={result.error} /> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="JSON" getText={() => input} />
          <CodeEditor
            language="json"
            value={input}
            onChange={onChange}
            minHeight="55vh"
          />
        </div>
        <div>
          <EditorPaneHeader
            label="XML"
            getText={() => (result.ok ? result.xml : "")}
          />
          <CodeEditor
            language="text"
            value={result.ok ? result.xml : ""}
            editable={false}
            minHeight="55vh"
          />
        </div>
      </div>
    </div>
  );
}
