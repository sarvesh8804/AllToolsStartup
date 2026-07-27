"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  DEFAULT_ROBOTS_BLOCKS,
  buildRobotsTxt,
  parseRobotsPathLines,
  type RobotsUserAgentBlock,
} from "@/lib/generate/robots";
import { track } from "@/lib/analytics";

export function RobotsTxtGeneratorTool() {
  const [userAgent, setUserAgent] = useState("*");
  const [allowRaw, setAllowRaw] = useState("/");
  const [disallowRaw, setDisallowRaw] = useState("/admin/\n/api/");
  const [sitemap, setSitemap] = useState("https://example.com/sitemap.xml");
  const [crawlDelay, setCrawlDelay] = useState("");
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "robots-txt-generator",
        family: "tools",
      });
    }
  }, [started]);

  const blocks: RobotsUserAgentBlock[] = useMemo(
    () => [
      {
        id: DEFAULT_ROBOTS_BLOCKS[0]!.id,
        userAgent,
        allow: parseRobotsPathLines(allowRaw),
        disallow: parseRobotsPathLines(disallowRaw),
      },
    ],
    [userAgent, allowRaw, disallowRaw],
  );

  const result = useMemo(
    () =>
      buildRobotsTxt({
        blocks,
        sitemaps: sitemap.trim() ? [sitemap.trim()] : [],
        crawlDelay: crawlDelay.trim() ? Number(crawlDelay) : null,
      }),
    [blocks, sitemap, crawlDelay],
  );

  return (
    <div className="space-y-5">
      <p className="text-sm text-[var(--muted)]">
        Build a simple{" "}
        <code className="font-[family-name:var(--font-mono)]">robots.txt</code>.
        Pair with the{" "}
        <Link
          href="/tools/sitemap-xml-generator"
          className="text-[var(--accent-bright)] underline-offset-2 hover:underline"
        >
          Sitemap XML Generator
        </Link>
        .
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          User-agent
          <input
            value={userAgent}
            onChange={(e) => {
              markStart();
              setUserAgent(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Sitemap URL (optional)
          <input
            value={sitemap}
            onChange={(e) => {
              markStart();
              setSitemap(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Disallow (one path per line)
          <textarea
            rows={4}
            value={disallowRaw}
            onChange={(e) => {
              markStart();
              setDisallowRaw(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Allow (one path per line)
          <textarea
            rows={4}
            value={allowRaw}
            onChange={(e) => {
              markStart();
              setAllowRaw(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Crawl-delay (optional, seconds)
          <input
            type="number"
            min={0}
            value={crawlDelay}
            onChange={(e) => {
              markStart();
              setCrawlDelay(e.target.value);
            }}
            placeholder="omit"
            className="w-40 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
          />
        </label>
      </div>

      {!result.ok ? (
        <ToolErrorState message={result.error} />
      ) : (
        <div>
          <EditorPaneHeader label="robots.txt" getText={() => result.text} />
          <CodeEditor
            language="text"
            value={result.text}
            editable={false}
            minHeight="35vh"
          />
        </div>
      )}
    </div>
  );
}
