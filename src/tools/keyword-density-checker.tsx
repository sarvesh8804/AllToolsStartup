"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import {
  analyzeKeywordDensity,
  type KeywordDensityOptions,
} from "@/lib/text/keyword-density";
import { track } from "@/lib/analytics";

const SAMPLE = `Forge is a browser-first toolkit for everyday developer tasks.
Keyword density helps writers see which phrases repeat most often.
Use Forge tools locally to check keyword density before you publish.
Local tools keep drafts private while you refine keyword density.`;

export function KeywordDensityCheckerTool() {
  const [input, setInput] = useState(SAMPLE);
  const [focusText, setFocusText] = useState("forge\nkeyword density");
  const [ignoreStopWords, setIgnoreStopWords] = useState(true);
  const [minWordLength, setMinWordLength] = useState(2);
  const [topN, setTopN] = useState(25);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "keyword-density-checker",
        family: "tools",
      });
    }
  }, [started]);

  const options: KeywordDensityOptions = useMemo(
    () => ({
      ignoreStopWords,
      minWordLength,
      topN,
      focusKeywords: focusText
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean),
    }),
    [focusText, ignoreStopWords, minWordLength, topN],
  );

  const result = useMemo(
    () => analyzeKeywordDensity(input, options),
    [input, options],
  );

  const onChange = useCallback(
    (v: string) => {
      markStart();
      setInput(v);
      track({
        name: "tool_complete",
        tool: "keyword-density-checker",
        family: "tools",
      });
    },
    [markStart],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Min word length
          <input
            type="number"
            min={1}
            max={20}
            value={minWordLength}
            onChange={(e) => {
              markStart();
              setMinWordLength(Number(e.target.value));
            }}
            className="w-24 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Top N
          <input
            type="number"
            min={1}
            max={200}
            value={topN}
            onChange={(e) => {
              markStart();
              setTopN(Number(e.target.value));
            }}
            className="w-24 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
          />
        </label>

        <label className="flex items-center gap-2 pb-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={ignoreStopWords}
            onChange={(e) => {
              markStart();
              setIgnoreStopWords(e.target.checked);
            }}
            className="accent-[var(--accent)]"
          />
          Ignore stop words
        </label>

        <label className="flex min-w-[14rem] flex-1 flex-col gap-1 text-sm text-[var(--muted)]">
          Focus keywords (comma or newline)
          <textarea
            rows={2}
            value={focusText}
            onChange={(e) => {
              markStart();
              setFocusText(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
          />
        </label>
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {(
          [
            ["Total words", result.totalWords],
            ["Analyzed words", result.analyzedWords],
            ["Unique keywords", result.uniqueWords],
          ] as const
        ).map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
          >
            <dt className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
              {label}
            </dt>
            <dd className="mt-1 font-[family-name:var(--font-mono)] text-2xl text-[var(--foreground)]">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      {result.focus.length > 0 ? (
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
            Focus
          </p>
          <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[var(--surface-2)] text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                <tr>
                  <th className="px-3 py-2 font-medium">Keyword</th>
                  <th className="px-3 py-2 font-medium">Count</th>
                  <th className="px-3 py-2 font-medium">Density</th>
                </tr>
              </thead>
              <tbody>
                {result.focus.map((row) => (
                  <tr
                    key={`focus-${row.keyword}`}
                    className="border-t border-[var(--border)]"
                  >
                    <td className="px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]">
                      {row.keyword}
                    </td>
                    <td className="px-3 py-2 text-[var(--foreground)]">
                      {row.count}
                    </td>
                    <td className="px-3 py-2 text-[var(--foreground)]">
                      {row.density.toFixed(2)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
          Top keywords
        </p>
        <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-[var(--surface-2)] text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
              <tr>
                <th className="px-3 py-2 font-medium">#</th>
                <th className="px-3 py-2 font-medium">Keyword</th>
                <th className="px-3 py-2 font-medium">Count</th>
                <th className="px-3 py-2 font-medium">Density</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-4 text-[var(--muted)]"
                  >
                    No keywords matched the current filters.
                  </td>
                </tr>
              ) : (
                result.rows.map((row, i) => (
                  <tr
                    key={row.keyword}
                    className="border-t border-[var(--border)]"
                  >
                    <td className="px-3 py-2 text-[var(--muted)]">{i + 1}</td>
                    <td className="px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]">
                      {row.keyword}
                    </td>
                    <td className="px-3 py-2 text-[var(--foreground)]">
                      {row.count}
                    </td>
                    <td className="px-3 py-2 text-[var(--foreground)]">
                      {row.density.toFixed(2)}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <EditorPaneHeader label="Text" getText={() => input} />
        <CodeEditor
          language="text"
          value={input}
          onChange={onChange}
          minHeight="35vh"
        />
      </div>
    </div>
  );
}
