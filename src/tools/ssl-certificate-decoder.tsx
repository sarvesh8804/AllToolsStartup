"use client";

import { useCallback, useEffect, useState } from "react";
import { CodeEditor } from "@/components/editor/CodeEditor";
import { EditorPaneHeader } from "@/components/editor/EditorPaneHeader";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  decodeSslCertificates,
  type CertificateInfo,
  type SslDecodeResult,
} from "@/lib/security/ssl-cert";
import { track } from "@/lib/analytics";

export function SslCertificateDecoderTool() {
  const [pem, setPem] = useState("");
  const [result, setResult] = useState<SslDecodeResult | null>(null);
  const [started, setStarted] = useState(false);

  const trimmedPem = pem.trim();

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "ssl-certificate-decoder", family: "tools" });
    }
  }, [started]);

  useEffect(() => {
    if (!trimmedPem) return;
    let cancelled = false;
    void decodeSslCertificates(trimmedPem).then((next) => {
      if (!cancelled) setResult(next);
    });
    return () => {
      cancelled = true;
    };
  }, [trimmedPem]);

  const blocks: CertificateInfo[] =
    trimmedPem && result?.ok ? result.blocks : [];
  const error = trimmedPem && result && !result.ok ? result.error : null;

  return (
    <div className="space-y-4">
      <div>
        <EditorPaneHeader label="PEM certificate" getText={() => pem} />
        <CodeEditor
          language="text"
          value={pem}
          onChange={(v) => {
            markStart();
            setPem(v);
          }}
          minHeight="40vh"
        />
      </div>

      {error ? <ToolErrorState message={error} /> : null}

      {blocks.length > 0 ? (
        <div className="space-y-4">
          {blocks.map((block, index) => (
            <dl
              key={index}
              className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:grid-cols-2"
            >
              <div>
                <dt className="text-xs text-[var(--muted)]">Type</dt>
                <dd className="text-sm">{block.type}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--muted)]">Bytes</dt>
                <dd className="text-sm">{block.bytes}</dd>
              </div>
              {block.serial ? (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-[var(--muted)]">Serial</dt>
                  <dd className="font-[family-name:var(--font-mono)] text-sm">{block.serial}</dd>
                </div>
              ) : null}
              <div>
                <dt className="text-xs text-[var(--muted)]">Subject</dt>
                <dd className="text-sm">{block.subject.join(", ") || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--muted)]">Issuer</dt>
                <dd className="text-sm">{block.issuer.join(", ") || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--muted)]">Not before</dt>
                <dd className="text-sm">{block.notBefore ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--muted)]">Not after</dt>
                <dd className="text-sm">{block.notAfter ?? "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-[var(--muted)]">SHA-256 fingerprint</dt>
                <dd className="font-[family-name:var(--font-mono)] text-sm break-all">
                  {block.fingerprintSha256}
                </dd>
              </div>
            </dl>
          ))}
        </div>
      ) : null}

      <p className="text-xs text-[var(--muted)]">
        Paste PEM text only — certificates are decoded locally; nothing is sent to a server.
      </p>
    </div>
  );
}
