"use client";

import { useCallback, useMemo, useState } from "react";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { parseCidr, SAMPLE_CIDR } from "@/lib/network/ip";
import { track } from "@/lib/analytics";

export function CidrCalculatorTool() {
  const [cidr, setCidr] = useState(SAMPLE_CIDR);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "cidr-calculator", family: "tools" });
    }
  }, [started]);

  const result = useMemo(() => parseCidr(cidr), [cidr]);

  return (
    <div className="space-y-4">
      <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
        CIDR block
        <input
          value={cidr}
          onChange={(e) => {
            markStart();
            setCidr(e.target.value);
          }}
          placeholder="192.168.1.0/24"
          className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)]"
          spellCheck={false}
        />
      </label>

      {!result.ok ? <ToolErrorState message={result.error} /> : (
        <dl className="grid gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:grid-cols-2">
          {(
            [
              ["Network", result.info.network],
              ["Broadcast", result.info.broadcast],
              ["First host", result.info.firstHost],
              ["Last host", result.info.lastHost],
              ["Subnet mask", result.info.mask],
              ["Prefix", `/${result.info.prefix}`],
              ["Total addresses", String(result.info.hostCount)],
              ["Usable hosts", String(result.info.usableHosts)],
            ] as const
          ).map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs text-[var(--muted)]">{label}</dt>
              <dd className="font-[family-name:var(--font-mono)] text-sm">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
