"use client";

import { useCallback, useMemo, useState } from "react";
import { CopyButton } from "@/components/editor/CopyButton";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  SAMPLE_USER_AGENTS,
  parseUserAgent,
} from "@/lib/network/user-agent";
import { track } from "@/lib/analytics";

export function UserAgentParserTool() {
  const [input, setInput] = useState<string>(SAMPLE_USER_AGENTS.chrome);
  const [started, setStarted] = useState(false);

  const result = useMemo(() => parseUserAgent(input), [input]);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "user-agent-parser",
        family: "tools",
      });
    }
  }, [started]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["Chrome", SAMPLE_USER_AGENTS.chrome],
            ["Safari iOS", SAMPLE_USER_AGENTS.safariMobile],
            ["Firefox", SAMPLE_USER_AGENTS.firefox],
            ["curl", SAMPLE_USER_AGENTS.curl],
            ["Googlebot", SAMPLE_USER_AGENTS.googlebot],
          ] as const
        ).map(([label, ua]) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              markStart();
              setInput(ua);
            }}
            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] hover:border-[var(--accent)]/50 hover:text-[var(--foreground)]"
          >
            {label}
          </button>
        ))}
      </div>

      <div>
        <EditorPaneHeader label="User-Agent string" getText={() => input} />
        <CodeEditor
          value={input}
          onChange={(v) => {
            markStart();
            setInput(v);
          }}
          minHeight="8rem"
        />
      </div>

      {!result.ok ? (
        <ToolErrorState message={result.error} />
      ) : (
        <>
          <dl className="divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            {result.value.fields.map((field) => (
              <div
                key={field.label}
                className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <dt className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                  {field.label}
                </dt>
                <dd className="flex items-center gap-2">
                  <span className="text-sm text-[var(--foreground)]">
                    {field.value}
                  </span>
                  <CopyButton
                    getText={() => field.value}
                    label="Copy"
                    className="!py-1 !text-xs"
                  />
                </dd>
              </div>
            ))}
          </dl>

          <p className="text-xs text-[var(--muted)]">
            Heuristic parser for common browsers, OSes, and bots. Exotic or
            custom UAs may show “Unknown” for some fields.
          </p>
        </>
      )}
    </div>
  );
}
