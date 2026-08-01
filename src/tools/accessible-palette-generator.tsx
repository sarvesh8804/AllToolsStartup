"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { CopyButton } from "@/components/editor/CopyButton";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  generateAccessiblePalette,
  paletteToJson,
  type AccessibleTheme,
  type WcagLevel,
} from "@/lib/color/accessible-palette";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

export function AccessiblePaletteGeneratorTool() {
  const [input, setInput] = useState("#c4a70a");
  const [theme, setTheme] = useState<AccessibleTheme>("light");
  const [level, setLevel] = useState<WcagLevel>("AA");
  const [started, setStarted] = useState(false);

  const result = useMemo(
    () => generateAccessiblePalette(input, { theme, level }),
    [input, theme, level],
  );

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "accessible-palette-generator",
        family: "tools",
      });
    }
  }, [started]);

  const touch = useCallback(() => {
    markStart();
    track({
      name: "tool_complete",
      tool: "accessible-palette-generator",
      family: "tools",
    });
  }, [markStart]);

  const jsonExport = useMemo(
    () => (result.ok ? paletteToJson(result) : ""),
    [result],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Brand / primary color
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={result.ok ? result.colors[2]?.hex ?? "#c4a70a" : "#c4a70a"}
              onChange={(e) => {
                touch();
                setInput(e.target.value);
              }}
              className="h-10 w-12 cursor-pointer rounded border border-[var(--border)] bg-[var(--surface)]"
              aria-label="Color picker"
            />
            <input
              value={input}
              onChange={(e) => {
                touch();
                setInput(e.target.value);
              }}
              className="w-56 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
              spellCheck={false}
            />
          </div>
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Theme
          <select
            value={theme}
            onChange={(e) => {
              touch();
              setTheme(e.target.value as AccessibleTheme);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          WCAG level
          <select
            value={level}
            onChange={(e) => {
              touch();
              setLevel(e.target.value as WcagLevel);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
          >
            <option value="AA">AA (4.5:1 text)</option>
            <option value="AAA">AAA (7:1 text)</option>
          </select>
        </label>
      </div>

      {!result.ok ? (
        <ToolErrorState message={result.error} />
      ) : (
        <>
          <div
            className="flex h-28 overflow-hidden rounded-xl border border-[var(--border)]"
            aria-hidden
          >
            {result.colors.slice(0, 6).map((c) => (
              <div
                key={c.token}
                className="flex-1"
                style={{ background: c.hex }}
                title={c.name}
              />
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {result.colors.map((c) => (
              <div
                key={c.token}
                className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]"
              >
                <div className="h-16" style={{ background: c.hex }} />
                <div className="space-y-1 p-3">
                  <p className="text-sm font-medium text-[var(--foreground)]">
                    {c.name}
                  </p>
                  <p className="text-xs text-[var(--muted)]">{c.role}</p>
                  <code className="block font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
                    {c.token}
                  </code>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <code className="font-[family-name:var(--font-mono)] text-sm">
                      {c.hex}
                    </code>
                    <CopyButton
                      getText={() => c.hex}
                      label="Copy"
                      className="!py-1 !text-xs"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <section className="space-y-3">
            <h2 className="text-lg font-medium text-[var(--foreground)]">
              Contrast pairs
            </h2>
            <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
              <table className="w-full min-w-[32rem] text-left text-sm">
                <thead className="border-b border-[var(--border)] bg-[var(--surface)] text-xs uppercase tracking-wide text-[var(--muted)]">
                  <tr>
                    <th className="px-4 py-3">Pair</th>
                    <th className="px-4 py-3">Ratio</th>
                    <th className="px-4 py-3">Normal text</th>
                    <th className="px-4 py-3">Preview</th>
                  </tr>
                </thead>
                <tbody>
                  {result.pairs.map((pair) => (
                    <tr
                      key={pair.id}
                      className="border-b border-[var(--border)] last:border-0"
                    >
                      <td className="px-4 py-3 text-[var(--foreground)]">
                        {pair.label}
                      </td>
                      <td className="px-4 py-3 font-[family-name:var(--font-mono)]">
                        {pair.ratioLabel}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "rounded px-2 py-0.5 text-xs font-medium",
                            pair.passesNormal
                              ? "bg-[var(--success-bg)] text-[var(--success)]"
                              : "bg-[var(--danger-bg)] text-[var(--danger)]",
                          )}
                        >
                          {pair.passesNormal ? "Pass" : "Fail"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div
                          className="inline-flex min-w-[8rem] rounded-md border border-[var(--border)] px-3 py-1.5 text-sm"
                          style={{
                            color: pair.foreground,
                            background: pair.background,
                          }}
                        >
                          Sample
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <div>
            <EditorPaneHeader
              label="CSS variables"
              getText={() => result.cssVariables}
              copyLabel="Copy CSS"
            />
            <CodeEditor
              value={result.cssVariables}
              editable={false}
              minHeight="10rem"
            />
          </div>

          <div>
            <EditorPaneHeader
              label="JSON tokens"
              getText={() => jsonExport}
              copyLabel="Copy JSON"
            />
            <CodeEditor
              language="json"
              value={jsonExport}
              editable={false}
              minHeight="10rem"
            />
          </div>
        </>
      )}
    </div>
  );
}
