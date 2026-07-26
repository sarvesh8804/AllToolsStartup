"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { minifyCss } from "@/lib/format/css";
import { track } from "@/lib/analytics";

const SAMPLE = `/* Forge lemon theme snippet */
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: #fffceb;
  color: #243018;
}

.card {
  padding: 1rem;
  border: 1px solid #e4dc9e;
  border-radius: 12px;
}
`;

export function CssMinifierTool() {
  const [input, setInput] = useState(SAMPLE);
  const [started, setStarted] = useState(false);

  const output = useMemo(() => minifyCss(input), [input]);
  const saved =
    input.length === 0
      ? 0
      : Math.max(0, Math.round((1 - output.length / input.length) * 100));

  const onChange = useCallback(
    (v: string) => {
      if (!started) {
        setStarted(true);
        track({ name: "tool_start", tool: "css-minifier", family: "tools" });
      }
      setInput(v);
    },
    [started],
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--muted)]">
        Output:{" "}
        <strong className="font-[family-name:var(--font-mono)] text-[var(--foreground)]">
          {output.length}
        </strong>{" "}
        chars ({saved}% smaller than input)
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="CSS" getText={() => input} />
          <CodeEditor
            language="text"
            value={input}
            onChange={onChange}
            minHeight="60vh"
          />
        </div>
        <div>
          <EditorPaneHeader label="Minified" getText={() => output} />
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
