"use client";

import { useCallback, useRef, useState } from "react";
import { CopyButton } from "@/components/editor/CopyButton";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  CHECKSUM_ALGORITHMS,
  checksumFileBytes,
  checksumsMatch,
  formatByteSize,
  type ChecksumAlgorithm,
  type FileChecksumResult,
} from "@/lib/hash/file-checksum";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

export function FileChecksumTool() {
  const inputRef = useRef<HTMLInputElement>(null);
  const bytesRef = useRef<Uint8Array | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [algorithm, setAlgorithm] = useState<ChecksumAlgorithm>("sha256");
  const [result, setResult] = useState<FileChecksumResult | null>(null);
  const [expected, setExpected] = useState("");
  const [uppercase, setUppercase] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [started, setStarted] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "file-checksum", family: "tools" });
    }
  }, [started]);

  const applyHash = useCallback(
    (bytes: Uint8Array, algo: ChecksumAlgorithm, name: string) => {
      const next = checksumFileBytes(bytes, algo);
      setFileName(name);
      setResult(next);
      track({
        name: "tool_complete",
        tool: "file-checksum",
        family: "tools",
      });
    },
    [],
  );

  const hashFile = async (file: File, algo: ChecksumAlgorithm) => {
    markStart();
    setBusy(true);
    setError(null);
    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      bytesRef.current = bytes;
      applyHash(bytes, algo, file.name);
    } catch (e) {
      bytesRef.current = null;
      setResult(null);
      setFileName(null);
      setError(e instanceof Error ? e.message : "Failed to hash file.");
    } finally {
      setBusy(false);
    }
  };

  const acceptFile = (file: File) => {
    void hashFile(file, algorithm);
  };

  const changeAlgorithm = (algo: ChecksumAlgorithm) => {
    markStart();
    setAlgorithm(algo);
    if (bytesRef.current && fileName) {
      applyHash(bytesRef.current, algo, fileName);
    }
  };

  const display = result
    ? uppercase
      ? result.hex.toUpperCase()
      : result.hex
    : "";

  const match =
    result && expected.trim()
      ? checksumsMatch(result.hex, expected)
      : null;

  return (
    <div className="space-y-5">
      <div
        className={cn(
          "rounded-xl border border-dashed px-4 py-10 text-center transition",
          dragOver
            ? "border-[var(--accent)] bg-[var(--accent)]/10"
            : "border-[var(--border)] bg-[var(--surface)]",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) acceptFile(f);
        }}
      >
        <p className="text-sm text-[var(--muted)]">
          Drop any file here to compute a checksum locally. Nothing is uploaded.
        </p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-3 rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--ink)]"
        >
          {busy ? "Hashing…" : "Choose file"}
        </button>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) acceptFile(f);
            e.target.value = "";
          }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-[var(--muted)]">Algorithm</span>
        {CHECKSUM_ALGORITHMS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => changeAlgorithm(a.id)}
            className={
              algorithm === a.id
                ? "rounded-md bg-[var(--accent)] px-3 py-1.5 text-sm font-medium text-[var(--ink)]"
                : "rounded-md border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--muted)] hover:border-[var(--accent)]/50"
            }
          >
            {a.label}
          </button>
        ))}
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <input
            type="checkbox"
            checked={uppercase}
            onChange={(e) => setUppercase(e.target.checked)}
          />
          Uppercase
        </label>
      </div>

      {error ? <ToolErrorState message={error} /> : null}

      {fileName && result ? (
        <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <p className="text-sm text-[var(--muted)]">
            <span className="text-[var(--foreground)]">{fileName}</span>
            {" · "}
            {formatByteSize(result.byteLength)} ·{" "}
            {result.algorithm.toUpperCase()}
          </p>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <code className="min-w-0 flex-1 break-all font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]">
              {display}
            </code>
            <CopyButton getText={() => display} label="Copy" />
          </div>
        </div>
      ) : null}

      <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
        Compare to expected (optional)
        <input
          value={expected}
          onChange={(e) => setExpected(e.target.value)}
          placeholder="Paste a digest to verify"
          className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]"
          spellCheck={false}
        />
      </label>
      {match === true ? (
        <p className="text-sm text-[var(--accent-bright)]">Checksum matches.</p>
      ) : null}
      {match === false ? (
        <ToolErrorState message="Checksum does not match the expected value." />
      ) : null}
    </div>
  );
}
