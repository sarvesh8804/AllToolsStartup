import { describe, expect, it } from "vitest";
import { calculateBmi, categorizeBmi } from "./bmi";

describe("calculateBmi", () => {
  it("computes metric BMI", () => {
    // 70 kg, 175 cm → 22.857…
    const result = calculateBmi({
      system: "metric",
      weightKg: 70,
      heightCm: 175,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.bmi).toBeCloseTo(22.857, 2);
      expect(result.value.category).toBe("Normal");
    }
  });

  it("computes imperial BMI", () => {
    // 154 lb, 5'9" ≈ 70 kg / 1.753 m → ~22.8
    const result = calculateBmi({
      system: "imperial",
      weightLb: 154,
      heightFt: 5,
      heightIn: 9,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.bmi).toBeGreaterThan(22);
      expect(result.value.bmi).toBeLessThan(24);
      expect(result.value.category).toBe("Normal");
    }
  });

  it("categorizes WHO bands", () => {
    expect(categorizeBmi(17)).toBe("Underweight");
    expect(categorizeBmi(22)).toBe("Normal");
    expect(categorizeBmi(27)).toBe("Overweight");
    expect(categorizeBmi(32)).toBe("Obese");
  });

  it("rejects zero weight", () => {
    expect(
      calculateBmi({ system: "metric", weightKg: 0, heightCm: 170 }).ok,
    ).toBe(false);
  });
});
