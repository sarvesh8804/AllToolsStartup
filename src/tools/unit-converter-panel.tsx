"use client";

import { useCallback, useMemo, useState } from "react";
import { CopyButton } from "@/components/editor/CopyButton";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  convertLinearTable,
  convertTemperatureTable,
  type LinearUnit,
  type TempUnit,
  type TempUnitId,
} from "@/lib/convert/units";
import { track } from "@/lib/analytics";

type LinearProps = {
  kind: "linear";
  toolSlug: string;
  units: LinearUnit[];
  defaultFrom: string;
  sample: string;
  rejectNegative?: boolean;
};

type TempProps = {
  kind: "temperature";
  toolSlug: string;
  units: TempUnit[];
  defaultFrom: TempUnitId;
  sample: string;
};

export type UnitConverterPanelProps = LinearProps | TempProps;

export function UnitConverterPanel(props: UnitConverterPanelProps) {
  const [fromId, setFromId] = useState(props.defaultFrom);
  const [value, setValue] = useState(props.sample);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: props.toolSlug,
        family: "convert",
      });
    }
  }, [started, props.toolSlug]);

  const table = useMemo(() => {
    if (props.kind === "linear") {
      return convertLinearTable(value, fromId, props.units, {
        rejectNegative: props.rejectNegative,
      });
    }
    return convertTemperatureTable(value, fromId as TempUnitId);
  }, [props, value, fromId]);

  const units = props.units;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Value
          <input
            value={value}
            onChange={(e) => {
              markStart();
              setValue(e.target.value);
            }}
            inputMode="decimal"
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          From unit
          <select
            value={fromId}
            onChange={(e) => {
              markStart();
              setFromId(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
          >
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!table.ok ? <ToolErrorState message={table.error} /> : null}

      {table.ok ? (
        <div className="overflow-auto rounded-xl border border-[var(--border)]">
          <table className="w-full min-w-[320px] text-sm">
            <thead className="bg-[var(--surface)] text-left text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
              <tr>
                <th className="px-3 py-2">Unit</th>
                <th className="px-3 py-2">Value</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row) => (
                <tr
                  key={row.id}
                  className={
                    row.id === fromId
                      ? "border-t border-[var(--border)] bg-[var(--accent)]/15"
                      : "border-t border-[var(--border)]"
                  }
                >
                  <td className="px-3 py-2 text-[var(--foreground)]">
                    {row.label}
                  </td>
                  <td className="px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]">
                    {row.formatted}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <CopyButton getText={() => row.formatted} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
