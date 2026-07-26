export type TimestampParts = {
  seconds: number;
  milliseconds: number;
  iso: string;
  utc: string;
  local: string;
};

export type TimestampParseResult =
  | { ok: true; value: TimestampParts; unit: "s" | "ms" }
  | { ok: false; error: string };

/** Detect seconds vs milliseconds from digit length / magnitude. */
export function detectUnit(n: number): "s" | "ms" {
  // Typical ms timestamps are 13 digits (~year 2001–2286); seconds are 10.
  const abs = Math.abs(Math.trunc(n));
  if (abs >= 1e12) return "ms";
  if (abs >= 1e11) return "ms"; // 12-digit ms edge
  return "s";
}

export function fromUnix(secondsOrMs: number, unit?: "s" | "ms"): TimestampParts {
  const resolved = unit ?? detectUnit(secondsOrMs);
  const ms =
    resolved === "ms" ? Math.trunc(secondsOrMs) : Math.trunc(secondsOrMs) * 1000;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid timestamp");
  }
  return {
    seconds: Math.floor(ms / 1000),
    milliseconds: ms,
    iso: date.toISOString(),
    utc: date.toUTCString(),
    local: date.toString(),
  };
}

export function parseTimestampInput(raw: string): TimestampParseResult {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { ok: false, error: "Enter a Unix timestamp." };
  }

  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return { ok: false, error: "Timestamp must be a number (seconds or milliseconds)." };
  }

  const n = Number(trimmed);
  if (!Number.isFinite(n)) {
    return { ok: false, error: "Timestamp is not a finite number." };
  }

  try {
    const unit = detectUnit(n);
    return { ok: true, value: fromUnix(n, unit), unit };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Invalid timestamp",
    };
  }
}

export function fromIso(iso: string): TimestampParseResult {
  const trimmed = iso.trim();
  if (!trimmed) {
    return { ok: false, error: "Enter an ISO-8601 date string." };
  }
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) {
    return { ok: false, error: "Could not parse that date." };
  }
  const ms = date.getTime();
  return {
    ok: true,
    value: fromUnix(ms, "ms"),
    unit: "ms",
  };
}

export function nowParts(): TimestampParts {
  return fromUnix(Date.now(), "ms");
}
