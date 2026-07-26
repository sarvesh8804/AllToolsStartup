export type LoanInput = {
  principal: number;
  annualRatePercent: number;
  years: number;
};

export type AmortizationRow = {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
};

export type LoanResult = {
  principal: number;
  annualRatePercent: number;
  years: number;
  months: number;
  monthlyRate: number;
  emi: number;
  totalPayment: number;
  totalInterest: number;
  schedule: AmortizationRow[];
};

export function calculateLoan(
  input: LoanInput,
): { ok: true; value: LoanResult } | { ok: false; error: string } {
  const { principal, annualRatePercent, years } = input;

  if (![principal, annualRatePercent, years].every(Number.isFinite)) {
    return { ok: false, error: "Enter valid numbers." };
  }
  if (principal <= 0) {
    return { ok: false, error: "Loan amount must be greater than zero." };
  }
  if (annualRatePercent < 0) {
    return { ok: false, error: "Interest rate cannot be negative." };
  }
  if (years <= 0) {
    return { ok: false, error: "Tenure must be greater than zero." };
  }

  const months = Math.round(years * 12);
  if (months < 1) {
    return { ok: false, error: "Tenure must be at least one month." };
  }

  const monthlyRate = annualRatePercent / 100 / 12;
  let emi: number;

  if (monthlyRate === 0) {
    emi = principal / months;
  } else {
    const factor = Math.pow(1 + monthlyRate, months);
    emi = (principal * monthlyRate * factor) / (factor - 1);
  }

  const schedule: AmortizationRow[] = [];
  let balance = principal;

  for (let month = 1; month <= months; month += 1) {
    const interest = monthlyRate === 0 ? 0 : balance * monthlyRate;
    let principalPart = emi - interest;
    // Final payment adjustment for rounding
    if (month === months) {
      principalPart = balance;
      emi = principalPart + interest;
    }
    balance = Math.max(0, balance - principalPart);
    schedule.push({
      month,
      payment: principalPart + interest,
      principal: principalPart,
      interest,
      balance,
    });
  }

  const totalPayment = schedule.reduce((sum, row) => sum + row.payment, 0);
  const totalInterest = totalPayment - principal;

  // Representative EMI (steady-state before last-month tweak)
  const displayEmi =
    monthlyRate === 0
      ? principal / months
      : (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1);

  return {
    ok: true,
    value: {
      principal,
      annualRatePercent,
      years,
      months,
      monthlyRate,
      emi: displayEmi,
      totalPayment,
      totalInterest,
      schedule,
    },
  };
}
