"use client";

import { useCallback, useMemo, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { claimToDate, decodeJwt } from "@/lib/jwt/decode";
import { track } from "@/lib/analytics";

const SAMPLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkYSBMb3ZlbGFjZSIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxNzQ4NzYxMDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

const TIME_CLAIMS = new Set(["iat", "exp", "nbf", "auth_time"]);

export function JwtDecoderTool() {
  const [token, setToken] = useState(SAMPLE);
  const [started, setStarted] = useState(false);

  const result = useMemo(() => decodeJwt(token), [token]);

  const onChange = useCallback(
    (v: string) => {
      if (!started) {
        setStarted(true);
        track({ name: "tool_start", tool: "jwt-decoder", family: "tools" });
      }
      setToken(v);
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
          minHeight="30vh"
        />
      </div>

      {!result.ok ? (
        <ToolErrorState message={result.error} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <EditorPaneHeader
              label="Header"
              getText={() => JSON.stringify(result.value.header, null, 2)}
            />
            <CodeEditor
              language="json"
              value={JSON.stringify(result.value.header, null, 2)}
              editable={false}
              minHeight="35vh"
            />
          </div>
          <div>
            <EditorPaneHeader
              label="Payload"
              getText={() => JSON.stringify(result.value.payload, null, 2)}
            />
            <CodeEditor
              language="json"
              value={JSON.stringify(result.value.payload, null, 2)}
              editable={false}
              minHeight="35vh"
            />
          </div>
        </div>
      )}

      {result.ok ? (
        <div className="space-y-2">
          <ClaimTimes payload={result.value.payload} />
          <p className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--muted)]">
            Signature is <strong>not verified</strong>. This tool only decodes
            the token in your browser — never paste a production secret.
          </p>
        </div>
      ) : null}
    </div>
  );
}

function ClaimTimes({ payload }: { payload: Record<string, unknown> }) {
  const rows = Object.entries(payload)
    .filter(([k]) => TIME_CLAIMS.has(k))
    .map(([k, v]) => [k, claimToDate(v)] as const)
    .filter(([, iso]) => iso !== null);

  if (rows.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)]">
      <table className="w-full text-sm">
        <tbody>
          {rows.map(([claim, iso]) => (
            <tr key={claim} className="border-b border-[var(--border)] last:border-0">
              <td className="px-4 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]">
                {claim}
              </td>
              <td className="px-4 py-2 text-[var(--muted)]">{iso}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
