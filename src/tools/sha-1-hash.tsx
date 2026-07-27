"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { CopyButton } from "@/components/editor/CopyButton";
import { sha1 } from "@/lib/hash/sha1";
import { track } from "@/lib/analytics";

const SAMPLE = "The quick brown fox jumps over the lazy dog";

export function Sha1Tool() {
  const [input, setInput] = useState(SAMPLE);
  const [uppercase, setUppercase] = useState(false);
  const [started, setStarted] = useState(false);

  const digest = useMemo(() => sha1(input), [input]);
  const display = uppercase ? digest.toUpperCase() : digest;

  const onChange = useCallback(
    (v: string) => {
      if (!started) {
        setStarted(true);
        track({ name: "tool_start", tool: "sha-1-hash", family: "tools" });
      }
      setInput(v);
    },
    [started],
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--muted)]">
        SHA-1 is{" "}
        <strong className="font-medium text-[var(--foreground)]">
          cryptographically broken
        </strong>{" "}
        for collision resistance. Prefer{" "}
        <Link
          href="/tools/sha-256-hash"
          className="text-[var(--accent-bright)] underline-offset-2 hover:underline"
        >
          SHA-256
        </Link>{" "}
        for security-sensitive use. This tool is for checksums, legacy systems,
        and learning.
      </p>

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
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
            SHA-1 digest ({input.length} chars in)
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
    </div>
  );
}
