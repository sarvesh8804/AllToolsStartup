"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import {
  DEFAULT_DOCKERFILE_OPTIONS,
  DOCKERFILE_TEMPLATES,
  generateDockerfile,
  getDockerfileTemplate,
  type DockerfileOptions,
} from "@/lib/generate/dockerfile";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

export function DockerfileGeneratorTool() {
  const [options, setOptions] = useState<DockerfileOptions>(
    DEFAULT_DOCKERFILE_OPTIONS,
  );
  const [started, setStarted] = useState(false);

  const output = useMemo(() => generateDockerfile(options), [options]);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "dockerfile-generator",
        family: "tools",
      });
    }
  }, [started]);

  const complete = useCallback(() => {
    track({
      name: "tool_complete",
      tool: "dockerfile-generator",
      family: "tools",
    });
  }, []);

  const update = (patch: Partial<DockerfileOptions>) => {
    markStart();
    setOptions((prev) => ({ ...prev, ...patch }));
    complete();
  };

  const selectTemplate = (id: string) => {
    const tpl = getDockerfileTemplate(id);
    if (!tpl) return;
    markStart();
    setOptions({ ...tpl.defaults });
    complete();
  };

  const showMultiStage =
    options.templateId === "node" ||
    options.templateId === "nextjs" ||
    options.templateId === "go";

  return (
    <div className="space-y-5">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {DOCKERFILE_TEMPLATES.map((tpl) => {
          const on = options.templateId === tpl.id;
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => selectTemplate(tpl.id)}
              className={cn(
                "rounded-xl border px-3 py-3 text-left transition",
                on
                  ? "border-[var(--accent)] bg-[var(--surface-2)]"
                  : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/50",
              )}
            >
              <span className="block text-sm font-medium text-[var(--foreground)]">
                {tpl.label}
              </span>
              <span className="mt-0.5 block text-xs text-[var(--muted)]">
                {tpl.description}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Runtime / base tag
          <input
            value={options.runtimeVersion}
            onChange={(e) => update({ runtimeVersion: e.target.value })}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]"
            spellCheck={false}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Port
          <input
            type="number"
            min={1}
            max={65535}
            value={options.port}
            onChange={(e) => update({ port: Number(e.target.value) })}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]"
          />
        </label>
        {options.templateId === "node" || options.templateId === "python" ? (
          <>
            <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
              Workdir
              <input
                value={options.workdir}
                onChange={(e) => update({ workdir: e.target.value })}
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]"
                spellCheck={false}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
              Start command
              <input
                value={options.startCommand}
                onChange={(e) => update({ startCommand: e.target.value })}
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]"
                spellCheck={false}
              />
            </label>
          </>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-[var(--muted)]">
        {options.templateId !== "static" ? (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={options.nonRootUser}
              onChange={(e) => update({ nonRootUser: e.target.checked })}
            />
            Non-root user
          </label>
        ) : null}
        {showMultiStage && options.templateId === "node" ? (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={options.multiStage}
              onChange={(e) => update({ multiStage: e.target.checked })}
            />
            Multi-stage build
          </label>
        ) : null}
        {options.templateId === "nextjs" || options.templateId === "go" ? (
          <span className="text-xs">
            This template always uses a multi-stage build.
          </span>
        ) : null}
      </div>

      <div>
        <EditorPaneHeader label="Dockerfile" getText={() => output} />
        <CodeEditor
          language="text"
          value={output}
          editable={false}
          minHeight="40vh"
        />
      </div>
    </div>
  );
}
