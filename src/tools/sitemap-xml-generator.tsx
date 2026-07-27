"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  buildSitemapXml,
  parseSitemapUrlLines,
  type SitemapChangeFreq,
} from "@/lib/generate/sitemap";
import { todayInputValue } from "@/lib/time/age";
import { track } from "@/lib/analytics";

const SAMPLE = `https://example.com/
https://example.com/about
https://example.com/tools
https://example.com/blog`;

const FREQS: (SitemapChangeFreq | "")[] = [
  "",
  "always",
  "hourly",
  "daily",
  "weekly",
  "monthly",
  "yearly",
  "never",
];

export function SitemapXmlGeneratorTool() {
  const [raw, setRaw] = useState(SAMPLE);
  const [lastmod, setLastmod] = useState(() => todayInputValue());
  const [includeLastmod, setIncludeLastmod] = useState(true);
  const [changefreq, setChangefreq] = useState<SitemapChangeFreq | "">(
    "weekly",
  );
  const [priority, setPriority] = useState("0.8");
  const [includePriority, setIncludePriority] = useState(true);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "sitemap-xml-generator",
        family: "tools",
      });
    }
  }, [started]);

  const result = useMemo(
    () =>
      buildSitemapXml({
        urls: parseSitemapUrlLines(raw),
        lastmod: includeLastmod ? lastmod : undefined,
        changefreq: changefreq || undefined,
        priority: includePriority ? priority : undefined,
      }),
    [raw, includeLastmod, lastmod, changefreq, includePriority, priority],
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-[var(--muted)]">
        Paste absolute http(s) URLs (one per line). Lines starting with # are
        ignored. Max 500 URLs.
      </p>

      <div className="flex flex-wrap items-end gap-4">
        <label className="flex items-center gap-2 pb-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={includeLastmod}
            onChange={(e) => {
              markStart();
              setIncludeLastmod(e.target.checked);
            }}
            className="accent-[var(--accent)]"
          />
          lastmod
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Date
          <input
            type="date"
            value={lastmod}
            disabled={!includeLastmod}
            onChange={(e) => {
              markStart();
              setLastmod(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)] disabled:opacity-50"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          changefreq
          <select
            value={changefreq}
            onChange={(e) => {
              markStart();
              setChangefreq(e.target.value as SitemapChangeFreq | "");
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-2 text-[var(--foreground)]"
          >
            {FREQS.map((f) => (
              <option key={f || "none"} value={f}>
                {f || "(omit)"}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 pb-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={includePriority}
            onChange={(e) => {
              markStart();
              setIncludePriority(e.target.checked);
            }}
            className="accent-[var(--accent)]"
          />
          priority
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          0.0–1.0
          <input
            type="text"
            value={priority}
            disabled={!includePriority}
            onChange={(e) => {
              markStart();
              setPriority(e.target.value);
            }}
            className="w-24 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)] disabled:opacity-50"
          />
        </label>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="URLs" getText={() => raw} />
          <CodeEditor
            language="text"
            value={raw}
            onChange={(v) => {
              markStart();
              setRaw(v);
            }}
            minHeight="50vh"
          />
        </div>
        <div>
          <EditorPaneHeader
            label={
              result.ok ? `sitemap.xml (${result.count})` : "sitemap.xml"
            }
            getText={() => (result.ok ? result.xml : "")}
          />
          {!result.ok ? (
            <ToolErrorState message={result.error} />
          ) : (
            <CodeEditor
              language="text"
              value={result.xml}
              editable={false}
              minHeight="50vh"
            />
          )}
        </div>
      </div>
    </div>
  );
}
