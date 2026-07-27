"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { minifyJavascript } from "@/lib/format/javascript";
import { track } from "@/lib/analytics";

const SAMPLE = `/**
 * Sample before minify
 */
function greet(name) {
  // say hello
  if (!name) {
    return "hi";
  }
  return "Hello, " + name + "!";
}

const forge = {
  ship() {
    return true;
  },
};
`;

export function JavascriptMinifierTool() {
  const [input, setInput] = useState(SAMPLE);
  const [stripComments, setStripComments] = useState(true);
  const [started, setStarted] = useState(false);

  const output = useMemo(
    () => minifyJavascript(input, { stripComments }),
    [input, stripComments],
  );
  const saved =
    input.length === 0
      ? 0
      : Math.max(0, Math.round((1 - output.length / input.length) * 100));

  const onChange = useCallback(
    (v: string) => {
      if (!started) {
        setStarted(true);
        track({
          name: "tool_start",
          tool: "javascript-minifier",
          family: "tools",
        });
      }
      setInput(v);
    },
    [started],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <input
            type="checkbox"
            checked={stripComments}
            onChange={(e) => setStripComments(e.target.checked)}
          />
          Strip comments
        </label>
        <p className="text-sm text-[var(--muted)]">
          Output:{" "}
          <strong className="font-[family-name:var(--font-mono)] text-[var(--foreground)]">
            {output.length}
          </strong>{" "}
          chars ({saved}% smaller than input)
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="JavaScript" getText={() => input} />
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

      <p className="text-xs text-[var(--muted)]">
        Lightweight minifier — collapses whitespace and optionally drops
        comments while preserving strings and regex. Not a full terser/uglify
        pipeline.
      </p>
    </div>
  );
}
