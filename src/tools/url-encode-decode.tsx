"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  decodeUrl,
  decodeUrlComponent,
  encodeUrl,
  encodeUrlComponent,
} from "@/lib/encoding/url";
import { track } from "@/lib/analytics";

type Mode = "encode" | "decode";

const SAMPLE = "https://forge.tools/search?q=hello world&lang=en";

export function UrlEncodeTool() {
  const [mode, setMode] = useState<Mode>("encode");
  const [component, setComponent] = useState(true);
  const [input, setInput] = useState(SAMPLE);
  const [started, setStarted] = useState(false);

  const { output, error } = useMemo(() => {
    try {
      let value: string;
      if (mode === "encode") {
        value = component ? encodeUrlComponent(input) : encodeUrl(input);
      } else {
        value = component ? decodeUrlComponent(input) : decodeUrl(input);
      }
      return { output: value, error: null as string | null };
    } catch {
      return {
        output: "",
        error: "That input contains a malformed percent-encoding.",
      };
    }
  }, [mode, component, input]);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "url-encode-decode", family: "tools" });
    }
  }, [started]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <div
          role="tablist"
          aria-label="URL mode"
          className="inline-flex rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1 text-sm"
        >
          {(["encode", "decode"] as Mode[]).map((m) => (
            <button
              key={m}
              role="tab"
              aria-selected={mode === m}
              type="button"
              onClick={() => setMode(m)}
              className={
                mode === m
                  ? "rounded-md bg-[var(--accent)] px-4 py-1.5 font-medium text-[var(--ink)]"
                  : "rounded-md px-4 py-1.5 text-[var(--muted)] hover:text-[var(--foreground)]"
              }
            >
              {m === "encode" ? "Encode" : "Decode"}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <input
            type="checkbox"
            checked={component}
            onChange={(e) => setComponent(e.target.checked)}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          Component mode (encode <code className="text-[var(--foreground)]">/ ? &amp; =</code>)
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="Input" getText={() => input} />
          <CodeEditor
            language="text"
            value={input}
            onChange={(v) => {
              markStart();
              setInput(v);
            }}
            minHeight="55vh"
          />
        </div>
        <div>
          <EditorPaneHeader label="Output" getText={() => output} />
          {error ? (
            <ToolErrorState message={error} />
          ) : (
            <CodeEditor
              language="text"
              value={output}
              editable={false}
              minHeight="55vh"
            />
          )}
        </div>
      </div>
    </div>
  );
}
