"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { htmlToMarkdown } from "@/lib/format/html-markdown";
import { track } from "@/lib/analytics";

const SAMPLE = `<article>
  <h1>HTML to Markdown</h1>
  <p>Convert <strong>HTML</strong> to <em>Markdown</em> in your browser.</p>
  <ul>
    <li>Headings and paragraphs</li>
    <li><a href="/tools">Links</a> and images</li>
  </ul>
  <pre><code class="language-js">console.log("forge");</code></pre>
  <blockquote><p>Local-only conversion.</p></blockquote>
  <table>
    <tr><th>Tool</th><th>Status</th></tr>
    <tr><td>Converter</td><td>Ready</td></tr>
  </table>
</article>`;

export function HtmlToMarkdownTool() {
  const [input, setInput] = useState(SAMPLE);
  const [started, setStarted] = useState(false);

  const result = useMemo(() => htmlToMarkdown(input), [input]);

  const onChange = useCallback(
    (v: string) => {
      if (!started) {
        setStarted(true);
        track({
          name: "tool_start",
          tool: "html-to-markdown",
          family: "tools",
        });
      }
      setInput(v);
      track({
        name: "tool_complete",
        tool: "html-to-markdown",
        family: "tools",
      });
    },
    [started],
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="HTML" getText={() => input} />
          <CodeEditor
            language="text"
            value={input}
            onChange={onChange}
            minHeight="60vh"
          />
        </div>
        <div>
          <EditorPaneHeader
            label="Markdown"
            getText={() => (result.ok ? result.markdown : "")}
          />
          {result.ok ? (
            <CodeEditor
              language="markdown"
              value={result.markdown}
              editable={false}
              minHeight="60vh"
            />
          ) : (
            <ToolErrorState message={result.error} />
          )}
        </div>
      </div>
    </div>
  );
}
