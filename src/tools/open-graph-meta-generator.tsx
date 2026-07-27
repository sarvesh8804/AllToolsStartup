"use client";

import { useCallback, useMemo, useState } from "react";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import {
  DEFAULT_OG_INPUT,
  buildOpenGraphHtml,
  type OpenGraphInput,
} from "@/lib/seo/open-graph";
import { track } from "@/lib/analytics";

export function OpenGraphMetaGeneratorTool() {
  const [form, setForm] = useState<OpenGraphInput>(DEFAULT_OG_INPUT);
  const [copied, setCopied] = useState(false);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "open-graph-meta-generator",
        family: "tools",
      });
    }
  }, [started]);

  const output = useMemo(() => buildOpenGraphHtml(form), [form]);

  const patch = <K extends keyof OpenGraphInput>(
    key: K,
    value: OpenGraphInput[K],
  ) => {
    markStart();
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const copyHtml = async () => {
    markStart();
    try {
      await navigator.clipboard.writeText(output.html);
      setCopied(true);
      track({
        name: "tool_complete",
        tool: "open-graph-meta-generator",
        family: "tools",
      });
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          {(
            [
              ["title", "og:title", "text"],
              ["description", "og:description", "textarea"],
              ["url", "og:url", "text"],
              ["siteName", "og:site_name", "text"],
              ["imageUrl", "og:image (absolute URL)", "text"],
              ["imageAlt", "og:image:alt", "text"],
              ["locale", "og:locale", "text"],
              ["twitterSite", "twitter:site (without @)", "text"],
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

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
              og:type
              <select
                value={form.type}
                onChange={(e) => patch("type", e.target.value)}
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-2 text-[var(--foreground)]"
              >
                <option value="website">website</option>
                <option value="article">article</option>
                <option value="product">product</option>
                <option value="profile">profile</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
              twitter:card
              <select
                value={form.twitterCard}
                onChange={(e) =>
                  patch(
                    "twitterCard",
                    e.target.value as OpenGraphInput["twitterCard"],
                  )
                }
                className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-2 text-[var(--foreground)]"
              >
                <option value="summary_large_image">summary_large_image</option>
                <option value="summary">summary</option>
              </select>
            </label>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
              Approximate social card
            </p>
            <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
              <div className="relative aspect-[1.91/1] bg-[var(--border)]">
                {form.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={form.imageUrl}
                    alt={form.imageAlt || ""}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                ) : null}
              </div>
              <div className="space-y-1 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.08em] text-[var(--muted)]">
                  {form.siteName || "site"}
                </p>
                <p className="font-medium text-[var(--foreground)]">
                  {form.title || "Title"}
                </p>
                <p className="line-clamp-2 text-sm text-[var(--muted)]">
                  {form.description || "Description"}
                </p>
              </div>
            </div>
          </div>

          {output.warnings.length > 0 ? (
            <ul className="space-y-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">
              {output.warnings.map((w) => (
                <li key={w}>• {w}</li>
              ))}
            </ul>
          ) : null}

          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <EditorPaneHeader label="HTML" getText={() => output.html} />
              <button
                type="button"
                onClick={copyHtml}
                className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]/50"
              >
                {copied ? "Copied" : "Copy HTML"}
              </button>
            </div>
            <pre className="max-h-[40vh] overflow-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 font-[family-name:var(--font-mono)] text-xs leading-relaxed text-[var(--foreground)]">
              {output.html}
            </pre>
          </div>
        </div>
      </div>

      <p className="text-xs text-[var(--muted)]">
        Preview is illustrative — Facebook, X, Slack, etc. fetch and cache their
        own scrapers. Use absolute HTTPS image URLs for best results.
      </p>
    </div>
  );
}
