"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { CopyButton } from "@/components/editor/CopyButton";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import {
  DEFAULT_WORD_FREQUENCY_OPTIONS,
  SAMPLE_WORD_FREQUENCY,
  analyzeWordFrequency,
  wordFrequencyToCsv,
  type WordFrequencyOptions,
} from "@/lib/text/word-frequency";
import { track } from "@/lib/analytics";

export function WordFrequencyCounterTool() {
  const [input, setInput] = useState(SAMPLE_WORD_FREQUENCY);
  const [caseSensitive, setCaseSensitive] = useState(
    DEFAULT_WORD_FREQUENCY_OPTIONS.caseSensitive,
  );
  const [ignoreStopWords, setIgnoreStopWords] = useState(
    DEFAULT_WORD_FREQUENCY_OPTIONS.ignoreStopWords,
  );
  const [minWordLength, setMinWordLength] = useState(
    DEFAULT_WORD_FREQUENCY_OPTIONS.minWordLength,
  );
  const [topN, setTopN] = useState(DEFAULT_WORD_FREQUENCY_OPTIONS.topN);
  const [sortBy, setSortBy] = useState<WordFrequencyOptions["sortBy"]>("count");
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "word-frequency-counter",
        family: "tools",
      });
    }
  }, [started]);

  const markComplete = useCallback(() => {
    if (!completed) {
      setCompleted(true);
      track({
        name: "tool_complete",
        tool: "word-frequency-counter",
        family: "tools",
      });
    }
  }, [completed]);

  const touch = () => {
    markStart();
    markComplete();
  };

  const result = useMemo(
    () =>
      analyzeWordFrequency(input, {
        caseSensitive,
        ignoreStopWords,
        minWordLength,
        topN,
        sortBy,
      }),
    [input, caseSensitive, ignoreStopWords, minWordLength, topN, sortBy],
  );

  const csv = useMemo(() => wordFrequencyToCsv(result.rows), [result.rows]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={(e) => {
              touch();
              setCaseSensitive(e.target.checked);
            }}
          />
          Case sensitive
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <input
            type="checkbox"
            checked={ignoreStopWords}
            onChange={(e) => {
              touch();
              setIgnoreStopWords(e.target.checked);
            }}
          />
          Ignore stop words
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Min length
          <input
            type="number"
            min={1}
            max={20}
            value={minWordLength}
            onChange={(e) => {
              touch();
              setMinWordLength(Number(e.target.value));
            }}
            className="w-20 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[var(--foreground)]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Top N
          <input
            type="number"
            min={1}
            max={500}
            value={topN}
            onChange={(e) => {
              touch();
              setTopN(Number(e.target.value));
            }}
            className="w-24 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[var(--foreground)]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Sort
          <select
            value={sortBy}
            onChange={(e) => {
              touch();
              setSortBy(e.target.value as WordFrequencyOptions["sortBy"]);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1 text-[var(--foreground)]"
          >
            <option value="count">By count</option>
            <option value="alpha">A → Z</option>
          </select>
        </label>
        <CopyButton getText={() => csv} label="Copy CSV" />
      </div>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {(
          [
            ["Total words", result.totalWords],
            ["Unique words", result.uniqueWords],
            ["Shown", result.rows.length],
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

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="Text" getText={() => input} />
          <CodeEditor
            language="text"
            value={input}
            onChange={(v) => {
              touch();
              setInput(v);
            }}
            minHeight="40vh"
          />
        </div>
        <div className="overflow-auto rounded-xl border border-[var(--border)]">
          <table className="w-full min-w-[280px] text-left text-sm">
            <thead className="bg-[var(--surface)] text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
              <tr>
                <th className="px-3 py-2">#</th>
                <th className="px-3 py-2">Word</th>
                <th className="px-3 py-2">Count</th>
                <th className="px-3 py-2">%</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-6 text-center text-[var(--muted)]"
                  >
                    No words to count.
                  </td>
                </tr>
              ) : (
                result.rows.map((row) => (
                  <tr
                    key={`${row.rank}-${row.word}`}
                    className="border-t border-[var(--border)]"
                  >
                    <td className="px-3 py-1.5 font-[family-name:var(--font-mono)] text-[var(--muted)]">
                      {row.rank}
                    </td>
                    <td className="px-3 py-1.5 text-[var(--foreground)]">
                      {row.word}
                    </td>
                    <td className="px-3 py-1.5 font-[family-name:var(--font-mono)]">
                      {row.count}
                    </td>
                    <td className="px-3 py-1.5 font-[family-name:var(--font-mono)] text-[var(--muted)]">
                      {row.percent}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
