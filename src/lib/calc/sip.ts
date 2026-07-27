export type SipInput = {
  monthlyInvestment: number;
  annualRatePercent: number;
  years: number;
};

export type SipYearRow = {
  year: number;
  invested: number;
  value: number;
  returns: number;
};

export type SipResult = {
  monthlyInvestment: number;
  annualRatePercent: number;
  years: number;
  months: number;
  monthlyRate: number;
  totalInvested: number;
  maturityValue: number;
  estimatedReturns: number;
  schedule: SipYearRow[];
};

/**
 * SIP future value (annuity due — common Indian SIP calculator formula):
 * FV = P × (((1+i)^n − 1) / i) × (1+i)
 * where i = annualRate/12/100, n = years×12, P = monthly investment.
 * Zero-rate case: FV = P × n.
 */
export function calculateSip(
  input: SipInput,
): { ok: true; value: SipResult } | { ok: false; error: string } {
  const { monthlyInvestment, annualRatePercent, years } = input;

  if (![monthlyInvestment, annualRatePercent, years].every(Number.isFinite)) {
    return { ok: false, error: "Enter valid numbers." };
  }
  if (monthlyInvestment <= 0) {
    return { ok: false, error: "Monthly investment must be greater than zero." };
  }
  if (annualRatePercent < 0) {
    return { ok: false, error: "Expected return cannot be negative." };
  }
  if (years <= 0) {
    return { ok: false, error: "Tenure must be greater than zero." };
  }

  const months = Math.round(years * 12);
  if (months < 1) {
    return { ok: false, error: "Tenure must be at least one month." };
  }

  const i = annualRatePercent / 100 / 12;
  const P = monthlyInvestment;

  let maturityValue: number;
  if (i === 0) {
    maturityValue = P * months;
  } else {
    maturityValue = P * ((Math.pow(1 + i, months) - 1) / i) * (1 + i);
  }

  const totalInvested = P * months;
  const estimatedReturns = maturityValue - totalInvested;

  const schedule: SipYearRow[] = [];
  const wholeYears = Math.floor(months / 12);
  for (let year = 1; year <= wholeYears; year += 1) {
    const n = year * 12;
    const invested = P * n;
    const value =
      i === 0 ? invested : P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    schedule.push({
      year,
      invested,
      value,
      returns: value - invested,
    });
  }

  return {
    ok: true,
    value: {
      monthlyInvestment,
      annualRatePercent,
      years,
      months,
      monthlyRate: i,
      totalInvested,
      maturityValue,
      estimatedReturns,
      schedule,
    },
  };
}
