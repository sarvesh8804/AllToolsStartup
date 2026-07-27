"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { CopyButton } from "@/components/editor/CopyButton";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  DEFAULT_MERMAID_SOURCE,
  MERMAID_TEMPLATES,
  MERMAID_THEMES,
  buildMermaidEmbedHtml,
  mermaidSourceStats,
  normalizeMermaidSource,
  type MermaidTheme,
} from "@/lib/diagram/mermaid";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

function downloadText(filename: string, contents: string, mime: string) {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function MermaidLiveEditorTool() {
  const reactId = useId().replace(/:/g, "");
  const renderSeq = useRef(0);
  const [source, setSource] = useState(DEFAULT_MERMAID_SOURCE);
  const [theme, setTheme] = useState<MermaidTheme>("default");
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "mermaid-live-editor",
        family: "tools",
      });
    }
  }, [started]);

  const stats = useMemo(() => mermaidSourceStats(source), [source]);
  const embed = useMemo(
    () =>
      buildMermaidEmbedHtml({
        source,
        theme,
        title: "Mermaid diagram",
      }),
    [source, theme],
  );

  useEffect(() => {
    let cancelled = false;
    const seq = ++renderSeq.current;
    const handle = window.setTimeout(() => {
      void (async () => {
        const code = normalizeMermaidSource(source);
        if (!code) {
          if (!cancelled && seq === renderSeq.current) {
            setSvg("");
            setError(null);
            setBusy(false);
          }
          return;
        }
        setBusy(true);
        try {
          const mermaid = (await import("mermaid")).default;
          mermaid.initialize({
            startOnLoad: false,
            securityLevel: "strict",
            theme,
          });
          const id = `forge-mermaid-${reactId}-${seq}`;
          const { svg: next } = await mermaid.render(id, code);
          if (!cancelled && seq === renderSeq.current) {
            setSvg(next);
            setError(null);
            if (!completed) {
              setCompleted(true);
              track({
                name: "tool_complete",
                tool: "mermaid-live-editor",
                family: "tools",
              });
            }
          }
        } catch (e) {
          if (!cancelled && seq === renderSeq.current) {
            setSvg("");
            setError(e instanceof Error ? e.message : "Could not render diagram.");
          }
        } finally {
          if (!cancelled && seq === renderSeq.current) setBusy(false);
        }
      })();
    }, 280);

    return () => {
      cancelled = true;
      window.clearTimeout(handle);
    };
  }, [source, theme, reactId, completed]);

  const onChange = useCallback(
    (v: string) => {
      markStart();
      setSource(v);
    },
    [markStart],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
          Template
        </span>
        {MERMAID_TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => {
              markStart();
              setSource(t.source);
            }}
            className="rounded-md border border-[var(--border)] px-2.5 py-1 text-sm text-[var(--muted)] hover:border-[var(--accent)]/50 hover:text-[var(--foreground)]"
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
          Theme
        </span>
        {MERMAID_THEMES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              markStart();
              setTheme(t);
            }}
            className={cn(
              "rounded-md border px-2.5 py-1 text-sm capitalize",
              theme === t
                ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--foreground)]"
                : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/50",
            )}
          >
            {t}
          </button>
        ))}
        <span className="ml-auto text-sm text-[var(--muted)]">
          {stats.kind ?? "unknown"} · {stats.lines} lines
          {busy ? " · rendering…" : ""}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <EditorPaneHeader label="Mermaid source" getText={() => source} />
          <CodeEditor
            language="text"
            value={source}
            onChange={onChange}
            minHeight="42vh"
          />
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-[var(--foreground)]">
              Live preview
            </span>
            <CopyButton getText={() => svg} label="Copy SVG" />
            <button
              type="button"
              disabled={!svg}
              onClick={() => {
                markStart();
                downloadText("diagram.svg", svg, "image/svg+xml");
              }}
              className="rounded-md border border-[var(--border)] px-2.5 py-1 text-sm text-[var(--muted)] hover:border-[var(--accent)]/50 disabled:opacity-40"
            >
              Download SVG
            </button>
            <button
              type="button"
              onClick={() => {
                markStart();
                setShowEmbed((v) => !v);
              }}
              className="rounded-md border border-[var(--border)] px-2.5 py-1 text-sm text-[var(--muted)] hover:border-[var(--accent)]/50"
            >
              {showEmbed ? "Hide embed" : "Embed HTML"}
            </button>
          </div>

          {error ? <ToolErrorState message={error} /> : null}

          <div className="min-h-[42vh] overflow-auto rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            {svg ? (
              <div
                // Mermaid SVG is generated locally with securityLevel: strict
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            ) : !error ? (
              <p className="text-sm text-[var(--muted)]">
                Diagram preview appears here.
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {showEmbed ? (
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <EditorPaneHeader label="Embed HTML" getText={() => embed} />
            <button
              type="button"
              onClick={() => {
                markStart();
                downloadText("mermaid-embed.html", embed, "text/html");
              }}
              className="rounded-md border border-[var(--border)] px-2.5 py-1 text-sm text-[var(--muted)] hover:border-[var(--accent)]/50"
            >
              Download HTML
            </button>
          </div>
          <p className="mb-2 text-sm text-[var(--muted)]">
            Self-contained page that loads Mermaid from jsDelivr when opened. Live
            preview above uses the bundled library and never uploads your diagram.
          </p>
          <CodeEditor
            language="text"
            value={embed}
            editable={false}
            minHeight="24vh"
          />
        </div>
      ) : null}
    </div>
  );
}
