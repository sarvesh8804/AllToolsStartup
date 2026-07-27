"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import {
  DEFAULT_HTML_MINIFY_OPTIONS,
  minifyHtml,
  type HtmlMinifyOptions,
} from "@/lib/format/html";
import { track } from "@/lib/analytics";

const SAMPLE = `<!DOCTYPE html>
<html>
  <head>
    <!-- site meta -->
    <title>Forge</title>
  </head>
  <body>
    <main>
      <h1>Hello</h1>
      <p>Everything you need. <strong>One website.</strong></p>
    </main>
  </body>
</html>
`;

export function HtmlMinifierTool() {
  const [input, setInput] = useState(SAMPLE);
  const [options, setOptions] = useState<Required<HtmlMinifyOptions>>(
    DEFAULT_HTML_MINIFY_OPTIONS,
  );
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "html-minifier", family: "tools" });
    }
  }, [started]);

  const output = useMemo(() => minifyHtml(input, options), [input, options]);
  const saved =
    input.length === 0
      ? 0
      : Math.max(0, Math.round((1 - output.length / input.length) * 100));

  const onChange = useCallback(
    (v: string) => {
      markStart();
      setInput(v);
      track({ name: "tool_complete", tool: "html-minifier", family: "tools" });
    },
    [markStart],
  );

  const patch = <K extends keyof HtmlMinifyOptions>(
    key: K,
    value: HtmlMinifyOptions[K],
  ) => {
    markStart();
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        {(
          [
            ["removeComments", "Remove comments"],
            ["collapseWhitespace", "Collapse whitespace"],
            ["trimTextNodes", "Trim text around tags"],
          ] as const
        ).map(([key, label]) => (
          <label
            key={key}
            className="flex items-center gap-2 text-sm text-[var(--foreground)]"
          >
            <input
              type="checkbox"
              checked={options[key]}
              onChange={(e) => patch(key, e.target.checked)}
              className="accent-[var(--accent)]"
            />
            {label}
          </label>
        ))}
        <p className="text-sm text-[var(--muted)]">~{saved}% smaller</p>
        <Link
          href="/tools/html-formatter"
          className="text-sm text-[var(--accent-bright)] underline-offset-2 hover:underline"
        >
          HTML Formatter →
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="HTML" getText={() => input} />
          <CodeEditor
            language="text"
            value={input}
            onChange={onChange}
            minHeight="55vh"
          />
        </div>
        <div>
          <EditorPaneHeader label="Minified" getText={() => output} />
          <CodeEditor
            language="text"
            value={output}
            editable={false}
            minHeight="55vh"
          />
        </div>
      </div>
    </div>
  );
}
