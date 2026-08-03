"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  SAMPLE_ENV,
  SAMPLE_INI,
  convertIniEnv,
  type IniEnvFormat,
} from "@/lib/format/ini-env";
import { track } from "@/lib/analytics";

export function IniEnvParserTool() {
  const [from, setFrom] = useState<IniEnvFormat>("env");
  const [to, setTo] = useState<IniEnvFormat>("json");
  const [input, setInput] = useState(SAMPLE_ENV);
  const [started, setStarted] = useState(false);

  const result = useMemo(() => convertIniEnv(input, from, to), [input, from, to]);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "ini-env-parser", family: "tools" });
    }
  }, [started]);

  const loadSample = (format: IniEnvFormat) => {
    markStart();
    setFrom(format);
    setInput(format === "ini" ? SAMPLE_INI : format === "env" ? SAMPLE_ENV : '{\n  "APP_NAME": "Forge"\n}');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          From
          <select value={from} onChange={(e) => { markStart(); setFrom(e.target.value as IniEnvFormat); }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--foreground)]">
            <option value="env">.env</option>
            <option value="ini">INI</option>
            <option value="json">JSON</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          To
          <select value={to} onChange={(e) => { markStart(); setTo(e.target.value as IniEnvFormat); }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--foreground)]">
            <option value="json">JSON</option>
            <option value="env">.env</option>
            <option value="ini">INI</option>
          </select>
        </label>
        <div className="flex gap-2">
          <button type="button" onClick={() => loadSample("env")} className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm">ENV sample</button>
          <button type="button" onClick={() => loadSample("ini")} className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm">INI sample</button>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="Input" getText={() => input} />
          <CodeEditor language={from === "json" ? "json" : "text"} value={input} onChange={(v) => { markStart(); setInput(v); }} minHeight="55vh" />
        </div>
        <div>
          <EditorPaneHeader label="Output" getText={() => (result.ok ? result.output : "")} />
          {!result.ok ? <ToolErrorState message={result.error} /> : (
            <CodeEditor language={to === "json" ? "json" : "text"} value={result.output} editable={false} minHeight="55vh" />
          )}
        </div>
      </div>
    </div>
  );
}
