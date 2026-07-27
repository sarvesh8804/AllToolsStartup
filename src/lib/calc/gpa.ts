export type LetterGrade =
  | "A"
  | "A-"
  | "B+"
  | "B"
  | "B-"
  | "C+"
  | "C"
  | "C-"
  | "D+"
  | "D"
  | "D-"
  | "F";

export const LETTER_POINTS: Record<LetterGrade, number> = {
  A: 4.0,
  "A-": 3.7,
  "B+": 3.3,
  B: 3.0,
  "B-": 2.7,
  "C+": 2.3,
  C: 2.0,
  "C-": 1.7,
  "D+": 1.3,
  D: 1.0,
  "D-": 0.7,
  F: 0.0,
};

export const LETTER_GRADES = Object.keys(LETTER_POINTS) as LetterGrade[];

export type GpaCourse = {
  id: string;
  name: string;
  credits: number;
  /** Direct grade points, or derived from letter. */
  points: number;
};

export type GpaResult = {
  courses: GpaCourse[];
  totalCredits: number;
  qualityPoints: number;
  gpa: number;
};

export function letterToPoints(letter: LetterGrade): number {
  return LETTER_POINTS[letter];
}

/**
 * Weighted GPA = Σ(points × credits) / Σ(credits) on a 4.0 scale.
 */
export function calculateGpa(
  courses: GpaCourse[],
): { ok: true; value: GpaResult } | { ok: false; error: string } {
  if (courses.length === 0) {
    return { ok: false, error: "Add at least one course." };
  }

  let totalCredits = 0;
  let qualityPoints = 0;

  for (const course of courses) {
    if (!Number.isFinite(course.credits) || !Number.isFinite(course.points)) {
      return { ok: false, error: "Enter valid credits and grade points." };
    }
    if (course.credits <= 0) {
      return { ok: false, error: "Credits must be greater than zero." };
    }
    if (course.points < 0 || course.points > 4.0) {
      return {
        ok: false,
        error: "Grade points must be between 0 and 4.0 on this scale.",
      };
    }
    totalCredits += course.credits;
    qualityPoints += course.points * course.credits;
  }

  return {
    ok: true,
    value: {
      courses,
      totalCredits,
      qualityPoints,
      gpa: qualityPoints / totalCredits,
    },
  };
}
