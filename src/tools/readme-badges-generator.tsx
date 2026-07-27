"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import {
  BADGE_PRESET_OPTIONS,
  DEFAULT_BADGE_INPUT,
  buildReadmeBadges,
  type BadgeGeneratorInput,
  type BadgePresetId,
  type BadgeStyle,
} from "@/lib/generate/readme-badges";
import { track } from "@/lib/analytics";
import Link from "next/link";

const STYLES: BadgeStyle[] = [
  "flat",
  "flat-square",
  "plastic",
  "for-the-badge",
  "social",
];

export function ReadmeBadgesGeneratorTool() {
  const [form, setForm] = useState<BadgeGeneratorInput>(DEFAULT_BADGE_INPUT);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "readme-badges-generator",
        family: "tools",
      });
    }
  }, [started]);

  const { markdown, badges } = useMemo(
    () => buildReadmeBadges(form),
    [form],
  );

  const patch = <K extends keyof BadgeGeneratorInput>(
    key: K,
    value: BadgeGeneratorInput[K],
  ) => {
    markStart();
    setForm((prev) => ({ ...prev, [key]: value }));
    track({
      name: "tool_complete",
      tool: "readme-badges-generator",
      family: "tools",
    });
  };

  const togglePreset = (id: BadgePresetId) => {
    markStart();
    setForm((prev) => {
      const on = prev.presets.includes(id);
      return {
        ...prev,
        presets: on
          ? prev.presets.filter((p) => p !== id)
          : [...prev.presets, id],
      };
    });
    track({
      name: "tool_complete",
      tool: "readme-badges-generator",
      family: "tools",
    });
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-[var(--muted)]">
        Builds{" "}
        <a
          href="https://shields.io"
          target="_blank"
          rel="noreferrer"
          className="text-[var(--accent-bright)] underline-offset-2 hover:underline"
        >
          shields.io
        </a>{" "}
        markdown. Paste into a README or the{" "}
        <Link
          href="/tools/readme-generator"
          className="text-[var(--accent-bright)] underline-offset-2 hover:underline"
        >
          README Generator
        </Link>
        .
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(
          [
            ["githubUser", "GitHub user"],
            ["githubRepo", "GitHub repo"],
            ["npmPackage", "npm package"],
            ["license", "License"],
            ["language", "Language"],
            ["nodeVersion", "Node version"],
          ] as const
        ).map(([key, label]) => (
          <label
            key={key}
            className="flex flex-col gap-1 text-sm text-[var(--muted)]"
          >
            {label}
            <input
              type="text"
              value={form[key]}
              onChange={(e) => patch(key, e.target.value)}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]"
            />
          </label>
        ))}

        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Style
          <select
            value={form.style}
            onChange={(e) => patch("style", e.target.value as BadgeStyle)}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-2 text-[var(--foreground)]"
          >
            {STYLES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      {form.presets.includes("custom") ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {(
            [
              ["customLabel", "Custom label"],
              ["customMessage", "Custom message"],
              ["customColor", "Custom color"],
            ] as const
          ).map(([key, label]) => (
            <label
              key={key}
              className="flex flex-col gap-1 text-sm text-[var(--muted)]"
            >
              {label}
              <input
                type="text"
                value={form[key]}
                onChange={(e) => patch(key, e.target.value)}
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]"
              />
            </label>
          ))}
        </div>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {BADGE_PRESET_OPTIONS.map((p) => {
          const on = form.presets.includes(p.id);
          return (
            <label
              key={p.id}
              className={
                on
                  ? "flex cursor-pointer gap-3 rounded-xl border border-[var(--accent)] bg-[var(--surface-2)] px-3 py-3"
                  : "flex cursor-pointer gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-3 hover:border-[var(--accent)]/50"
              }
            >
              <input
                type="checkbox"
                checked={on}
                onChange={() => togglePreset(p.id)}
                className="mt-1 h-4 w-4 accent-[var(--accent)]"
              />
              <span>
                <span className="block text-sm font-medium text-[var(--foreground)]">
                  {p.label}
                </span>
                <span className="mt-0.5 block text-xs text-[var(--muted)]">
                  {p.description}
                </span>
              </span>
            </label>
          );
        })}
      </div>

      {badges.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          {badges.map((b) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={b.image} src={b.image} alt={b.alt} className="h-5" />
          ))}
        </div>
      ) : null}

      <div>
        <EditorPaneHeader label="Markdown" getText={() => markdown} />
        <CodeEditor
          language="markdown"
          value={markdown || "Select at least one badge."}
          editable={false}
          minHeight="20vh"
        />
      </div>
    </div>
  );
}
