export type NumberBase = 2 | 8 | 10 | 16;

export const NUMBER_BASES: { base: NumberBase; label: string; prefix: string }[] =
  [
    { base: 2, label: "Binary", prefix: "0b" },
    { base: 8, label: "Octal", prefix: "0o" },
    { base: 10, label: "Decimal", prefix: "" },
    { base: 16, label: "Hexadecimal", prefix: "0x" },
  ];

export type BaseConvertResult =
  | {
      ok: true;
      value: bigint;
      representations: Record<NumberBase, string>;
    }
  | { ok: false; error: string };

const DIGITS = "0123456789abcdefghijklmnopqrstuvwxyz";
const ZERO = BigInt(0);

function stripPrefix(raw: string, base: NumberBase): string {
  const t = raw.trim().replace(/\s+/g, "");
  if (base === 2 && /^0b/i.test(t)) return t.slice(2);
  if (base === 8 && /^0o/i.test(t)) return t.slice(2);
  if (base === 16 && /^0x/i.test(t)) return t.slice(2);
  return t;
}

function isValidDigits(body: string, base: NumberBase): boolean {
  if (!body || body === "-" || body === "+") return false;
  const signed = body.replace(/^[+-]/, "");
  if (!signed) return false;
  const allowed = DIGITS.slice(0, base);
  return [...signed.toLowerCase()].every((ch) => allowed.includes(ch));
}

export function bigintToBase(value: bigint, base: NumberBase): string {
  if (base < 2 || base > 36) throw new Error("Base out of range");
  if (value === ZERO) return "0";

  const negative = value < ZERO;
  let n = negative ? -value : value;
  let out = "";
  const b = BigInt(base);

  while (n > ZERO) {
    const digit = Number(n % b);
    out = DIGITS[digit] + out;
    n = n / b;
  }

  if (base === 16) out = out.toUpperCase();
  return negative ? `-${out}` : out;
}

export function parseToBigInt(
  input: string,
  base: NumberBase,
): { ok: true; value: bigint } | { ok: false; error: string } {
  const body = stripPrefix(input, base);
  if (!body) {
    return { ok: false, error: "Enter a number." };
  }
  if (!isValidDigits(body, base)) {
    return {
      ok: false,
      error: `Invalid digits for base ${base}.`,
    };
  }

  try {
    const negative = body.startsWith("-");
    const unsigned = body.replace(/^[+-]/, "");
    let value = ZERO;
    const b = BigInt(base);
    for (const ch of unsigned.toLowerCase()) {
      value = value * b + BigInt(DIGITS.indexOf(ch));
    }
    if (negative) value = -value;
    return { ok: true, value };
  } catch {
    return { ok: false, error: "Could not parse that number." };
  }
}

export function convertFromBase(
  input: string,
  fromBase: NumberBase,
): BaseConvertResult {
  const parsed = parseToBigInt(input, fromBase);
  if (!parsed.ok) return parsed;

  return {
    ok: true,
    value: parsed.value,
    representations: {
      2: bigintToBase(parsed.value, 2),
      8: bigintToBase(parsed.value, 8),
      10: bigintToBase(parsed.value, 10),
      16: bigintToBase(parsed.value, 16),
    },
  };
}
