"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { CopyButton } from "@/components/editor/CopyButton";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import {
  DEFAULT_INVISIBLE_CATEGORIES,
  INVISIBLE_CATEGORY_LABELS,
  removeInvisibleCharacters,
  type InvisibleCategoryFlags,
  type InvisibleCharCategoryId,
} from "@/lib/text/invisible-remove";
import { track } from "@/lib/analytics";

const SAMPLE = `Hello\u200B\u00A0world\uFEFF — hidden\u200Dchars and\u202Eodd marks.`;

const CATEGORY_IDS = Object.keys(
  DEFAULT_INVISIBLE_CATEGORIES,
) as InvisibleCharCategoryId[];

export function InvisibleCharacterRemoverTool() {
  const [input, setInput] = useState(SAMPLE);
  const [categories, setCategories] = useState<InvisibleCategoryFlags>(
    DEFAULT_INVISIBLE_CATEGORIES,
  );
  const [nbspToSpace, setNbspToSpace] = useState(true);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "invisible-character-remover",
        family: "tools",
      });
    }
  }, [started]);

  const markComplete = useCallback(() => {
    if (!completed) {
      setCompleted(true);
      track({
        name: "tool_complete",
        tool: "invisible-character-remover",
        family: "tools",
      });
    }
  }, [completed]);

  const result = useMemo(
    () => removeInvisibleCharacters(input, categories, nbspToSpace),
    [input, categories, nbspToSpace],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--muted)]">
          Removed{" "}
          <span className="font-[family-name:var(--font-mono)] text-[var(--foreground)]">
            {result.removed}
          </span>
        </span>
        <CopyButton getText={() => result.cleaned} label="Copy cleaned" />
        <button
          type="button"
          disabled={result.removed === 0}
          onClick={() => {
            markStart();
            markComplete();
            setInput(result.cleaned);
          }}
          className="rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--ink)] disabled:opacity-40"
        >
          Apply to input
        </button>
        <Link
          href="/tools/zero-width-character-detector"
          className="text-sm text-[var(--copper-bright)] hover:underline"
        >
          Detect zero-width →
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        {CATEGORY_IDS.map((id) => (
          <label
            key={id}
            className="flex items-center gap-2 text-sm text-[var(--muted)]"
          >
            <input
              type="checkbox"
              checked={categories[id]}
              onChange={(e) => {
                markStart();
                markComplete();
                setCategories((prev) => ({ ...prev, [id]: e.target.checked }));
              }}
            />
            {INVISIBLE_CATEGORY_LABELS[id]}
          </label>
        ))}
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <input
            type="checkbox"
            checked={nbspToSpace}
            onChange={(e) => {
              markStart();
              markComplete();
              setNbspToSpace(e.target.checked);
            }}
          />
          NBSP → space
        </label>
      </div>

      {result.byCode.length > 0 ? (
        <ul className="flex flex-wrap gap-2 text-xs text-[var(--muted)]">
          {result.byCode.map((row) => (
            <li
              key={row.code}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 font-[family-name:var(--font-mono)]"
            >
              {row.code} ×{row.count}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="Input" getText={() => input} />
          <CodeEditor
            language="text"
            value={input}
            onChange={(v) => {
              markStart();
              markComplete();
              setInput(v);
            }}
            minHeight="36vh"
          />
        </div>
        <div>
          <EditorPaneHeader label="Cleaned" getText={() => result.cleaned} />
          <CodeEditor
            language="text"
            value={result.cleaned}
            editable={false}
            minHeight="36vh"
          />
        </div>
      </div>
    </div>
  );
}
