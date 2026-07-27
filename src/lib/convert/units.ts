export type LinearUnit = {
  id: string;
  label: string;
  /** Multiply by this to get the category base unit. */
  toBase: number;
};

export type TempUnitId = "c" | "f" | "k";

export type TempUnit = {
  id: TempUnitId;
  label: string;
};

export const LENGTH_UNITS: LinearUnit[] = [
  { id: "mm", label: "Millimeters (mm)", toBase: 0.001 },
  { id: "cm", label: "Centimeters (cm)", toBase: 0.01 },
  { id: "m", label: "Meters (m)", toBase: 1 },
  { id: "km", label: "Kilometers (km)", toBase: 1000 },
  { id: "in", label: "Inches (in)", toBase: 0.0254 },
  { id: "ft", label: "Feet (ft)", toBase: 0.3048 },
  { id: "yd", label: "Yards (yd)", toBase: 0.9144 },
  { id: "mi", label: "Miles (mi)", toBase: 1609.344 },
];

export const WEIGHT_UNITS: LinearUnit[] = [
  { id: "mg", label: "Milligrams (mg)", toBase: 1e-6 },
  { id: "g", label: "Grams (g)", toBase: 0.001 },
  { id: "kg", label: "Kilograms (kg)", toBase: 1 },
  { id: "t", label: "Metric tons (t)", toBase: 1000 },
  { id: "oz", label: "Ounces (oz)", toBase: 0.028349523125 },
  { id: "lb", label: "Pounds (lb)", toBase: 0.45359237 },
  { id: "st", label: "Stones (st)", toBase: 6.35029318 },
];

export const TEMP_UNITS: TempUnit[] = [
  { id: "c", label: "Celsius (°C)" },
  { id: "f", label: "Fahrenheit (°F)" },
  { id: "k", label: "Kelvin (K)" },
];

/** Base unit: byte. Includes SI (1000ⁿ) and IEC (1024ⁿ) prefixes. */
export const DATA_STORAGE_UNITS: LinearUnit[] = [
  { id: "bit", label: "Bits (b)", toBase: 0.125 },
  { id: "B", label: "Bytes (B)", toBase: 1 },
  { id: "KB", label: "Kilobytes (KB, 10³)", toBase: 1e3 },
  { id: "MB", label: "Megabytes (MB, 10⁶)", toBase: 1e6 },
  { id: "GB", label: "Gigabytes (GB, 10⁹)", toBase: 1e9 },
  { id: "TB", label: "Terabytes (TB, 10¹²)", toBase: 1e12 },
  { id: "PB", label: "Petabytes (PB, 10¹⁵)", toBase: 1e15 },
  { id: "KiB", label: "Kibibytes (KiB, 2¹⁰)", toBase: 1024 },
  { id: "MiB", label: "Mebibytes (MiB, 2²⁰)", toBase: 1024 ** 2 },
  { id: "GiB", label: "Gibibytes (GiB, 2³⁰)", toBase: 1024 ** 3 },
  { id: "TiB", label: "Tebibytes (TiB, 2⁴⁰)", toBase: 1024 ** 4 },
];

export type ConvertResult =
  | { ok: true; value: number; formatted: string }
  | { ok: false; error: string };

export type ConvertTableResult =
  | { ok: true; rows: { id: string; label: string; formatted: string }[] }
  | { ok: false; error: string };

/** Trim floating noise while keeping useful precision. */
export function formatUnitValue(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (Object.is(n, -0)) return "0";
  const abs = Math.abs(n);
  if (abs !== 0 && (abs < 1e-6 || abs >= 1e10)) {
    return n.toExponential(6).replace(/\.?0+e/, "e");
  }
  const s = n.toPrecision(12);
  return String(Number(s));
}

export function parseUnitInput(raw: string): ConvertResult {
  const t = raw.trim().replace(/,/g, "");
  if (!t) return { ok: false, error: "Enter a number." };
  if (!/^[+-]?(\d+(\.\d*)?|\.\d+)([eE][+-]?\d+)?$/.test(t)) {
    return { ok: false, error: "Enter a valid number." };
  }
  const n = Number(t);
  if (!Number.isFinite(n)) {
    return { ok: false, error: "Enter a valid number." };
  }
  return { ok: true, value: n, formatted: formatUnitValue(n) };
}

export function convertLinear(
  raw: string,
  fromId: string,
  toId: string,
  units: LinearUnit[],
): ConvertResult {
  const parsed = parseUnitInput(raw);
  if (!parsed.ok) return parsed;
  const from = units.find((u) => u.id === fromId);
  const to = units.find((u) => u.id === toId);
  if (!from || !to) {
    return { ok: false, error: "Unknown unit." };
  }
  const base = parsed.value * from.toBase;
  const out = base / to.toBase;
  return { ok: true, value: out, formatted: formatUnitValue(out) };
}

function toCelsius(value: number, from: TempUnitId): number {
  switch (from) {
    case "c":
      return value;
    case "f":
      return ((value - 32) * 5) / 9;
    case "k":
      return value - 273.15;
  }
}

function fromCelsius(celsius: number, to: TempUnitId): number {
  switch (to) {
    case "c":
      return celsius;
    case "f":
      return (celsius * 9) / 5 + 32;
    case "k":
      return celsius + 273.15;
  }
}

export function convertTemperature(
  raw: string,
  fromId: TempUnitId,
  toId: TempUnitId,
): ConvertResult {
  const parsed = parseUnitInput(raw);
  if (!parsed.ok) return parsed;
  if (fromId === "k" && parsed.value < 0) {
    return { ok: false, error: "Kelvin cannot be negative." };
  }
  const c = toCelsius(parsed.value, fromId);
  if (toId === "k" && c + 273.15 < 0) {
    return { ok: false, error: "Result would be below absolute zero." };
  }
  const out = fromCelsius(c, toId);
  return { ok: true, value: out, formatted: formatUnitValue(out) };
}

/** Convert value in `fromId` into every unit in the list. */
export function convertLinearTable(
  raw: string,
  fromId: string,
  units: LinearUnit[],
  options?: { rejectNegative?: boolean },
): ConvertTableResult {
  const parsed = parseUnitInput(raw);
  if (!parsed.ok) return parsed;
  if (options?.rejectNegative && parsed.value < 0) {
    return { ok: false, error: "Value cannot be negative." };
  }
  const from = units.find((u) => u.id === fromId);
  if (!from) return { ok: false, error: "Unknown unit." };
  const base = parsed.value * from.toBase;
  return {
    ok: true,
    rows: units.map((u) => ({
      id: u.id,
      label: u.label,
      formatted: formatUnitValue(base / u.toBase),
    })),
  };
}

export function convertTemperatureTable(
  raw: string,
  fromId: TempUnitId,
): ConvertTableResult {
  const rows: { id: string; label: string; formatted: string }[] = [];
  for (const u of TEMP_UNITS) {
    const r = convertTemperature(raw, fromId, u.id);
    if (!r.ok) return r;
    rows.push({ id: u.id, label: u.label, formatted: r.formatted });
  }
  return { ok: true, rows };
}
