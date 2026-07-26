"use client";

import { useCallback, useMemo, useState } from "react";
import { CopyButton } from "@/components/editor/CopyButton";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { explainCron } from "@/lib/time/cron";
import { track } from "@/lib/analytics";

const SAMPLE = "*/15 9-17 * * 1-5";

const FIELD_LABELS: Record<string, string> = {
  minute: "Minute",
  hour: "Hour",
  dayOfMonth: "Day of month",
  month: "Month",
  dayOfWeek: "Day of week",
};

export function CronExplainerTool() {
  const [input, setInput] = useState(SAMPLE);
  const [started, setStarted] = useState(false);

  const result = useMemo(() => explainCron(input), [input]);

  const onChange = useCallback(
    (v: string) => {
      if (!started) {
        setStarted(true);
        track({
          name: "tool_start",
          tool: "cron-expression-explainer",
          family: "convert",
        });
      }
      setInput(v);
    },
    [started],
  );

  return (
    <div className="space-y-4">
      <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
        Cron expression (minute hour day-of-month month day-of-week)
        <div className="flex flex-wrap gap-2">
          <input
            value={input}
            onChange={(e) => onChange(e.target.value)}
            className="min-w-[16rem] flex-1 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
            spellCheck={false}
            aria-label="Cron expression"
          />
          <CopyButton getText={() => input} label="Copy expression" />
        </div>
      </label>

      <p className="text-xs text-[var(--muted)]">
        Examples:{" "}
        {[
          "* * * * *",
          "0 * * * *",
          "30 9 * * *",
          "0 0 1 * *",
          "0 12 * * MON",
        ].map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => onChange(ex)}
            className="mr-2 font-[family-name:var(--font-mono)] text-[var(--foreground)] underline-offset-2 hover:underline"
          >
            {ex}
          </button>
        ))}
      </p>

      {!result.ok ? (
        <ToolErrorState message={result.error} />
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-[var(--success-border)] bg-[var(--success-bg)] px-4 py-3">
            <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
              Summary
            </p>
            <p className="mt-1 text-lg text-[var(--success)]">{result.summary}</p>
          </div>

          <div className="overflow-hidden rounded-xl border border-[var(--border)]">
            <table className="w-full text-sm">
              <thead className="bg-[var(--surface)] text-left text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-2">Field</th>
                  <th className="px-4 py-2">Value</th>
                  <th className="px-4 py-2">Meaning</th>
                </tr>
              </thead>
              <tbody>
                {result.fields.map((f) => (
                  <tr
                    key={f.name}
                    className="border-t border-[var(--border)]"
                  >
                    <td className="px-4 py-2 text-[var(--foreground)]">
                      {FIELD_LABELS[f.name]}
                    </td>
                    <td className="px-4 py-2 font-[family-name:var(--font-mono)] text-[var(--foreground)]">
                      {f.raw}
                    </td>
                    <td className="px-4 py-2 text-[var(--muted)]">
                      {f.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
              Next runs (UTC)
            </p>
            <ul className="divide-y divide-[var(--border)] overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">
              {result.next.map((iso) => (
                <li
                  key={iso}
                  className="flex items-center justify-between gap-3 px-4 py-2.5"
                >
                  <code className="font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]">
                    {iso}
                  </code>
                  <CopyButton
                    getText={() => iso}
                    label="Copy"
                    className="!py-1 !text-xs"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
