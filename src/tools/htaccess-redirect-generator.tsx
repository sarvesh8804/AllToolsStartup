"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  buildHtaccessRedirects,
  type HtaccessRedirectRule,
  type RedirectCode,
} from "@/lib/generate/htaccess";
import { track } from "@/lib/analytics";

function newRule(): HtaccessRedirectRule {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    from: "/old-path",
    to: "/new-path",
    code: 301,
  };
}

export function HtaccessRedirectGeneratorTool() {
  const [rules, setRules] = useState<HtaccessRedirectRule[]>([
    {
      id: "1",
      from: "/old",
      to: "https://example.com/new",
      code: 301,
    },
  ]);
  const [forceHttps, setForceHttps] = useState(true);
  const [wwwMode, setWwwMode] = useState<"off" | "www" | "apex">("off");
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "htaccess-redirect-generator",
        family: "tools",
      });
    }
  }, [started]);

  const result = useMemo(
    () =>
      buildHtaccessRedirects({
        rules,
        forceHttps,
        forceWww: wwwMode === "off" ? false : wwwMode,
      }),
    [rules, forceHttps, wwwMode],
  );

  const updateRule = (
    id: string,
    patch: Partial<HtaccessRedirectRule>,
  ) => {
    markStart();
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    );
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-[var(--muted)]">
        Builds Apache <code className="font-[family-name:var(--font-mono)]">.htaccess</code>{" "}
        redirect snippets. Test on staging — host configs differ.
      </p>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={forceHttps}
            onChange={(e) => {
              markStart();
              setForceHttps(e.target.checked);
            }}
            className="accent-[var(--accent)]"
          />
          Force HTTPS
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          www
          <select
            value={wwwMode}
            onChange={(e) => {
              markStart();
              setWwwMode(e.target.value as "off" | "www" | "apex");
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-2 text-[var(--foreground)]"
          >
            <option value="off">No change</option>
            <option value="www">Force www</option>
            <option value="apex">Force apex (non-www)</option>
          </select>
        </label>
        <button
          type="button"
          onClick={() => {
            markStart();
            setRules((prev) => [...prev, newRule()]);
          }}
          className="rounded-md border border-[var(--border)] px-3 py-2 text-sm hover:border-[var(--accent)]/50"
        >
          Add rule
        </button>
      </div>

      <div className="space-y-3">
        {rules.map((rule, index) => (
          <div
            key={rule.id}
            className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 sm:grid-cols-[1fr_1fr_6rem_auto]"
          >
            <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
              From
              <input
                value={rule.from}
                onChange={(e) => updateRule(rule.id, { from: e.target.value })}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
              To
              <input
                value={rule.to}
                onChange={(e) => updateRule(rule.id, { to: e.target.value })}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-[var(--muted)]">
              Code
              <select
                value={rule.code}
                onChange={(e) =>
                  updateRule(rule.id, {
                    code: Number(e.target.value) as RedirectCode,
                  })
                }
                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-1.5 text-sm text-[var(--foreground)]"
              >
                {[301, 302, 303, 307, 308].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => {
                markStart();
                setRules((prev) => prev.filter((r) => r.id !== rule.id));
              }}
              className="self-end pb-1 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              Remove {index + 1}
            </button>
          </div>
        ))}
      </div>

      {!result.ok ? (
        <ToolErrorState message={result.error} />
      ) : (
        <div>
          <EditorPaneHeader label=".htaccess" getText={() => result.text} />
          <CodeEditor
            language="text"
            value={result.text}
            editable={false}
            minHeight="40vh"
          />
        </div>
      )}
    </div>
  );
}
