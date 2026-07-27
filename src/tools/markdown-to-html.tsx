"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { markdownToHtml } from "@/lib/format/markdown-html";
import { track } from "@/lib/analytics";

const SAMPLE = `# Markdown to HTML

Convert **Markdown** to HTML in your browser.

## Features

- Headings, lists, links, images
- Fenced code blocks
- Tables and ~~strikethrough~~

| Tool | Status |
| --- | --- |
| Converter | Ready |

- [x] Task item
- [ ] Another task

\`\`\`js
console.log("hello forge");
\`\`\`

[Browse tools](/tools)
`;

export function MarkdownToHtmlTool() {
  const [input, setInput] = useState(SAMPLE);
  const [wrapArticle, setWrapArticle] = useState(false);
  const [started, setStarted] = useState(false);

  const html = useMemo(
    () => markdownToHtml(input, { wrapArticle }),
    [input, wrapArticle],
  );

  const onChange = useCallback(
    (v: string) => {
      if (!started) {
        setStarted(true);
        track({
          name: "tool_start",
          tool: "markdown-to-html",
          family: "tools",
        });
      }
      setInput(v);
    },
    [started],
  );

  return (
    <div className="space-y-4">
      <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
        <input
          type="checkbox"
          checked={wrapArticle}
          onChange={(e) => setWrapArticle(e.target.checked)}
        />
        Wrap in {"<article>"}
      </label>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="Markdown" getText={() => input} />
          <CodeEditor
            language="markdown"
            value={input}
            onChange={onChange}
            minHeight="60vh"
          />
        </div>
        <div>
          <EditorPaneHeader label="HTML" getText={() => html} />
          <CodeEditor
            language="text"
            value={html}
            editable={false}
            minHeight="60vh"
          />
        </div>
      </div>
    </div>
  );
}
