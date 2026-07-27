"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { minifySqlDetailed } from "@/lib/format/sql";
import { track } from "@/lib/analytics";
import Link from "next/link";

const SAMPLE = `SELECT u.id, u.name -- active users
FROM users u
/* join orders */
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.active = 1
  AND u.created_at > '2024-01-01'
ORDER BY u.name;`;

export function SqlMinifierTool() {
  const [input, setInput] = useState(SAMPLE);
  const [stripComments, setStripComments] = useState(true);
  const [started, setStarted] = useState(false);

  const result = useMemo(
    () => minifySqlDetailed(input, { stripComments }),
    [input, stripComments],
  );

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "sql-minifier", family: "tools" });
    }
  }, [started]);

  const onChange = (v: string) => {
    markStart();
    setInput(v);
    track({ name: "tool_complete", tool: "sql-minifier", family: "tools" });
  };

  const saved =
    result.ok && result.originalChars > 0
      ? Math.round(
          (1 - result.minifiedChars / result.originalChars) * 100,
        )
      : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <input
            type="checkbox"
            checked={stripComments}
            onChange={(e) => {
              markStart();
              setStripComments(e.target.checked);
            }}
          />
          Strip comments
        </label>
        {result.ok ? (
          <span className="text-sm text-[var(--muted)]">
            {result.originalChars} → {result.minifiedChars} chars
            {saved > 0 ? ` (−${saved}%)` : ""}
          </span>
        ) : null}
        <span className="text-sm text-[var(--muted)]">
          Need pretty output?{" "}
          <Link
            href="/tools/sql-formatter"
            className="text-[var(--accent-bright)] underline-offset-2 hover:underline"
          >
            SQL Formatter
          </Link>
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="SQL" getText={() => input} />
          <CodeEditor
            language="text"
            value={input}
            onChange={onChange}
            minHeight="50vh"
          />
        </div>
        <div>
          <EditorPaneHeader
            label="Minified"
            getText={() => (result.ok ? result.sql : "")}
          />
          {result.ok ? (
            <CodeEditor
              language="text"
              value={result.sql}
              editable={false}
              minHeight="50vh"
            />
          ) : (
            <ToolErrorState message={result.error} />
          )}
        </div>
      </div>
    </div>
  );
}
