"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import {
  DEFAULT_README_INPUT,
  README_SECTION_OPTIONS,
  buildReadme,
  type ReadmeInput,
  type ReadmeSectionId,
} from "@/lib/generate/readme";
import { track } from "@/lib/analytics";

export function ReadmeGeneratorTool() {
  const [form, setForm] = useState<ReadmeInput>(DEFAULT_README_INPUT);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "readme-generator",
        family: "tools",
      });
    }
  }, [started]);

  const markdown = useMemo(() => buildReadme(form), [form]);

  const patch = <K extends keyof ReadmeInput>(key: K, value: ReadmeInput[K]) => {
    markStart();
    setForm((prev) => ({ ...prev, [key]: value }));
    track({
      name: "tool_complete",
      tool: "readme-generator",
      family: "tools",
    });
  };

  const toggleSection = (id: ReadmeSectionId) => {
    markStart();
    setForm((prev) => {
      const on = prev.sections.includes(id);
      return {
        ...prev,
        sections: on
          ? prev.sections.filter((s) => s !== id)
          : [...prev.sections, id],
      };
    });
    track({
      name: "tool_complete",
      tool: "readme-generator",
      family: "tools",
    });
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          {(
            [
              ["title", "Project title", "text"],
              ["tagline", "Tagline", "text"],
              ["description", "Description", "textarea"],
              ["features", "Features (one per line)", "textarea"],
              ["install", "Installation", "textarea"],
              ["usage", "Usage", "textarea"],
              ["api", "API", "textarea"],
              ["contributing", "Contributing", "textarea"],
              ["license", "License", "text"],
              ["author", "Author", "text"],
              ["repoUrl", "Repository URL", "text"],
              ["badgesMarkdown", "Badges markdown (optional)", "textarea"],
            ] as const
          ).map(([key, label, kind]) => (
            <label
              key={key}
              className="flex flex-col gap-1 text-sm text-[var(--muted)]"
            >
              {label}
              {kind === "textarea" ? (
                <textarea
                  rows={key === "usage" || key === "features" ? 4 : 3}
                  value={form[key]}
                  onChange={(e) => patch(key, e.target.value)}
                  className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]"
                  spellCheck={key === "description" || key === "contributing"}
                />
              ) : (
                <input
                  type="text"
                  value={form[key]}
                  onChange={(e) => patch(key, e.target.value)}
                  className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
                />
              )}
            </label>
          ))}
        </div>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
              Sections
            </p>
            <div className="flex flex-wrap gap-2">
              {README_SECTION_OPTIONS.map((s) => {
                const on = form.sections.includes(s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSection(s.id)}
                    className={
                      on
                        ? "rounded-md border border-[var(--accent)] bg-[var(--surface-2)] px-3 py-1.5 text-sm text-[var(--foreground)]"
                        : "rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] hover:border-[var(--accent)]/50"
                    }
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <EditorPaneHeader label="README.md" getText={() => markdown} />
            <CodeEditor
              language="markdown"
              value={markdown}
              editable={false}
              minHeight="50vh"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
