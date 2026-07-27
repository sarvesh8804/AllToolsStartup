import { describe, expect, it } from "vitest";
import {
  DEFAULT_ADVANCED_PASSWORD_OPTIONS,
  DEFAULT_PASSWORD_OPTIONS,
  buildPool,
  estimateStrength,
  generateAdvancedPassword,
  generateAdvancedPasswords,
  generatePassword,
  type AdvancedPasswordOptions,
  type PasswordOptions,
} from "./password";

function opts(overrides: Partial<PasswordOptions> = {}): PasswordOptions {
  return { ...DEFAULT_PASSWORD_OPTIONS, ...overrides };
}

function adv(
  overrides: Partial<AdvancedPasswordOptions> = {},
): AdvancedPasswordOptions {
  return { ...DEFAULT_ADVANCED_PASSWORD_OPTIONS, ...overrides };
}

describe("buildPool", () => {
  it("combines selected sets", () => {
    const pool = buildPool(
      opts({ lowercase: true, uppercase: false, numbers: true, symbols: false }),
    );
    expect(pool).toContain("a");
    expect(pool).toContain("9");
    expect(pool).not.toContain("A");
    expect(pool).not.toContain("!");
  });

  it("excludes ambiguous characters when asked", () => {
    const pool = buildPool(opts({ excludeAmbiguous: true }));
    expect(pool).not.toContain("l");
    expect(pool).not.toContain("0");
    expect(pool).not.toContain("O");
  });
});

describe("generatePassword", () => {
  it("respects the requested length", () => {
    expect(generatePassword(opts({ length: 32 }))).toHaveLength(32);
  });

  it("only uses characters from the pool", () => {
    const options = opts({
      lowercase: true,
      uppercase: false,
      numbers: false,
      symbols: false,
      length: 100,
    });
    const pw = generatePassword(options);
    expect(/^[a-z]+$/.test(pw)).toBe(true);
  });

  it("returns empty when no set is selected", () => {
    expect(
      generatePassword(
        opts({
          lowercase: false,
          uppercase: false,
          numbers: false,
          symbols: false,
        }),
      ),
    ).toBe("");
  });

  it("produces different passwords across calls", () => {
    const a = generatePassword(opts({ length: 40 }));
    const b = generatePassword(opts({ length: 40 }));
    expect(a).not.toBe(b);
  });
});

describe("generateAdvancedPassword", () => {
  it("requires every selected set", () => {
    const pw = generateAdvancedPassword(
      adv({
        length: 12,
        requireEverySet: true,
        beginWithLetter: false,
        lowercase: true,
        uppercase: true,
        numbers: true,
        symbols: true,
      }),
    );
    expect(pw).toHaveLength(12);
    expect(/[a-z]/.test(pw)).toBe(true);
    expect(/[A-Z]/.test(pw)).toBe(true);
    expect(/\d/.test(pw)).toBe(true);
    expect(/[^a-zA-Z0-9]/.test(pw)).toBe(true);
  });

  it("can begin with a letter", () => {
    for (let i = 0; i < 20; i += 1) {
      const pw = generateAdvancedPassword(
        adv({ beginWithLetter: true, length: 16 }),
      );
      expect(/^[a-zA-Z]/.test(pw)).toBe(true);
    }
  });

  it("generates multiple passwords", () => {
    const list = generateAdvancedPasswords(adv({ count: 5, length: 10 }));
    expect(list).toHaveLength(5);
    expect(new Set(list).size).toBeGreaterThan(1);
  });
});

describe("estimateStrength", () => {
  it("computes entropy and labels a long full-charset password strong", () => {
    const s = estimateStrength(opts({ length: 20 }));
    expect(s.entropyBits).toBeGreaterThanOrEqual(120);
    expect(s.label).toBe("Very strong");
  });

  it("labels a short numeric pin as very weak", () => {
    const s = estimateStrength(
      opts({ length: 4, lowercase: false, uppercase: false, symbols: false }),
    );
    expect(s.label).toBe("Very weak");
  });
});
