import {
  TIMEZONES,
  formatInTimeZone,
  type ZoneInfo,
} from "@/lib/time/timezone";

export type WorldClockRow = {
  zone: ZoneInfo;
  display: string;
  isoLocal: string;
  offset: string;
  time: string;
  date: string;
  weekday: string;
};

export const DEFAULT_WORLD_CLOCK_ZONES = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Australia/Sydney",
];

function zoneInfo(id: string): ZoneInfo {
  return (
    TIMEZONES.find((z) => z.id === id) ?? {
      id,
      label: id,
      region: "",
    }
  );
}

export function buildWorldClock(
  zoneIds: string[],
  now: Date = new Date(),
): WorldClockRow[] {
  return zoneIds.map((id) => {
    const zone = zoneInfo(id);
    const formatted = formatInTimeZone(now, id);
    const weekday = new Intl.DateTimeFormat(undefined, {
      timeZone: id,
      weekday: "short",
    }).format(now);
    const date = new Intl.DateTimeFormat(undefined, {
      timeZone: id,
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(now);
    const time = new Intl.DateTimeFormat(undefined, {
      timeZone: id,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(now);
    return {
      zone,
      display: formatted.display,
      isoLocal: formatted.isoLocal,
      offset: formatted.offset,
      time,
      date,
      weekday,
    };
  });
}

export function availableWorldClockZones(): ZoneInfo[] {
  return TIMEZONES;
}
