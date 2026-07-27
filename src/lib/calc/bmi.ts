export type BmiUnitSystem = "metric" | "imperial";

export type BmiInput =
  | {
      system: "metric";
      weightKg: number;
      heightCm: number;
    }
  | {
      system: "imperial";
      weightLb: number;
      heightFt: number;
      heightIn: number;
    };

export type BmiCategory =
  | "Underweight"
  | "Normal"
  | "Overweight"
  | "Obese";

export type BmiResult = {
  bmi: number;
  category: BmiCategory;
  weightKg: number;
  heightM: number;
  system: BmiUnitSystem;
};

export function categorizeBmi(bmi: number): BmiCategory {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Normal";
  if (bmi < 30) return "Overweight";
  return "Obese";
}

/**
 * BMI = weight(kg) / height(m)²
 * Imperial inputs convert via lb→kg and (ft*12+in)→m.
 */
export function calculateBmi(
  input: BmiInput,
): { ok: true; value: BmiResult } | { ok: false; error: string } {
  let weightKg: number;
  let heightM: number;
  const system = input.system;

  if (input.system === "metric") {
    const { weightKg: kg, heightCm } = input;
    if (![kg, heightCm].every(Number.isFinite)) {
      return { ok: false, error: "Enter valid numbers." };
    }
    if (kg <= 0) return { ok: false, error: "Weight must be greater than zero." };
    if (heightCm <= 0) {
      return { ok: false, error: "Height must be greater than zero." };
    }
    weightKg = kg;
    heightM = heightCm / 100;
  } else {
    const { weightLb, heightFt, heightIn } = input;
    if (![weightLb, heightFt, heightIn].every(Number.isFinite)) {
      return { ok: false, error: "Enter valid numbers." };
    }
    if (weightLb <= 0) {
      return { ok: false, error: "Weight must be greater than zero." };
    }
    if (heightFt < 0 || heightIn < 0) {
      return { ok: false, error: "Height cannot be negative." };
    }
    const totalInches = heightFt * 12 + heightIn;
    if (totalInches <= 0) {
      return { ok: false, error: "Height must be greater than zero." };
    }
    weightKg = weightLb * 0.45359237;
    heightM = totalInches * 0.0254;
  }

  const bmi = weightKg / (heightM * heightM);
  if (!Number.isFinite(bmi)) {
    return { ok: false, error: "Could not compute BMI." };
  }

  return {
    ok: true,
    value: {
      bmi,
      category: categorizeBmi(bmi),
      weightKg,
      heightM,
      system,
    },
  };
}
