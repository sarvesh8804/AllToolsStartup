"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  SAMPLE_JSON_LD,
  formatJsonLd,
} from "@/lib/seo/json-ld";
import { track } from "@/lib/analytics";

const SAMPLE_ARTICLE = `{
"@context": "https://schema.org",
"@type": "Article",
"headline": "How to add structured data",
"author": { "@type": "Person", "name": "Ada Lovelace" },
"datePublished": "2026-08-02"
}`;

export function JsonLdFormatterTool() {
  const [input, setInput] = useState(SAMPLE_JSON_LD);
  const [indent, setIndent] = useState(2);
  const [wrapScript, setWrapScript] = useState(false);
  const [started, setStarted] = useState(false);

  const result = useMemo(
    () => formatJsonLd(input, { spaces: indent, wrapScript }),
    [input, indent, wrapScript],
  );

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "json-ld-formatter", family: "tools" });
    }
  }, [started]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
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
            <option value={0}>Minified</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={wrapScript}
            onChange={(e) => {
              markStart();
              setWrapScript(e.target.checked);
            }}
          />
          Wrap in &lt;script type=&quot;application/ld+json&quot;&gt;
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              markStart();
              setInput(SAMPLE_JSON_LD);
            }}
            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] hover:border-[var(--accent)]/50"
          >
            WebSite sample
          </button>
          <button
            type="button"
            onClick={() => {
              markStart();
              setInput(SAMPLE_ARTICLE);
            }}
            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] hover:border-[var(--accent)]/50"
          >
            Article sample
          </button>
        </div>
      </div>

      {result.ok && result.warnings.length > 0 ? (
        <ul className="space-y-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">
          {result.warnings.map((warning) => (
            <li key={warning}>• {warning}</li>
          ))}
        </ul>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="JSON-LD input" getText={() => input} />
          <CodeEditor
            language="json"
            value={input}
            onChange={(v) => {
              markStart();
              setInput(v);
            }}
            minHeight="55vh"
          />
        </div>
        <div>
          <EditorPaneHeader
            label="Formatted output"
            getText={() => (result.ok ? result.formatted : "")}
          />
          {!result.ok ? (
            <ToolErrorState message={result.error} />
          ) : (
            <CodeEditor
              language={wrapScript ? "text" : "json"}
              value={result.formatted}
              editable={false}
              minHeight="55vh"
            />
          )}
        </div>
      </div>
    </div>
  );
}
