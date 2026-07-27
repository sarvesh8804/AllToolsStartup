"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { CopyButton } from "@/components/editor/CopyButton";
import { sha512 } from "@/lib/hash/sha512";
import { track } from "@/lib/analytics";
import Link from "next/link";

const SAMPLE = "The quick brown fox jumps over the lazy dog";

export function Sha512HashTool() {
  const [input, setInput] = useState(SAMPLE);
  const [uppercase, setUppercase] = useState(false);
  const [started, setStarted] = useState(false);

  const digest = useMemo(() => sha512(input), [input]);
  const display = uppercase ? digest.toUpperCase() : digest;

  const onChange = useCallback(
    (v: string) => {
      if (!started) {
        setStarted(true);
        track({ name: "tool_start", tool: "sha-512-hash", family: "tools" });
      }
      setInput(v);
      track({ name: "tool_complete", tool: "sha-512-hash", family: "tools" });
    },
    [started],
  );

  return (
    <div className="space-y-4">
      <div>
        <EditorPaneHeader label="Input text" getText={() => input} />
        <CodeEditor
          language="text"
          value={input}
          onChange={onChange}
          minHeight="45vh"
        />
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
            SHA-512 digest ({digest.length / 2} bytes · {input.length} chars in)
          </p>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
              <input
                type="checkbox"
                checked={uppercase}
                onChange={(e) => setUppercase(e.target.checked)}
                className="h-4 w-4 accent-[var(--accent)]"
              />
              Uppercase
            </label>
            <CopyButton
              getText={() => display}
              label="Copy"
              className="!py-1 !text-xs"
            />
          </div>
        </div>
        <code className="block break-all rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]">
          {display}
        </code>
      </div>

      <p className="text-sm text-[var(--muted)]">
        Also see{" "}
        <Link
          href="/tools/sha-256-hash"
          className="text-[var(--accent-bright)] underline-offset-2 hover:underline"
        >
          SHA-256
        </Link>{" "}
        and{" "}
        <Link
          href="/tools/sha-1-hash"
          className="text-[var(--accent-bright)] underline-offset-2 hover:underline"
        >
          SHA-1
        </Link>
        .
      </p>
    </div>
  );
}
