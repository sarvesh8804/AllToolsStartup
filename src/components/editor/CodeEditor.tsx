"use client";

import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import type { Extension } from "@codemirror/state";
import { cn } from "@/lib/cn";

function extensionsFor(language: "json" | "markdown" | "text"): Extension[] {
  if (language === "json") return [json()];
  if (language === "markdown") return [markdown()];
  return [];
}

export function CodeEditor({
  value,
  onChange,
  language = "text",
  className,
  minHeight = "220px",
  editable = true,
}: {
  value: string;
  onChange?: (value: string) => void;
  language?: "json" | "markdown" | "text";
  className?: string;
  minHeight?: string;
  editable?: boolean;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-[var(--border)] bg-[#fffef6]",
        className,
      )}
    >
      <CodeMirror
        value={value}
        height={minHeight}
        editable={editable}
        extensions={extensionsFor(language)}
        onChange={onChange}
        theme="light"
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: true,
        }}
      />
    </div>
  );
}
