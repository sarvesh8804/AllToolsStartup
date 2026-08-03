"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { CopyButton } from "@/components/editor/CopyButton";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  buildSchemaMarkup,
  SAMPLE_FAQ_SCHEMA,
  SAMPLE_HOWTO_SCHEMA,
  type FaqItem,
  type HowToStep,
  type SchemaMarkupType,
} from "@/lib/seo/schema-markup";
import { track } from "@/lib/analytics";

export function SchemaMarkupGeneratorTool() {
  const [type, setType] = useState<SchemaMarkupType>("FAQPage");
  const [faqItems, setFaqItems] = useState<FaqItem[]>(SAMPLE_FAQ_SCHEMA.items);
  const [howToName, setHowToName] = useState(SAMPLE_HOWTO_SCHEMA.name);
  const [howToDescription, setHowToDescription] = useState(SAMPLE_HOWTO_SCHEMA.description);
  const [howToTime, setHowToTime] = useState(SAMPLE_HOWTO_SCHEMA.totalTime ?? "");
  const [steps, setSteps] = useState<HowToStep[]>(SAMPLE_HOWTO_SCHEMA.steps);
  const [wrapScript, setWrapScript] = useState(true);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "schema-markup-generator", family: "tools" });
    }
  }, [started]);

  const result = useMemo(() => {
    if (type === "FAQPage") {
      return buildSchemaMarkup({ type, items: faqItems });
    }
    return buildSchemaMarkup({
      type: "HowTo",
      name: howToName,
      description: howToDescription,
      totalTime: howToTime || undefined,
      steps,
    });
  }, [type, faqItems, howToName, howToDescription, howToTime, steps]);

  const output = result.ok ? (wrapScript ? result.script : result.json) : "";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        {(["FAQPage", "HowTo"] as SchemaMarkupType[]).map((value) => (
          <button key={value} type="button" onClick={() => { markStart(); setType(value); }}
            className={`rounded-md border px-3 py-1.5 text-sm ${type === value ? "border-[var(--accent)] bg-[var(--accent)]/15" : "border-[var(--border)] text-[var(--muted)]"}`}>
            {value}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 text-sm text-[var(--foreground)]">
          <input type="checkbox" checked={wrapScript} onChange={(e) => { markStart(); setWrapScript(e.target.checked); }} />
          Wrap in script tag
        </label>
      </div>

      {type === "FAQPage" ? (
        <div className="space-y-3">
          {faqItems.map((item, index) => (
            <div key={index} className="grid gap-2 rounded-lg border border-[var(--border)] p-3 sm:grid-cols-2">
              <input value={item.question} placeholder="Question" onChange={(e) => {
                markStart();
                setFaqItems((prev) => prev.map((row, i) => i === index ? { ...row, question: e.target.value } : row));
              }} className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm" />
              <input value={item.answer} placeholder="Answer" onChange={(e) => {
                markStart();
                setFaqItems((prev) => prev.map((row, i) => i === index ? { ...row, answer: e.target.value } : row));
              }} className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm" />
            </div>
          ))}
          <button type="button" onClick={() => { markStart(); setFaqItems((prev) => [...prev, { question: "", answer: "" }]); }}
            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm">Add FAQ</button>
        </div>
      ) : (
        <div className="space-y-3">
          <input value={howToName} onChange={(e) => { markStart(); setHowToName(e.target.value); }} placeholder="HowTo name"
            className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2" />
          <textarea value={howToDescription} onChange={(e) => { markStart(); setHowToDescription(e.target.value); }} rows={2} placeholder="Description"
            className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2" />
          <input value={howToTime} onChange={(e) => { markStart(); setHowToTime(e.target.value); }} placeholder="Total time (e.g. PT15M)"
            className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm" />
          {steps.map((step, index) => (
            <div key={index} className="grid gap-2 rounded-lg border border-[var(--border)] p-3 sm:grid-cols-2">
              <input value={step.name} placeholder="Step name" onChange={(e) => {
                markStart();
                setSteps((prev) => prev.map((row, i) => i === index ? { ...row, name: e.target.value } : row));
              }} className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm" />
              <input value={step.text} placeholder="Step text" onChange={(e) => {
                markStart();
                setSteps((prev) => prev.map((row, i) => i === index ? { ...row, text: e.target.value } : row));
              }} className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm" />
            </div>
          ))}
          <button type="button" onClick={() => { markStart(); setSteps((prev) => [...prev, { name: "", text: "" }]); }}
            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm">Add step</button>
        </div>
      )}

      {!result.ok ? <ToolErrorState message={result.error} /> : (
        <>
          {result.warnings.length > 0 ? (
            <ul className="rounded-lg border border-[var(--border)] px-4 py-3 text-sm text-[var(--muted)]">
              {result.warnings.map((w) => <li key={w}>• {w}</li>)}
            </ul>
          ) : null}
          <div className="flex gap-2">
            <CopyButton getText={() => output} label="Copy output" />
          </div>
          <CodeEditor value={output} language="json" editable={false} minHeight="45vh" />
        </>
      )}
    </div>
  );
}
