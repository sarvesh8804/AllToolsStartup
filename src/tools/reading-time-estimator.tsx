"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import {
  DEFAULT_READING_TIME_OPTIONS,
  estimateReadingTime,
  type ReadingTimeOptions,
} from "@/lib/text/reading-time";
import { track } from "@/lib/analytics";
import Link from "next/link";

const SAMPLE = `Forge ships browser-first tools that run entirely on your device.

Paste an article, blog post, or documentation draft here to estimate how long it takes to read silently and how long it would take to speak aloud. Adjust words-per-minute to match your audience.

Short paragraphs work best for scanning. Longer essays benefit from a slower reading pace setting.`;

export function ReadingTimeEstimatorTool() {
  const [input, setInput] = useState(SAMPLE);
  const [options, setOptions] = useState<ReadingTimeOptions>(
    DEFAULT_READING_TIME_OPTIONS,
  );
  const [started, setStarted] = useState(false);

  const estimate = useMemo(
    () => estimateReadingTime(input, options),
    [input, options],
  );

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "reading-time-estimator",
        family: "tools",
      });
    }
  }, [started]);

  const onChange = (v: string) => {
    markStart();
    setInput(v);
    track({
      name: "tool_complete",
      tool: "reading-time-estimator",
      family: "tools",
    });
  };

  const cards = [
    { label: "Reading time", value: estimate.readingLabel },
    { label: "Speaking time", value: estimate.speakingLabel },
    { label: "Words", value: String(estimate.words) },
    { label: "Sentences", value: String(estimate.sentences) },
    { label: "Paragraphs", value: String(estimate.paragraphs) },
    { label: "Characters", value: String(estimate.characters) },
  ];

  return (
    <div className="space-y-5">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
          >
            <dt className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
              {c.label}
            </dt>
            <dd className="mt-1 font-[family-name:var(--font-mono)] text-xl text-[var(--foreground)] sm:text-2xl">
              {c.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Reading speed: {options.readingWpm} WPM
          <input
            type="range"
            min={100}
            max={400}
            step={10}
            value={options.readingWpm}
            onChange={(e) => {
              markStart();
              setOptions((o) => ({
                ...o,
                readingWpm: Number(e.target.value),
              }));
            }}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Speaking speed: {options.speakingWpm} WPM
          <input
            type="range"
            min={100}
            max={250}
            step={5}
            value={options.speakingWpm}
            onChange={(e) => {
              markStart();
              setOptions((o) => ({
                ...o,
                speakingWpm: Number(e.target.value),
              }));
            }}
          />
        </label>
      </div>

      <div>
        <EditorPaneHeader label="Text" getText={() => input} />
        <CodeEditor
          language="text"
          value={input}
          onChange={onChange}
          minHeight="40vh"
        />
      </div>

      <p className="text-sm text-[var(--muted)]">
        Defaults assume ~200 WPM reading and ~150 WPM speaking. For raw counts,
        see{" "}
        <Link
          href="/tools/word-counter"
          className="text-[var(--accent-bright)] underline-offset-2 hover:underline"
        >
          Word Counter
        </Link>
        .
      </p>
    </div>
  );
}
