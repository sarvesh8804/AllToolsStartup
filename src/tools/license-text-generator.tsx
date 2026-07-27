"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import {
  LICENSE_OPTIONS,
  generateLicenseText,
  type LicenseId,
} from "@/lib/generate/license";
import { track } from "@/lib/analytics";

export function LicenseTextGeneratorTool() {
  const [id, setId] = useState<LicenseId>("mit");
  const [year, setYear] = useState(() =>
    String(new Date().getFullYear()),
  );
  const [holder, setHolder] = useState("Your Name");
  const [project, setProject] = useState("My Project");
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "license-text-generator",
        family: "tools",
      });
    }
  }, [started]);

  const text = useMemo(
    () => generateLicenseText({ id, year, holder, project }),
    [id, year, holder, project],
  );

  const meta = LICENSE_OPTIONS.find((l) => l.id === id)!;

  return (
    <div className="space-y-5">
      <p className="text-sm text-[var(--muted)]">
        Templates for common open-source licenses. This is not legal advice —
        read the full license text before shipping.
      </p>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {LICENSE_OPTIONS.map((opt) => {
          const on = opt.id === id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => {
                markStart();
                setId(opt.id);
                track({
                  name: "tool_complete",
                  tool: "license-text-generator",
                  family: "tools",
                });
              }}
              className={
                on
                  ? "rounded-xl border border-[var(--accent)] bg-[var(--surface-2)] px-3 py-3 text-left"
                  : "rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3 text-left hover:border-[var(--accent)]/50"
              }
            >
              <span className="block text-sm font-medium text-[var(--foreground)]">
                {opt.name}
              </span>
              <span className="mt-0.5 block font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
                {opt.spdx}
              </span>
              <span className="mt-1 block text-xs text-[var(--muted)]">
                {opt.description}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Year
          <input
            type="text"
            value={year}
            onChange={(e) => {
              markStart();
              setYear(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Copyright holder
          <input
            type="text"
            value={holder}
            onChange={(e) => {
              markStart();
              setHolder(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Project name (GPL notice)
          <input
            type="text"
            value={project}
            disabled={id !== "gpl-3.0"}
            onChange={(e) => {
              markStart();
              setProject(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)] disabled:opacity-50"
          />
        </label>
      </div>

      <p className="text-sm text-[var(--muted)]">
        Selected: <span className="text-[var(--foreground)]">{meta.name}</span>{" "}
        ({meta.spdx})
      </p>

      <div>
        <EditorPaneHeader label="LICENSE" getText={() => text} />
        <CodeEditor
          language="text"
          value={text}
          editable={false}
          minHeight="50vh"
        />
      </div>
    </div>
  );
}
