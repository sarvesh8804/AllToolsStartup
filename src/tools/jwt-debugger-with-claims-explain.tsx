"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  explainJwt,
  type ClaimSeverity,
  type ExplainedClaim,
} from "@/lib/jwt/explain";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

const SAMPLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkYSBMb3ZlbGFjZSIsImlzcyI6ImZvcmdlLmRldiIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxNzQ4NzYxMDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

const SEVERITY_STYLE: Record<ClaimSeverity, string> = {
  info: "text-[var(--muted)]",
  ok: "text-[var(--success)]",
  warn: "text-[var(--accent-bright)]",
  danger: "text-[var(--danger)]",
};

export function JwtDebuggerWithClaimsExplainTool() {
  const [token, setToken] = useState(SAMPLE);
  const [started, setStarted] = useState(false);

  const result = useMemo(() => explainJwt(token), [token]);

  const onChange = useCallback(
    (v: string) => {
      if (!started) {
        setStarted(true);
        track({
          name: "tool_start",
          tool: "jwt-debugger-with-claims-explain",
          family: "tools",
        });
      }
      setToken(v);
      if (v.trim()) {
        track({
          name: "tool_complete",
          tool: "jwt-debugger-with-claims-explain",
          family: "tools",
        });
      }
    },
    [started],
  );

  return (
    <div className="space-y-4">
      <div>
        <EditorPaneHeader label="Encoded JWT" getText={() => token} />
        <CodeEditor
          language="text"
          value={token}
          onChange={onChange}
          minHeight="28vh"
        />
      </div>

      {!result.ok ? (
        <ToolErrorState message={result.error} />
      ) : (
        <>
          <ul className="space-y-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">
            {result.summary.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>

          <div className="grid gap-4 lg:grid-cols-2">
            <ClaimTable title="Header" claims={result.headerClaims} />
            <ClaimTable title="Payload" claims={result.payloadClaims} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <EditorPaneHeader
                label="Header JSON"
                getText={() =>
                  JSON.stringify(result.parts.header, null, 2)
                }
              />
              <CodeEditor
                language="json"
                value={JSON.stringify(result.parts.header, null, 2)}
                editable={false}
                minHeight="28vh"
              />
            </div>
            <div>
              <EditorPaneHeader
                label="Payload JSON"
                getText={() =>
                  JSON.stringify(result.parts.payload, null, 2)
                }
              />
              <CodeEditor
                language="json"
                value={JSON.stringify(result.parts.payload, null, 2)}
                editable={false}
                minHeight="28vh"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ClaimTable({
  title,
  claims,
}: {
  title: string;
  claims: ExplainedClaim[];
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)]">
      <div className="border-b border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)]">
        {title} claims
      </div>
      <div className="divide-y divide-[var(--border)]">
        {claims.map((c) => (
          <div key={c.name} className="px-4 py-3">
            <div className="flex flex-wrap items-baseline gap-2">
              <code className="font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]">
                {c.name}
              </code>
              <span
                className={cn(
                  "text-xs uppercase tracking-wide",
                  SEVERITY_STYLE[c.severity],
                )}
              >
                {c.severity}
              </span>
            </div>
            <p className="mt-1 break-all font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]">
              {c.displayValue}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">{c.explanation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
