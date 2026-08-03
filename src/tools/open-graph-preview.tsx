"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { DEFAULT_OG_INPUT, type OpenGraphInput } from "@/lib/seo/open-graph";
import { buildOgPreviewCards, parseOpenGraphHtml } from "@/lib/seo/og-preview";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

const PLATFORM_LABELS = {
  facebook: "Facebook",
  twitter: "X / Twitter",
  linkedin: "LinkedIn",
  discord: "Discord",
} as const;

export function OpenGraphPreviewTool() {
  const [form, setForm] = useState<OpenGraphInput>(DEFAULT_OG_INPUT);
  const [htmlInput, setHtmlInput] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  const cards = useMemo(() => buildOgPreviewCards(form), [form]);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "open-graph-preview", family: "tools" });
    }
  }, [started]);

  const patch = <K extends keyof OpenGraphInput>(key: K, value: OpenGraphInput[K]) => {
    markStart();
    setForm((prev) => ({ ...prev, [key]: value }));
    track({ name: "tool_complete", tool: "open-graph-preview", family: "tools" });
  };

  const parseHtml = () => {
    markStart();
    const result = parseOpenGraphHtml(htmlInput);
    if (!result.ok) {
      setParseError(result.error);
      return;
    }
    setParseError(null);
    setForm(result.input);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          {(
            [
              ["title", "Title", "text"],
              ["description", "Description", "textarea"],
              ["url", "URL", "text"],
              ["siteName", "Site name", "text"],
              ["imageUrl", "Image URL", "text"],
            ] as const
          ).map(([key, label, kind]) => (
            <label key={key} className="flex flex-col gap-1 text-sm text-[var(--muted)]">
              {label}
              {kind === "textarea" ? (
                <textarea rows={3} value={form[key]} onChange={(e) => patch(key, e.target.value)}
                  className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]" />
              ) : (
                <input type="text" value={form[key]} onChange={(e) => patch(key, e.target.value)}
                  className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]" />
              )}
            </label>
          ))}
        </div>
        <div className="space-y-4">
          {cards.map((card) => (
            <div key={card.platform}>
              <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                {PLATFORM_LABELS[card.platform]}
              </p>
              <div className={cn("overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]",
                card.platform === "twitter" && form.twitterCard === "summary" && "max-w-sm")}>
                {card.imageUrl && card.platform !== "discord" ? (
                  <div className="relative aspect-[1.91/1] bg-[var(--border)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={card.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  </div>
                ) : null}
                <div className="space-y-1 px-4 py-3">
                  <p className="text-xs text-[var(--muted)]">{card.siteName}</p>
                  <p className="font-medium text-[var(--foreground)]">{card.title}</p>
                  <p className="line-clamp-2 text-sm text-[var(--muted)]">{card.truncatedDescription}</p>
                  {card.url ? <p className="truncate text-xs text-[var(--muted)]">{card.url}</p> : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <EditorPaneHeader label="Import from HTML meta tags" />
        <CodeEditor value={htmlInput} onChange={setHtmlInput} language="text" minHeight="120px" />
        {parseError ? <ToolErrorState message={parseError} /> : null}
        <button type="button" onClick={parseHtml}
          className="mt-2 rounded-md bg-[var(--accent)] px-4 py-1.5 text-sm font-medium text-[var(--ink)]">
          Parse meta tags
        </button>
      </div>
    </div>
  );
}
