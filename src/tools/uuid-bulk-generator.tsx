"use client";

import { useCallback, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { CopyButton } from "@/components/editor/CopyButton";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import {
  DEFAULT_UUID_BULK_OPTIONS,
  UUID_BULK_MAX,
  generateUuidBulk,
  type UuidBulkOptions,
  type UuidBulkSeparator,
} from "@/lib/id/uuid-bulk";
import { track } from "@/lib/analytics";
import Link from "next/link";

export function UuidBulkGeneratorTool() {
  const [options, setOptions] = useState<UuidBulkOptions>(
    DEFAULT_UUID_BULK_OPTIONS,
  );
  const [result, setResult] = useState(() =>
    generateUuidBulk(DEFAULT_UUID_BULK_OPTIONS),
  );
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "uuid-bulk-generator",
        family: "tools",
      });
    }
  }, [started]);

  const regenerate = (opts: UuidBulkOptions) => {
    markStart();
    const next = generateUuidBulk(opts);
    setResult(next);
    track({
      name: "tool_complete",
      tool: "uuid-bulk-generator",
      family: "tools",
    });
  };

  const update = (patch: Partial<UuidBulkOptions>) => {
    const next = { ...options, ...patch };
    setOptions(next);
    regenerate(next);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Count (max {UUID_BULK_MAX.toLocaleString()})
          <input
            type="number"
            min={1}
            max={UUID_BULK_MAX}
            value={options.count}
            onChange={(e) => update({ count: Number(e.target.value) })}
            className="w-36 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[var(--foreground)]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Separator
          <select
            value={options.separator}
            onChange={(e) =>
              update({ separator: e.target.value as UuidBulkSeparator })
            }
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--foreground)]"
          >
            <option value="newline">Newlines</option>
            <option value="comma">Comma</option>
            <option value="space">Space</option>
            <option value="json">JSON array</option>
          </select>
        </label>
        <button
          type="button"
          onClick={() => regenerate(options)}
          className="rounded-md bg-[var(--accent)] px-4 py-1.5 text-sm font-medium text-[var(--ink)]"
        >
          Generate
        </button>
        <CopyButton getText={() => result.text} label="Copy all" />
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-[var(--muted)]">
        {(
          [
            ["uppercase", "Uppercase"],
            ["hyphens", "Hyphens"],
            ["braces", "Braces { }"],
            ["urn", "URN prefix"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={options[key]}
              onChange={(e) => update({ [key]: e.target.checked })}
            />
            {label}
          </label>
        ))}
        <span>{result.count.toLocaleString()} UUIDs</span>
      </div>

      <div>
        <EditorPaneHeader label="Output" getText={() => result.text} />
        <CodeEditor
          language="text"
          value={result.text}
          editable={false}
          minHeight="45vh"
        />
      </div>

      <p className="text-sm text-[var(--muted)]">
        Need a single UUID?{" "}
        <Link
          href="/tools/uuid-v4-generator"
          className="text-[var(--accent-bright)] underline-offset-2 hover:underline"
        >
          UUID v4 Generator
        </Link>
        .
      </p>
    </div>
  );
}
