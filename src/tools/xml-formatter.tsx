"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { formatXml, minifyXml } from "@/lib/format/xml";
import { track } from "@/lib/analytics";

const SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<root><person id="1"><name>Ada</name><skills><skill>math</skill><skill>logic</skill></skills></person><!-- note --><empty/></root>`;

export function XmlFormatterTool() {
  const [input, setInput] = useState(SAMPLE);
  const [indent, setIndent] = useState(2);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "xml-formatter", family: "tools" });
    }
  }, [started]);

  const output = useMemo(() => formatXml(input, indent), [input, indent]);

  const onChange = useCallback(
    (v: string) => {
      markStart();
      setInput(v);
      track({ name: "tool_complete", tool: "xml-formatter", family: "tools" });
    },
    [markStart],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
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
        <button
          type="button"
          onClick={() => {
            markStart();
            setInput(minifyXml(input));
          }}
          className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]/50"
        >
          Minify into input
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="XML" getText={() => input} />
          <CodeEditor
            language="text"
            value={input}
            onChange={onChange}
            minHeight="60vh"
          />
        </div>
        <div>
          <EditorPaneHeader label="Formatted" getText={() => output} />
          <CodeEditor
            language="text"
            value={output}
            editable={false}
            minHeight="60vh"
          />
        </div>
      </div>
    </div>
  );
}
