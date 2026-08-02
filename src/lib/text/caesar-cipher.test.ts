import { describe, expect, it } from "vitest";
import { caesarCipher } from "./caesar-cipher";

describe("caesarCipher", () => {
  it("encodes with a positive shift", () => {
    expect(caesarCipher("ABC", 1, "encode")).toBe("BCD");
    expect(caesarCipher("xyz", 3, "encode")).toBe("abc");
  });

  it("decodes by reversing the shift", () => {
    const encoded = caesarCipher("Hello", 5, "encode");
    expect(caesarCipher(encoded, 5, "decode")).toBe("Hello");
  });

  it("preserves non-alphabetic characters", () => {
    expect(caesarCipher("Hi, World! 123", 13, "encode")).toBe("Uv, Jbeyq! 123");
  });

  it("rotates with shift 13", () => {
    expect(caesarCipher("Forge", 13, "encode")).toBe("Sbetr");
    expect(caesarCipher("Sbetr", 13, "decode")).toBe("Forge");
  });

  it("wraps shifts larger than 26", () => {
    expect(caesarCipher("A", 27, "encode")).toBe("B");
  });
});
