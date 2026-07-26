"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { slugify } from "@/lib/text/slugify";
import { track } from "@/lib/analytics";

const SAMPLE = "10 Reasons Forge Runs in Your Browser!";

export function SlugGeneratorTool() {
  const [input, setInput] = useState(SAMPLE);
  const [separator, setSeparator] = useState<"-" | "_">("-");
  const [lowercase, setLowercase] = useState(true);
  const [strict, setStrict] = useState(true);
  const [started, setStarted] = useState(false);

  const output = useMemo(
    () => slugify(input, { separator, lowercase, strict }),
    [input, separator, lowercase, strict],
  );

  const onChange = useCallback(
    (v: string) => {
      if (!started) {
        setStarted(true);
        track({ name: "tool_start", tool: "slug-generator", family: "tools" });
      }
      setInput(v);
    },
    [started],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          Separator
          <select
            value={separator}
            onChange={(e) => setSeparator(e.target.value as "-" | "_")}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[var(--foreground)]"
          >
            <option value="-">hyphen ( - )</option>
            <option value="_">underscore ( _ )</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <input
            type="checkbox"
            checked={lowercase}
            onChange={(e) => setLowercase(e.target.checked)}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          Lowercase
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <input
            type="checkbox"
            checked={strict}
            onChange={(e) => setStrict(e.target.checked)}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          ASCII only (strip accents &amp; unicode)
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="Input" getText={() => input} />
          <CodeEditor
            language="text"
            value={input}
            onChange={onChange}
            minHeight="45vh"
          />
        </div>
        <div>
          <EditorPaneHeader label="Slug" getText={() => output} />
          <CodeEditor
            language="text"
            value={output}
            editable={false}
            minHeight="45vh"
          />
        </div>
      </div>
    </div>
  );
}
