"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  decodeHtmlEntities,
  encodeHtmlEntities,
} from "@/lib/encoding/html-entities";
import { track } from "@/lib/analytics";

type Mode = "encode" | "decode";

const SAMPLE = `<p>Hello & welcome — café, “quotes”, and <strong>HTML</strong>.</p>`;

export function HtmlEntityEncodeDecodeTool() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState(SAMPLE);
  const [encodeNonAscii, setEncodeNonAscii] = useState(false);
  const [useHex, setUseHex] = useState(false);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "html-entity-encode-decode",
        family: "tools",
      });
    }
  }, [started]);

  const result = useMemo(() => {
    if (mode === "encode") {
      return {
        ok: true as const,
        value: encodeHtmlEntities(input, { encodeNonAscii, useHex }),
      };
    }
    return decodeHtmlEntities(input);
  }, [mode, input, encodeNonAscii, useHex]);

  const onChange = useCallback(
    (v: string) => {
      markStart();
      setInput(v);
    },
    [markStart],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div
          role="tablist"
          className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 text-sm"
        >
          {(
            [
              ["encode", "Encode"],
              ["decode", "Decode"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={mode === id}
              onClick={() => {
                markStart();
                setMode(id);
              }}
              className={`rounded-md px-3 py-1.5 ${
                mode === id
                  ? "bg-[var(--accent)]/15 text-[var(--foreground)]"
                  : "text-[var(--muted)]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === "encode" ? (
          <>
            <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
              <input
                type="checkbox"
                checked={encodeNonAscii}
                onChange={(e) => {
                  markStart();
                  setEncodeNonAscii(e.target.checked);
                }}
                className="accent-[var(--accent)]"
              />
              Encode non-ASCII
            </label>
            <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
              <input
                type="checkbox"
                checked={useHex}
                disabled={!encodeNonAscii}
                onChange={(e) => {
                  markStart();
                  setUseHex(e.target.checked);
                }}
                className="accent-[var(--accent)]"
              />
              Hex numeric (&#x…;)
            </label>
          </>
        ) : null}

        <Link
          href="/tools/url-encode-decode"
          className="text-sm text-[var(--accent-bright)] underline-offset-2 hover:underline"
        >
          URL Encode / Decode →
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader
            label={mode === "encode" ? "Plain / HTML text" : "Entities"}
            getText={() => input}
          />
          <CodeEditor
            language="text"
            value={input}
            onChange={onChange}
            minHeight="50vh"
          />
        </div>
        <div>
          <EditorPaneHeader
            label={mode === "encode" ? "Encoded" : "Decoded"}
            getText={() => (result.ok ? result.value : "")}
          />
          {!result.ok ? (
            <ToolErrorState message={result.error} />
          ) : (
            <CodeEditor
              language="text"
              value={result.value}
              editable={false}
              minHeight="50vh"
            />
          )}
        </div>
      </div>
    </div>
  );
}
