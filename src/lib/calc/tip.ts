export type TipInput = {
  bill: number;
  tipPercent: number;
  people: number;
};

export type TipResult = {
  bill: number;
  tipPercent: number;
  people: number;
  tipAmount: number;
  total: number;
  perPerson: number;
  tipPerPerson: number;
};

export function calculateTip(
  input: TipInput,
): { ok: true; value: TipResult } | { ok: false; error: string } {
  const { bill, tipPercent, people } = input;

  if (![bill, tipPercent, people].every(Number.isFinite)) {
    return { ok: false, error: "Enter valid numbers." };
  }
  if (bill < 0) return { ok: false, error: "Bill cannot be negative." };
  if (tipPercent < 0) return { ok: false, error: "Tip % cannot be negative." };
  if (!Number.isInteger(people) || people < 1) {
    return { ok: false, error: "People must be a whole number ≥ 1." };
  }

  const tipAmount = (tipPercent / 100) * bill;
  const total = bill + tipAmount;
  return {
    ok: true,
    value: {
      bill,
      tipPercent,
      people,
      tipAmount,
      total,
      perPerson: total / people,
      tipPerPerson: tipAmount / people,
    },
  };
}

export function formatMoney(n: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return n.toFixed(2);
  }
}
