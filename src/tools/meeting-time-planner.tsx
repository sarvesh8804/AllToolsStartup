"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { ToolErrorState } from "@/components/tool/ToolShell";
import { TIMEZONES, guessLocalTimeZone, nowInLocalInput } from "@/lib/time/timezone";
import {
  planMeeting,
  suggestMeetingSlots,
  type MeetingParticipant,
} from "@/lib/time/meeting-planner";
import { track } from "@/lib/analytics";

function newParticipant(timeZone: string): MeetingParticipant {
  const zone = TIMEZONES.find((z) => z.id === timeZone);
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    label: zone?.label ?? timeZone,
    timeZone,
  };
}

export function MeetingTimePlannerTool() {
  const [dateTimeLocal, setDateTimeLocal] = useState(() => nowInLocalInput());
  const [hostTimeZone, setHostTimeZone] = useState(() => guessLocalTimeZone());
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [workStartHour, setWorkStartHour] = useState(9);
  const [workEndHour, setWorkEndHour] = useState(17);
  const [participants, setParticipants] = useState<MeetingParticipant[]>(() => [
    newParticipant(guessLocalTimeZone()),
    newParticipant("Europe/London"),
    newParticipant("Asia/Tokyo"),
  ]);
  const [addZone, setAddZone] = useState("America/Los_Angeles");
  const [started, setStarted] = useState(false);

  const markStart = useCallback(() => {
    if (!started) {
      setStarted(true);
      track({
        name: "tool_start",
        tool: "meeting-time-planner",
        family: "tools",
      });
    }
  }, [started]);

  const result = useMemo(
    () =>
      planMeeting({
        dateTimeLocal,
        hostTimeZone,
        durationMinutes,
        participants,
        workStartHour,
        workEndHour,
      }),
    [
      dateTimeLocal,
      hostTimeZone,
      durationMinutes,
      participants,
      workStartHour,
      workEndHour,
    ],
  );

  const hostDate = dateTimeLocal.slice(0, 10);
  const suggestions = useMemo(
    () =>
      suggestMeetingSlots({
        date: hostDate,
        hostTimeZone,
        durationMinutes,
        participants,
        workStartHour,
        workEndHour,
        stepMinutes: 30,
      }),
    [
      hostDate,
      hostTimeZone,
      durationMinutes,
      participants,
      workStartHour,
      workEndHour,
    ],
  );

  const addParticipant = () => {
    markStart();
    setParticipants((prev) => [...prev, newParticipant(addZone)]);
  };

  const removeParticipant = (id: string) => {
    markStart();
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-[var(--muted)]">
        Pick a host time and see it for every participant. Work-hour hints use a
        simple {workStartHour}:00–{workEndHour}:00 window. Related:{" "}
        <Link
          href="/tools/timezone-converter"
          className="text-[var(--accent-bright)] underline-offset-2 hover:underline"
        >
          Timezone Converter
        </Link>
        .
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Host start
          <input
            type="datetime-local"
            value={dateTimeLocal}
            onChange={(e) => {
              markStart();
              setDateTimeLocal(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 font-[family-name:var(--font-mono)] text-sm text-[var(--foreground)]"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Host timezone
          <select
            value={hostTimeZone}
            onChange={(e) => {
              markStart();
              setHostTimeZone(e.target.value);
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-2 text-[var(--foreground)]"
          >
            {!TIMEZONES.some((z) => z.id === hostTimeZone) ? (
              <option value={hostTimeZone}>{hostTimeZone}</option>
            ) : null}
            {TIMEZONES.map((z) => (
              <option key={z.id} value={z.id}>
                {z.label} ({z.id})
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Duration (min)
          <input
            type="number"
            min={15}
            max={480}
            step={15}
            value={durationMinutes}
            onChange={(e) => {
              markStart();
              setDurationMinutes(Number(e.target.value));
            }}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
          />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
            Work start
            <input
              type="number"
              min={0}
              max={23}
              value={workStartHour}
              onChange={(e) => {
                markStart();
                setWorkStartHour(Number(e.target.value));
              }}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
            Work end
            <input
              type="number"
              min={1}
              max={24}
              value={workEndHour}
              onChange={(e) => {
                markStart();
                setWorkEndHour(Number(e.target.value));
              }}
              className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-[var(--foreground)]"
            />
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm text-[var(--muted)]">
          Add participant zone
          <select
            value={addZone}
            onChange={(e) => setAddZone(e.target.value)}
            className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-2 text-[var(--foreground)]"
          >
            {TIMEZONES.map((z) => (
              <option key={z.id} value={z.id}>
                {z.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={addParticipant}
          className="rounded-md border border-[var(--border)] px-3 py-2 text-sm hover:border-[var(--accent)]/50"
        >
          Add
        </button>
      </div>

      {!result.ok ? (
        <ToolErrorState message={result.error} />
      ) : (
        <>
          <p className="text-sm text-[var(--muted)]">
            {result.allWithinWorkHours
              ? "All participants fall inside the work-hour window."
              : "Some participants are outside the work-hour window."}
          </p>
          <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[var(--surface-2)] text-xs uppercase tracking-[0.12em] text-[var(--muted)]">
                <tr>
                  <th className="px-3 py-2 font-medium">Participant</th>
                  <th className="px-3 py-2 font-medium">Start local</th>
                  <th className="px-3 py-2 font-medium">End local</th>
                  <th className="px-3 py-2 font-medium">Offset</th>
                  <th className="px-3 py-2 font-medium">Work hours</th>
                  <th className="px-3 py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {result.rows.map((row) => (
                  <tr
                    key={row.participant.id}
                    className="border-t border-[var(--border)]"
                  >
                    <td className="px-3 py-2 text-[var(--foreground)]">
                      <span className="font-medium">{row.participant.label}</span>
                      <span className="mt-0.5 block font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
                        {row.participant.timeZone}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-[var(--foreground)]">
                      {row.startDisplay}
                    </td>
                    <td className="px-3 py-2 text-[var(--foreground)]">
                      {row.endDisplay}
                    </td>
                    <td className="px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--muted)]">
                      {row.startOffset}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={
                          row.withinWorkHours
                            ? "text-[var(--success)]"
                            : "text-[var(--danger)]"
                        }
                      >
                        {row.withinWorkHours ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeParticipant(row.participant.id)}
                        className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {suggestions.length > 0 ? (
        <div>
          <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
            Better slots on {hostDate}
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s.dateTimeLocal}
                type="button"
                onClick={() => {
                  markStart();
                  setDateTimeLocal(s.dateTimeLocal);
                  track({
                    name: "tool_complete",
                    tool: "meeting-time-planner",
                    family: "tools",
                  });
                }}
                className={`rounded-md border px-3 py-1.5 font-[family-name:var(--font-mono)] text-xs ${
                  s.allWithinWorkHours
                    ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--foreground)]"
                    : "border-[var(--border)] text-[var(--muted)]"
                }`}
              >
                {s.dateTimeLocal.slice(11)} · {s.score}/{participants.length}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
