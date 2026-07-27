"use client";

import { useCallback, useMemo, useState } from "react";
import { ToolErrorState } from "@/components/tool/ToolShell";
import {
  calculateGpa,
  LETTER_GRADES,
  letterToPoints,
  type GpaCourse,
  type LetterGrade,
} from "@/lib/calc/gpa";
import { track } from "@/lib/analytics";

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

type DraftRow = {
  id: string;
  name: string;
  credits: string;
  letter: LetterGrade;
};

function toCourse(row: DraftRow): GpaCourse {
  return {
    id: row.id,
    name: row.name.trim() || "Course",
    credits: Number(row.credits),
    points: letterToPoints(row.letter),
  };
}

export function GpaCalculatorTool() {
  const [rows, setRows] = useState<DraftRow[]>([
    { id: newId(), name: "Course 1", credits: "3", letter: "A" },
    { id: newId(), name: "Course 2", credits: "3", letter: "B+" },
    { id: newId(), name: "Course 3", credits: "4", letter: "B" },
  ]);
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "gpa-calculator",
        family: "calculators",
      });
    }
  }, [started]);

  const result = useMemo(
    () => calculateGpa(rows.map(toCourse)),
    [rows],
  );

  const updateRow = (id: string, patch: Partial<DraftRow>) => {
    markStart();
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
  };

  return (
    <div className="space-y-5">
      <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-[var(--surface)] text-left text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
            <tr>
              <th className="px-3 py-2">Course</th>
              <th className="px-3 py-2">Credits</th>
              <th className="px-3 py-2">Grade</th>
              <th className="px-3 py-2">Points</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="border-t border-[var(--border)] align-middle"
              >
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={row.name}
                    onChange={(e) => updateRow(row.id, { name: e.target.value })}
                    className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--foreground)]"
                    aria-label="Course name"
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={0.5}
                    step="0.5"
                    value={row.credits}
                    onChange={(e) =>
                      updateRow(row.id, { credits: e.target.value })
                    }
                    className="w-24 rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 font-[family-name:var(--font-mono)] text-[var(--foreground)]"
                    aria-label="Credits"
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    value={row.letter}
                    onChange={(e) =>
                      updateRow(row.id, {
                        letter: e.target.value as LetterGrade,
                      })
                    }
                    className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-[var(--foreground)]"
                    aria-label="Letter grade"
                  >
                    {LETTER_GRADES.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--muted)]">
                  {letterToPoints(row.letter).toFixed(1)}
                </td>
                <td className="px-3 py-2">
                  <button
                    type="button"
                    disabled={rows.length <= 1}
                    onClick={() => {
                      markStart();
                      setRows((prev) => prev.filter((r) => r.id !== row.id));
                    }}
                    className="text-xs text-[var(--muted)] hover:text-[var(--danger)] disabled:opacity-40"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={() => {
          markStart();
          setRows((prev) => [
            ...prev,
            {
              id: newId(),
              name: `Course ${prev.length + 1}`,
              credits: "3",
              letter: "B",
            },
          ]);
        }}
        className="rounded-md border border-[var(--border)] px-3 py-1.5 text-sm hover:border-[var(--accent)]/50"
      >
        Add course
      </button>

      {!result.ok ? (
        <ToolErrorState message={result.error} />
      ) : (
        <dl className="grid gap-3 sm:grid-cols-3">
          {(
            [
              ["GPA (4.0)", result.value.gpa.toFixed(2)],
              ["Total credits", String(result.value.totalCredits)],
              [
                "Quality points",
                result.value.qualityPoints.toFixed(2),
              ],
            ] as const
          ).map(([label, value]) => (
            <div
              key={label}
              className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
            >
              <dt className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                {label}
              </dt>
              <dd className="mt-1 font-[family-name:var(--font-mono)] text-2xl text-[var(--foreground)]">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <p className="text-xs text-[var(--muted)]">
        Uses a common US 4.0 letter scale (A=4.0 … F=0). Schools differ — check
        your registrar’s conversion table. Not academic advice.
      </p>
    </div>
  );
}
