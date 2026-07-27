"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  runBase64Url,
  standardEncode,
  type Base64UrlMode,
} from "@/lib/encoding/base64-url";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import Link from "next/link";

const MODES: { id: Base64UrlMode; label: string }[] = [
  { id: "encode", label: "Encode" },
  { id: "decode", label: "Decode" },
  { id: "to-url", label: "Std → URL" },
  { id: "to-standard", label: "URL → Std" },
];

const SAMPLES: Record<Base64UrlMode, string> = {
  encode: "Forge — URL-safe Base64.",
  decode: "Rm9yZ2Ug4oCUIFVSTC1zYWZlIEJhc2U2NC4",
  "to-url": "Pj8/Pz4+",
  "to-standard": "Pj8_Pz4-",
};

export function Base64UrlSafeTool() {
  const [mode, setMode] = useState<Base64UrlMode>("encode");
  const [input, setInput] = useState(SAMPLES.encode);
  const [started, setStarted] = useState(false);

  const result = useMemo(() => runBase64Url(mode, input), [mode, input]);

  const standardCompare =
    mode === "encode" && result.ok ? standardEncode(input) : null;

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "base64-url-safe",
        family: "tools",
      });
    }
  }, [started]);

  const switchMode = (next: Base64UrlMode) => {
    markStart();
    setMode(next);
    if (result.ok && result.output) {
      setInput(result.output);
    } else {
      setInput(SAMPLES[next]);
    }
    track({
      name: "tool_complete",
      tool: "base64-url-safe",
      family: "tools",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div
          role="tablist"
          aria-label="Base64 URL-safe mode"
          className="inline-flex flex-wrap rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 text-sm"
        >
          {MODES.map((m) => (
            <button
              key={m.id}
              role="tab"
              type="button"
              aria-selected={mode === m.id}
              onClick={() => switchMode(m.id)}
              className={cn(
                "rounded-md px-3 py-1.5 transition",
                mode === m.id
                  ? "bg-[var(--accent)] text-[var(--ink)]"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
        <span className="text-sm text-[var(--muted)]">
          Classic Base64?{" "}
          <Link
            href="/tools/base64-encode-decode"
            className="text-[var(--accent-bright)] underline-offset-2 hover:underline"
          >
            Base64 Encode/Decode
          </Link>
        </span>
      </div>

      {standardCompare ? (
        <p className="text-sm text-[var(--muted)]">
          Standard (padded):{" "}
          <code className="font-[family-name:var(--font-mono)] text-[var(--foreground)]">
            {standardCompare}
          </code>
        </p>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader
            label={
              mode === "encode"
                ? "Text"
                : mode === "decode"
                  ? "URL-safe Base64"
                  : mode === "to-url"
                    ? "Standard Base64"
                    : "URL-safe Base64"
            }
            getText={() => input}
          />
          <CodeEditor
            language="text"
            value={input}
            onChange={(v) => {
              markStart();
              setInput(v);
              track({
                name: "tool_complete",
                tool: "base64-url-safe",
                family: "tools",
              });
            }}
            minHeight="40vh"
          />
        </div>
        <div>
          <EditorPaneHeader
            label={
              mode === "encode"
                ? "URL-safe Base64"
                : mode === "decode"
                  ? "Text"
                  : mode === "to-url"
                    ? "URL-safe Base64"
                    : "Standard Base64"
            }
            getText={() => (result.ok ? result.output : "")}
          />
          {result.ok ? (
            <CodeEditor
              language="text"
              value={result.output}
              editable={false}
              minHeight="40vh"
            />
          ) : (
            <ToolErrorState message={result.error} />
          )}
        </div>
      </div>
    </div>
  );
}
