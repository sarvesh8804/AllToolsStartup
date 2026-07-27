import {
  TIMEZONES,
  formatInTimeZone,
  parseDateTimeLocal,
  zonedTimeToUtc,
  type ZoneInfo,
} from "@/lib/time/timezone";

export type MeetingParticipant = {
  id: string;
  label: string;
  timeZone: string;
};

export type MeetingPlanInput = {
  /** Host local datetime (datetime-local string). */
  dateTimeLocal: string;
  hostTimeZone: string;
  /** Duration in minutes (15–480). */
  durationMinutes: number;
  participants: MeetingParticipant[];
  /** Inclusive work-hour start (0–23) for overlap scoring. */
  workStartHour?: number;
  /** Exclusive work-hour end (1–24) for overlap scoring. */
  workEndHour?: number;
};

export type MeetingZoneRow = {
  participant: MeetingParticipant;
  zone: ZoneInfo;
  startDisplay: string;
  endDisplay: string;
  startIsoLocal: string;
  endIsoLocal: string;
  startOffset: string;
  withinWorkHours: boolean;
};

export type MeetingPlanResult =
  | {
      ok: true;
      startUtc: Date;
      endUtc: Date;
      durationMinutes: number;
      rows: MeetingZoneRow[];
      allWithinWorkHours: boolean;
    }
  | { ok: false; error: string };

function zoneInfo(id: string): ZoneInfo {
  return (
    TIMEZONES.find((z) => z.id === id) ?? {
      id,
      label: id,
      region: "",
    }
  );
}

function hourInZone(date: Date, timeZone: string): number {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(date);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  return hour === 24 ? 0 : hour;
}

function isWithinWorkHours(
  start: Date,
  end: Date,
  timeZone: string,
  workStart: number,
  workEnd: number,
): boolean {
  // Sample start, midpoint, and just before end
  const mid = new Date((start.getTime() + end.getTime()) / 2);
  const nearEnd = new Date(end.getTime() - 60_000);
  for (const instant of [start, mid, nearEnd]) {
    if (instant < start || instant >= end) continue;
    const h = hourInZone(instant, timeZone);
    if (h < workStart || h >= workEnd) return false;
  }
  // Also ensure meeting doesn't cross midnight awkwardly relative to work window:
  // require start hour in window
  const startH = hourInZone(start, timeZone);
  return startH >= workStart && startH < workEnd;
}

export function planMeeting(input: MeetingPlanInput): MeetingPlanResult {
  const wall = parseDateTimeLocal(input.dateTimeLocal);
  if (!wall) {
    return { ok: false, error: "Enter a valid meeting start date and time." };
  }

  const duration = Math.floor(input.durationMinutes);
  if (!Number.isFinite(duration) || duration < 15 || duration > 480) {
    return { ok: false, error: "Duration must be between 15 and 480 minutes." };
  }

  if (!input.participants.length) {
    return { ok: false, error: "Add at least one participant timezone." };
  }

  const workStart = input.workStartHour ?? 9;
  const workEnd = input.workEndHour ?? 17;

  try {
    Intl.DateTimeFormat(undefined, { timeZone: input.hostTimeZone });
  } catch {
    return { ok: false, error: `Unknown host timezone: ${input.hostTimeZone}` };
  }

  try {
    const startUtc = zonedTimeToUtc(wall, input.hostTimeZone);
    const endUtc = new Date(startUtc.getTime() + duration * 60_000);

    const rows: MeetingZoneRow[] = input.participants.map((participant) => {
      try {
        Intl.DateTimeFormat(undefined, { timeZone: participant.timeZone });
      } catch {
        throw new Error(`Unknown timezone: ${participant.timeZone}`);
      }
      const startFmt = formatInTimeZone(startUtc, participant.timeZone);
      const endFmt = formatInTimeZone(endUtc, participant.timeZone);
      const withinWorkHours = isWithinWorkHours(
        startUtc,
        endUtc,
        participant.timeZone,
        workStart,
        workEnd,
      );
      return {
        participant,
        zone: zoneInfo(participant.timeZone),
        startDisplay: startFmt.display,
        endDisplay: endFmt.display,
        startIsoLocal: startFmt.isoLocal,
        endIsoLocal: endFmt.isoLocal,
        startOffset: startFmt.offset,
        withinWorkHours,
      };
    });

    return {
      ok: true,
      startUtc,
      endUtc,
      durationMinutes: duration,
      rows,
      allWithinWorkHours: rows.every((r) => r.withinWorkHours),
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not plan meeting.",
    };
  }
}

export type MeetingSlotSuggestion = {
  dateTimeLocal: string;
  score: number;
  allWithinWorkHours: boolean;
};

/**
 * Suggest start times on the host's calendar day (same Y-M-D as input)
 * every `stepMinutes`, scored by how many participants are in work hours.
 */
export function suggestMeetingSlots(
  input: Omit<MeetingPlanInput, "dateTimeLocal"> & {
    date: string;
    stepMinutes?: number;
  },
): MeetingSlotSuggestion[] {
  const m = input.date.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return [];

  const step = Math.max(15, Math.min(120, input.stepMinutes ?? 30));
  const suggestions: MeetingSlotSuggestion[] = [];

  for (let minutes = 0; minutes < 24 * 60; minutes += step) {
    const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
    const mm = String(minutes % 60).padStart(2, "0");
    const dateTimeLocal = `${input.date}T${hh}:${mm}`;
    const plan = planMeeting({
      ...input,
      dateTimeLocal,
    });
    if (!plan.ok) continue;
    const inHours = plan.rows.filter((r) => r.withinWorkHours).length;
    if (inHours === 0) continue;
    suggestions.push({
      dateTimeLocal,
      score: inHours,
      allWithinWorkHours: plan.allWithinWorkHours,
    });
  }

  return suggestions
    .sort(
      (a, b) =>
        Number(b.allWithinWorkHours) - Number(a.allWithinWorkHours) ||
        b.score - a.score ||
        a.dateTimeLocal.localeCompare(b.dateTimeLocal),
    )
    .slice(0, 12);
}
