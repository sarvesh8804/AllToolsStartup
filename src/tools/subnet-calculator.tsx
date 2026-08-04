"use client";

import { useCallback, useMemo, useState } from "react";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { networkFromIpAndMask } from "@/lib/network/ip";
import { track } from "@/lib/analytics";

export function SubnetCalculatorTool() {
  const [ip, setIp] = useState("10.0.0.5");
  const [mask, setMask] = useState("255.255.255.0");
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({ name: "tool_start", tool: "subnet-calculator", family: "tools" });
    }
  }, [started]);

  const result = useMemo(() => networkFromIpAndMask(ip, mask), [ip, mask]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          IP address
          <input
            value={ip}
            onChange={(e) => {
              markStart();
              setIp(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Mask (dotted or prefix)
          <input
            value={mask}
            onChange={(e) => {
              markStart();
              setMask(e.target.value);
            }}
            placeholder="255.255.255.0 or /24"
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)]"
          />
        </label>
      </div>

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
