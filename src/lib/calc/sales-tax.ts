export type TaxMode = "exclusive" | "inclusive";

export type SalesTaxInput = {
  amount: number;
  ratePercent: number;
  mode: TaxMode;
};

export type SalesTaxResult = {
  amount: number;
  ratePercent: number;
  mode: TaxMode;
  net: number;
  tax: number;
  gross: number;
};

/**
 * GST / sales tax math.
 * - exclusive: amount is pre-tax (net); tax is added on top.
 * - inclusive: amount already includes tax; back out net + tax.
 */
export function calculateSalesTax(
  input: SalesTaxInput,
): { ok: true; value: SalesTaxResult } | { ok: false; error: string } {
  const { amount, ratePercent, mode } = input;

  if (![amount, ratePercent].every(Number.isFinite)) {
    return { ok: false, error: "Enter valid numbers." };
  }
  if (amount < 0) {
    return { ok: false, error: "Amount cannot be negative." };
  }
  if (ratePercent < 0) {
    return { ok: false, error: "Tax rate cannot be negative." };
  }
  if (ratePercent > 100) {
    return { ok: false, error: "Tax rate cannot exceed 100%." };
  }
  if (mode !== "exclusive" && mode !== "inclusive") {
    return { ok: false, error: "Choose exclusive or inclusive tax mode." };
  }

  let net: number;
  let tax: number;
  let gross: number;

  if (mode === "exclusive") {
    net = amount;
    tax = (amount * ratePercent) / 100;
    gross = net + tax;
  } else {
    // amount = net × (1 + r/100) → net = amount / (1 + r/100)
    gross = amount;
    if (ratePercent === 0) {
      net = amount;
      tax = 0;
    } else {
      net = amount / (1 + ratePercent / 100);
      tax = amount - net;
    }
  }

  return {
    ok: true,
    value: {
      amount,
      ratePercent,
      mode,
      net,
      tax,
      gross,
    },
  };
}

/** Common GST slabs (India) plus a few handy defaults. */
export const GST_RATE_PRESETS = [
  { label: "0%", value: 0 },
  { label: "5% GST", value: 5 },
  { label: "12% GST", value: 12 },
  { label: "18% GST", value: 18 },
  { label: "28% GST", value: 28 },
] as const;
