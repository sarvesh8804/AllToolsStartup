"use client";

import { useCallback, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { markdownStats } from "@/lib/text/markdown";
import { track } from "@/lib/analytics";

const SAMPLE = `# Markdown Preview

Write **Markdown** on the left — see it rendered on the right.

## Features

- GitHub-flavored markdown (tables, strikethrough, task lists)
- Live preview in your browser
- Nothing is uploaded

| Tool | Status |
| --- | --- |
| Preview | Ready |
| Export | Later |

~~old idea~~ → new idea

\`\`\`ts
const forge = "Everything you need. One website.";
\`\`\`

[Forge tools](/tools)
`;

export function MarkdownPreviewTool() {
  const [source, setSource] = useState(SAMPLE);
  const [started, setStarted] = useState(false);
  const stats = useMemo(() => markdownStats(source), [source]);

  const onChange = useCallback(
    (v: string) => {
      if (!started) {
        setStarted(true);
        track({
          name: "tool_start",
          tool: "markdown-preview",
          family: "tools",
        });
      }
      setSource(v);
    },
    [started],
  );

  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {(
          [
            ["Words", stats.words],
            ["Characters", stats.characters],
            ["Headings", stats.headings],
            ["Links", stats.links],
            ["Code blocks", stats.codeBlocks],
          ] as const
        ).map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
          >
            <dt className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
              {label}
            </dt>
            <dd className="mt-1 font-[family-name:var(--font-mono)] text-xl text-[var(--foreground)]">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="Markdown" getText={() => source} />
          <CodeEditor
            language="markdown"
            value={source}
            onChange={onChange}
            minHeight="60vh"
          />
        </div>
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
            Preview
          </p>
          <div className="min-h-[60vh] overflow-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] px-5 py-4 prose-forge space-y-3 text-[var(--foreground)] [&_a]:text-[var(--copper-bright)] [&_a]:underline-offset-2 hover:[&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-[var(--border)] [&_blockquote]:pl-3 [&_blockquote]:text-[var(--muted)] [&_code]:rounded [&_code]:bg-[var(--surface-2)] [&_code]:px-1 [&_code]:font-[family-name:var(--font-mono)] [&_code]:text-sm [&_h1]:font-[family-name:var(--font-display)] [&_h1]:text-3xl [&_h2]:mt-6 [&_h2]:font-[family-name:var(--font-display)] [&_h2]:text-2xl [&_h3]:mt-4 [&_h3]:text-xl [&_li]:ml-5 [&_li]:list-disc [&_ol>li]:list-decimal [&_pre]:overflow-auto [&_pre]:rounded-lg [&_pre]:bg-[var(--surface-2)] [&_pre]:p-3 [&_pre]:font-[family-name:var(--font-mono)] [&_pre]:text-sm [&_table]:w-full [&_td]:border [&_td]:border-[var(--border)] [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-[var(--border)] [&_th]:bg-[var(--surface-2)] [&_th]:px-2 [&_th]:py-1 [&_th]:text-left">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {source}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
