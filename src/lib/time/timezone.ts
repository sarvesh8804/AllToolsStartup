export type ZoneInfo = {
  id: string;
  label: string;
  region: string;
};

/** Curated IANA zones for the converter UI. */
export const TIMEZONES: ZoneInfo[] = [
  { id: "UTC", label: "UTC", region: "Universal" },
  { id: "America/New_York", label: "New York", region: "America" },
  { id: "America/Chicago", label: "Chicago", region: "America" },
  { id: "America/Denver", label: "Denver", region: "America" },
  { id: "America/Los_Angeles", label: "Los Angeles", region: "America" },
  { id: "America/Sao_Paulo", label: "São Paulo", region: "America" },
  { id: "America/Mexico_City", label: "Mexico City", region: "America" },
  { id: "Europe/London", label: "London", region: "Europe" },
  { id: "Europe/Paris", label: "Paris", region: "Europe" },
  { id: "Europe/Berlin", label: "Berlin", region: "Europe" },
  { id: "Europe/Moscow", label: "Moscow", region: "Europe" },
  { id: "Asia/Dubai", label: "Dubai", region: "Asia" },
  { id: "Asia/Kolkata", label: "India (Kolkata)", region: "Asia" },
  { id: "Asia/Singapore", label: "Singapore", region: "Asia" },
  { id: "Asia/Shanghai", label: "Shanghai", region: "Asia" },
  { id: "Asia/Tokyo", label: "Tokyo", region: "Asia" },
  { id: "Asia/Seoul", label: "Seoul", region: "Asia" },
  { id: "Australia/Sydney", label: "Sydney", region: "Australia" },
  { id: "Pacific/Auckland", label: "Auckland", region: "Pacific" },
];

const PARTS = [
  "year",
  "month",
  "day",
  "hour",
  "minute",
  "second",
] as const;

type PartName = (typeof PARTS)[number];

function getZonedParts(date: Date, timeZone: string): Record<PartName, number> {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const map: Partial<Record<PartName, number>> = {};
  for (const { type, value } of fmt.formatToParts(date)) {
    if ((PARTS as readonly string[]).includes(type)) {
      // Intl may return "24" for midnight in some engines — normalize.
      const n = Number(value);
      map[type as PartName] = type === "hour" && n === 24 ? 0 : n;
    }
  }
  return map as Record<PartName, number>;
}

/** Offset of `timeZone` at instant `date`, in milliseconds (UTC = local - offset). */
export function getTimeZoneOffsetMs(date: Date, timeZone: string): number {
  const p = getZonedParts(date, timeZone);
  const asUtc = Date.UTC(
    p.year,
    p.month - 1,
    p.day,
    p.hour,
    p.minute,
    p.second,
  );
  return asUtc - date.getTime();
}

export type WallTime = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

/** Interpret a wall-clock time in `timeZone` as a UTC Date. */
export function zonedTimeToUtc(wall: WallTime, timeZone: string): Date {
  const utcGuess = Date.UTC(
    wall.year,
    wall.month - 1,
    wall.day,
    wall.hour,
    wall.minute,
    wall.second,
  );
  // First pass
  let instant = new Date(utcGuess - getTimeZoneOffsetMs(new Date(utcGuess), timeZone));
  // Second pass corrects around DST transitions
  instant = new Date(
    utcGuess - getTimeZoneOffsetMs(instant, timeZone),
  );
  return instant;
}

export function formatInTimeZone(
  date: Date,
  timeZone: string,
): { isoLocal: string; display: string; offset: string } {
  const p = getZonedParts(date, timeZone);
  const isoLocal = `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}T${String(p.hour).padStart(2, "0")}:${String(p.minute).padStart(2, "0")}:${String(p.second).padStart(2, "0")}`;

  const display = new Intl.DateTimeFormat(undefined, {
    timeZone,
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);

  const offsetFmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
    hour: "2-digit",
  });
  const offsetPart = offsetFmt
    .formatToParts(date)
    .find((x) => x.type === "timeZoneName")?.value;
  const offset = offsetPart ?? "";

  return { isoLocal, display, offset };
}

export function parseDateTimeLocal(value: string): WallTime | null {
  // HTML datetime-local: YYYY-MM-DDTHH:mm or with seconds
  const m = value
    .trim()
    .match(
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/,
    );
  if (!m) return null;
  return {
    year: Number(m[1]),
    month: Number(m[2]),
    day: Number(m[3]),
    hour: Number(m[4]),
    minute: Number(m[5]),
    second: Number(m[6] ?? "0"),
  };
}

export function wallToDateTimeLocal(wall: WallTime): string {
  return `${wall.year}-${String(wall.month).padStart(2, "0")}-${String(wall.day).padStart(2, "0")}T${String(wall.hour).padStart(2, "0")}:${String(wall.minute).padStart(2, "0")}`;
}

export type ConvertResult =
  | {
      ok: true;
      utc: Date;
      rows: {
        zone: ZoneInfo;
        isoLocal: string;
        display: string;
        offset: string;
      }[];
    }
  | { ok: false; error: string };

export function convertTimezones(
  dateTimeLocal: string,
  sourceZone: string,
  targetZones: string[] = TIMEZONES.map((z) => z.id),
): ConvertResult {
  const wall = parseDateTimeLocal(dateTimeLocal);
  if (!wall) {
    return { ok: false, error: "Enter a valid date and time." };
  }
  if (!TIMEZONES.some((z) => z.id === sourceZone) && sourceZone !== "UTC") {
    // Allow any IANA id the runtime supports
    try {
      Intl.DateTimeFormat(undefined, { timeZone: sourceZone });
    } catch {
      return { ok: false, error: `Unknown timezone: ${sourceZone}` };
    }
  }

  try {
    const utc = zonedTimeToUtc(wall, sourceZone);
    const zoneMap = new Map(TIMEZONES.map((z) => [z.id, z]));
    const rows = targetZones.map((id) => {
      const zone = zoneMap.get(id) ?? {
        id,
        label: id,
        region: "",
      };
      const formatted = formatInTimeZone(utc, id);
      return { zone, ...formatted };
    });
    return { ok: true, utc, rows };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Conversion failed",
    };
  }
}

export function nowInLocalInput(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

export function guessLocalTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}
