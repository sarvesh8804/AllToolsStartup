"use client";

import { useCallback, useMemo, useState } from "react";
import { CopyButton } from "@/components/editor/CopyButton";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  DEFAULT_URL_BUILDER,
  SAMPLE_URL,
  buildUrlFromParts,
  parseUrlInput,
  type UrlBuilderInput,
} from "@/lib/network/url";
import { track } from "@/lib/analytics";

export function UrlParserBuilderTool() {
  const [mode, setMode] = useState<"parse" | "build">("parse");
  const [parseInput, setParseInput] = useState(SAMPLE_URL);
  const [builder, setBuilder] = useState<UrlBuilderInput>(DEFAULT_URL_BUILDER);
  const [started, setStarted] = useState(false);

  const parsed = useMemo(() => parseUrlInput(parseInput), [parseInput]);
  const built = useMemo(() => buildUrlFromParts(builder), [builder]);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "url-parser-builder",
        family: "tools",
      });
    }
  }, [started]);

  const loadIntoBuilder = () => {
    if (!parsed.ok) return;
    markStart();
    setBuilder({
      protocol: parsed.value.protocol,
      hostname: parsed.value.hostname,
      port: parsed.value.port,
      pathname: parsed.value.pathname,
      search: parsed.value.search,
      hash: parsed.value.hash,
      username: parsed.value.username,
      password: parsed.value.password,
    });
    setMode("build");
    track({
      name: "tool_complete",
      tool: "url-parser-builder",
      family: "tools",
    });
  };

  const patch = <K extends keyof UrlBuilderInput>(
    key: K,
    value: UrlBuilderInput[K],
  ) => {
    markStart();
    setBuilder((prev) => ({ ...prev, [key]: value }));
    track({
      name: "tool_complete",
      tool: "url-parser-builder",
      family: "tools",
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            markStart();
            setMode("parse");
          }}
          className={`rounded-md border px-3 py-1.5 text-sm ${
            mode === "parse"
              ? "border-[var(--accent)] bg-[var(--accent)]/15"
              : "border-[var(--border)] text-[var(--muted)]"
          }`}
        >
          Parse URL
        </button>
        <button
          type="button"
          onClick={() => {
            markStart();
            setMode("build");
          }}
          className={`rounded-md border px-3 py-1.5 text-sm ${
            mode === "build"
              ? "border-[var(--accent)] bg-[var(--accent)]/15"
              : "border-[var(--border)] text-[var(--muted)]"
          }`}
        >
          Build URL
        </button>
      </div>

      {mode === "parse" ? (
        <div className="space-y-4">
          <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
            URL
            <input
              value={parseInput}
              onChange={(e) => {
                markStart();
                setParseInput(e.target.value);
              }}
              placeholder="https://api.example.com/v1?page=1"
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]"
              spellCheck={false}
            />
          </label>

          {!parsed.ok ? (
            <ToolErrorState message={parsed.error} />
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                <CopyButton
                  getText={() => parsed.value.href}
                  label="Copy URL"
                  className="!py-1 !text-xs"
                />
                <button
                  type="button"
                  onClick={loadIntoBuilder}
                  className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]/50"
                >
                  Edit in builder
                </button>
              </div>

              <dl className="divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
                {(
                  [
                    ["href", parsed.value.href],
                    ["origin", parsed.value.origin],
                    ["protocol", parsed.value.protocol],
                    ["hostname", parsed.value.hostname],
                    ["port", parsed.value.port || "—"],
                    ["username", parsed.value.username || "—"],
                    ["password", parsed.value.password ? "••••••" : "—"],
                    ["pathname", parsed.value.pathname],
                    ["search", parsed.value.search || "—"],
                    ["hash", parsed.value.hash || "—"],
                  ] as const
                ).map(([label, value]) => (
                  <div
                    key={label}
                    className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <dt className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                      {label}
                    </dt>
                    <dd className="font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>

              {parsed.value.queryParams.length > 0 ? (
                <div>
                  <h3 className="mb-2 text-sm font-medium text-[var(--foreground)]">
                    Query parameters
                  </h3>
                  <ul className="divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-[var(--border)]">
                    {parsed.value.queryParams.map((p) => (
                      <li
                        key={p.key}
                        className="flex justify-between gap-4 px-4 py-2 text-sm"
                      >
                        <code className="text-[var(--accent-bright)]">
                          {p.key}
                        </code>
                        <code className="text-[var(--foreground)]">
                          {p.value}
                        </code>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ["protocol", "Protocol", "https"],
                ["hostname", "Hostname", "api.example.com"],
                ["port", "Port", "443"],
                ["pathname", "Path", "/v1/users"],
                ["search", "Query", "?page=1"],
                ["hash", "Hash", "#section"],
                ["username", "Username", ""],
                ["password", "Password", ""],
              ] as const
            ).map(([key, label]) => (
              <label
                key={key}
                className="flex flex-col gap-1 text-sm text-[var(--muted)]"
              >
                {label}
                <input
                  type={key === "password" ? "password" : "text"}
                  value={builder[key]}
                  onChange={(e) => patch(key, e.target.value)}
                  className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]"
                  spellCheck={false}
                />
              </label>
            ))}
          </div>
          <div>
            <EditorPaneHeader
              label="Built URL"
              getText={() => (built.ok ? built.url : "")}
            />
            {!built.ok ? (
              <ToolErrorState message={built.error} />
            ) : (
              <CodeEditor
                value={built.url}
                editable={false}
                minHeight="12rem"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
