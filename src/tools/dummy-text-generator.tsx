"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import {
  DEFAULT_DUMMY_TEXT_OPTIONS,
  generateDummyText,
} from "@/lib/text/dummy-text";
import { track } from "@/lib/analytics";

export function DummyTextGeneratorTool() {
  const [paragraphs, setParagraphs] = useState(
    DEFAULT_DUMMY_TEXT_OPTIONS.paragraphs,
  );
  const [sentencesPerParagraph, setSentencesPerParagraph] = useState(
    DEFAULT_DUMMY_TEXT_OPTIONS.sentencesPerParagraph,
  );
  const [wordsPerSentence, setWordsPerSentence] = useState(
    DEFAULT_DUMMY_TEXT_OPTIONS.wordsPerSentence,
  );
  const [startWithOpener, setStartWithOpener] = useState(true);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "dummy-text-generator",
        family: "tools",
      });
    }
  }, [started]);

  const markComplete = useCallback(() => {
    if (!completed) {
      setCompleted(true);
      track({
        name: "tool_complete",
        tool: "dummy-text-generator",
        family: "tools",
      });
    }
  }, [completed]);

  const output = useMemo(() => {
    const text = generateDummyText({
      paragraphs,
      sentencesPerParagraph,
      wordsPerSentence,
      startWithOpener,
    });
    return text;
  }, [paragraphs, sentencesPerParagraph, wordsPerSentence, startWithOpener]);

  const touch = () => {
    markStart();
    markComplete();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Paragraphs
          <input
            type="number"
            min={1}
            max={50}
            value={paragraphs}
            onChange={(e) => {
              touch();
              setParagraphs(Number(e.target.value));
            }}
            className="w-24 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[var(--foreground)]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Sentences / paragraph
          <input
            type="number"
            min={1}
            max={12}
            value={sentencesPerParagraph}
            onChange={(e) => {
              touch();
              setSentencesPerParagraph(Number(e.target.value));
            }}
            className="w-28 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[var(--foreground)]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Words / sentence
          <input
            type="number"
            min={4}
            max={30}
            value={wordsPerSentence}
            onChange={(e) => {
              touch();
              setWordsPerSentence(Number(e.target.value));
            }}
            className="w-28 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[var(--foreground)]"
          />
        </label>
        <label className="flex items-center gap-2 pb-1.5 text-sm text-[var(--muted)]">
          <input
            type="checkbox"
            checked={startWithOpener}
            onChange={(e) => {
              touch();
              setStartWithOpener(e.target.checked);
            }}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          English opener
        </label>
      </div>

      <p className="text-sm text-[var(--muted)]">
        English placeholder paragraphs (not Latin Lorem). Deterministic for the
        same settings.
      </p>

      <div>
        <EditorPaneHeader label="Output" getText={() => output} />
        <CodeEditor
          language="text"
          value={output}
          editable={false}
          minHeight="50vh"
        />
      </div>
    </div>
  );
}
