"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import {
  DEFAULT_SQL_FORMAT_OPTIONS,
  formatSql,
  minifySql,
  type KeywordCase,
  type SqlFormatOptions,
} from "@/lib/format/sql";
import { track } from "@/lib/analytics";

const SAMPLE = `select u.id, u.name, count(o.id) as orders from users u left join orders o on o.user_id = u.id where u.active = 1 and u.created_at > '2024-01-01' group by u.id, u.name order by orders desc limit 50`;

export function SqlFormatterTool() {
  const [input, setInput] = useState(SAMPLE);
  const [options, setOptions] = useState<Required<SqlFormatOptions>>(
    DEFAULT_SQL_FORMAT_OPTIONS,
  );
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "sql-formatter", family: "tools" });
    }
  }, [started]);

  const output = useMemo(() => formatSql(input, options), [input, options]);

  const onChange = useCallback(
    (v: string) => {
      markStart();
      setInput(v);
    },
    [markStart],
  );

  const patch = <K extends keyof SqlFormatOptions>(
    key: K,
    value: SqlFormatOptions[K],
  ) => {
    markStart();
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          Indent
          <select
            value={options.useTabs ? "tab" : String(options.indentSize)}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "tab") {
                setOptions((prev) => ({ ...prev, useTabs: true }));
              } else {
                setOptions((prev) => ({
                  ...prev,
                  useTabs: false,
                  indentSize: Number(v),
                }));
              }
              markStart();
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[var(--foreground)]"
          >
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value="tab">Tabs</option>
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          Keywords
          <select
            value={options.keywordCase}
            onChange={(e) =>
              patch("keywordCase", e.target.value as KeywordCase)
            }
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[var(--foreground)]"
          >
            <option value="upper">UPPERCASE</option>
            <option value="lower">lowercase</option>
            <option value="preserve">Preserve</option>
          </select>
        </label>

        {(
          [
            ["indentJoins", "Indent JOINs"],
            ["breakBoolean", "Break AND/OR"],
            ["splitSelectList", "Split SELECT list"],
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

        <button
          type="button"
          onClick={() => {
            markStart();
            setInput(minifySql(input));
          }}
          className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]/50"
        >
          Minify into input
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="SQL" getText={() => input} />
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
