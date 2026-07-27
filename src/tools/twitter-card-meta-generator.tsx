"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { CopyButton } from "@/components/editor/CopyButton";
import {
  DEFAULT_TWITTER_CARD_INPUT,
  TWITTER_CARD_TYPES,
  buildTwitterCardHtml,
  type TwitterCardInput,
  type TwitterCardType,
} from "@/lib/seo/twitter-card";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";
import Link from "next/link";

export function TwitterCardMetaGeneratorTool() {
  const [form, setForm] = useState<TwitterCardInput>(DEFAULT_TWITTER_CARD_INPUT);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "twitter-card-meta-generator",
        family: "tools",
      });
    }
  }, [started]);

  const output = useMemo(() => buildTwitterCardHtml(form), [form]);

  const patch = <K extends keyof TwitterCardInput>(
    key: K,
    value: TwitterCardInput[K],
  ) => {
    markStart();
    setForm((prev) => ({ ...prev, [key]: value }));
    track({
      name: "tool_complete",
      tool: "twitter-card-meta-generator",
      family: "tools",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {TWITTER_CARD_TYPES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => patch("card", t.id as TwitterCardType)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-left text-sm",
              form.card === t.id
                ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--foreground)]"
                : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/50",
            )}
          >
            <span className="block font-medium">{t.label}</span>
            <span className="block text-xs opacity-80">{t.hint}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          {(
            [
              ["title", "twitter:title", "text"],
              ["description", "twitter:description", "textarea"],
              ["url", "twitter:url", "text"],
              ["imageUrl", "twitter:image (absolute URL)", "text"],
              ["imageAlt", "twitter:image:alt", "text"],
              ["site", "twitter:site (@handle)", "text"],
              ["creator", "twitter:creator (@handle)", "text"],
            ] as const
          ).map(([key, label, kind]) => (
            <label
              key={key}
              className="flex flex-col gap-1 text-sm text-[var(--muted)]"
            >
              {label}
              {kind === "textarea" ? (
                <textarea
                  rows={3}
                  value={form[key]}
                  onChange={(e) => patch(key, e.target.value)}
                  className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
                />
              ) : (
                <input
                  type="text"
                  value={form[key]}
                  onChange={(e) => patch(key, e.target.value)}
                  className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]"
                />
              )}
            </label>
          ))}

          {form.card === "player" ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="flex flex-col gap-1 text-sm text-[var(--muted)] sm:col-span-3">
                twitter:player
                <input
                  type="text"
                  value={form.playerUrl}
                  onChange={(e) => patch("playerUrl", e.target.value)}
                  className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
                Width
                <input
                  type="text"
                  value={form.playerWidth}
                  onChange={(e) => patch("playerWidth", e.target.value)}
                  className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
                Height
                <input
                  type="text"
                  value={form.playerHeight}
                  onChange={(e) => patch("playerHeight", e.target.value)}
                  className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]"
                />
              </label>
            </div>
          ) : null}

          {form.card === "app" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["appNameIphone", "App name (iPhone)"],
                  ["appIdIphone", "App id (iPhone)"],
                  ["appNameGoogleplay", "App name (Google Play)"],
                  ["appIdGoogleplay", "App id (Google Play)"],
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
        </div>

        <div className="space-y-4">
          <div
            className={cn(
              "overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]",
              form.card === "summary" ? "flex" : "block",
            )}
          >
            {form.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={form.imageUrl}
                alt={form.imageAlt || ""}
                className={
                  form.card === "summary"
                    ? "h-28 w-28 shrink-0 object-cover"
                    : "aspect-[1.91/1] w-full object-cover"
                }
              />
            ) : (
              <div
                className={
                  form.card === "summary"
                    ? "flex h-28 w-28 shrink-0 items-center justify-center bg-[var(--border)] text-xs text-[var(--muted)]"
                    : "flex aspect-[1.91/1] w-full items-center justify-center bg-[var(--border)] text-sm text-[var(--muted)]"
                }
              >
                No image
              </div>
            )}
            <div className="min-w-0 flex-1 space-y-1 p-3">
              <p className="truncate text-sm font-medium text-[var(--foreground)]">
                {form.title || "Title"}
              </p>
              <p className="line-clamp-2 text-xs text-[var(--muted)]">
                {form.description || "Description"}
              </p>
              <p className="truncate text-xs text-[var(--muted)]">
                {form.url || "example.com"}
              </p>
            </div>
          </div>

          {output.warnings.length > 0 ? (
            <ul className="space-y-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--accent-bright)]">
              {output.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          ) : null}

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <EditorPaneHeader label="HTML" getText={() => output.html} />
              <CopyButton getText={() => output.html} label="Copy" />
            </div>
            <CodeEditor
              language="text"
              value={output.html}
              editable={false}
              minHeight="28vh"
            />
          </div>
        </div>
      </div>

      <p className="text-sm text-[var(--muted)]">
        Need Open Graph too?{" "}
        <Link
          href="/tools/open-graph-meta-generator"
          className="text-[var(--accent-bright)] underline-offset-2 hover:underline"
        >
          Open Graph Meta Generator
        </Link>
        .
      </p>
    </div>
  );
}
