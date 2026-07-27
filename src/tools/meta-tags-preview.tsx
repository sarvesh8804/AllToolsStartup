"use client";

import { useCallback, useMemo, useState } from "react";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import {
  DESCRIPTION_SOFT_MAX,
  TITLE_SOFT_MAX,
  buildMetaTagsPreview,
} from "@/lib/seo/meta-tags";
import { track } from "@/lib/analytics";

export function MetaTagsPreviewTool() {
  const [title, setTitle] = useState("JSON Formatter & Validator Online | Forge");
  const [description, setDescription] = useState(
    "Format, validate and beautify JSON instantly. Free online JSON formatter that runs entirely in your browser.",
  );
  const [url, setUrl] = useState("https://forge.tools/tools/json-formatter");
  const [copied, setCopied] = useState(false);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "meta-tags-preview",
        family: "tools",
      });
    }
  }, [started]);

  const preview = useMemo(
    () => buildMetaTagsPreview({ title, description, url }),
    [title, description, url],
  );

  const copyHtml = async () => {
    markStart();
    try {
      await navigator.clipboard.writeText(preview.htmlSnippet);
      setCopied(true);
      track({
        name: "tool_complete",
        tool: "meta-tags-preview",
        family: "tools",
      });
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
            Title ({preview.titleChars}/{TITLE_SOFT_MAX})
            <input
              type="text"
              value={title}
              onChange={(e) => {
                markStart();
                setTitle(e.target.value);
              }}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
            />
            <span
              className={`text-xs ${preview.titleOk ? "text-[var(--muted)]" : "text-[var(--danger)]"}`}
            >
              {preview.titleOk
                ? "Within typical desktop SERP length"
                : "May truncate in search results"}
            </span>
          </label>

          <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
            Meta description ({preview.descriptionChars}/{DESCRIPTION_SOFT_MAX})
            <textarea
              value={description}
              rows={4}
              onChange={(e) => {
                markStart();
                setDescription(e.target.value);
              }}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
            />
            <span
              className={`text-xs ${preview.descriptionOk ? "text-[var(--muted)]" : "text-[var(--danger)]"}`}
            >
              {preview.descriptionOk
                ? "Within typical desktop SERP length"
                : "May truncate in search results"}
            </span>
          </label>

          <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
            Canonical / page URL
            <input
              type="text"
              value={url}
              onChange={(e) => {
                markStart();
                setUrl(e.target.value);
              }}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]"
            />
          </label>
        </div>

        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
            Google-style SERP preview
          </p>
          <div className="rounded-xl border border-[var(--border)] bg-white px-5 py-4 shadow-sm">
            <p className="truncate text-sm text-[#202124]">
              {preview.displayUrl}
            </p>
            <p className="mt-1 text-xl leading-snug text-[#1a0dab]">
              {preview.title}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[#4d5156]">
              {preview.description}
            </p>
          </div>
          {(preview.titleTruncated || preview.descriptionTruncated) && (
            <p className="mt-2 text-xs text-[var(--muted)]">
              Ellipsis shows approximate truncation for ~{TITLE_SOFT_MAX}-char
              titles / ~{DESCRIPTION_SOFT_MAX}-char descriptions.
            </p>
          )}
        </div>
      </div>

      {preview.warnings.length > 0 ? (
        <ul className="space-y-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">
          {preview.warnings.map((w) => (
            <li key={w}>• {w}</li>
          ))}
        </ul>
      ) : null}

      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <EditorPaneHeader label="HTML tags" getText={() => preview.htmlSnippet} />
          <button
            type="button"
            onClick={copyHtml}
            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]/50"
          >
            {copied ? "Copied" : "Copy HTML"}
          </button>
        </div>
        <pre className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 font-[family-name:var(--font-mono)] text-xs leading-relaxed text-[var(--foreground)]">
          {preview.htmlSnippet}
        </pre>
      </div>

      <p className="text-xs text-[var(--muted)]">
        Pixel-based truncation varies by device and query. Limits here are
        planning heuristics, not a Google guarantee.
      </p>
    </div>
  );
}
