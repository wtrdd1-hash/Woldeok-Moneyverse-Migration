/** Public estimator only: statutory eligibility also requires a 4-week average of 15h/week. */
export function calculateRetirementEligibility(
  years: number,
  months: number,
  monthlySalary: number,
  annualBonus: number,
) {
  const safeInteger = (value: number, max: number) =>
    Number.isFinite(value) ? Math.min(max, Math.max(0, Math.trunc(value))) : 0;
  const safeMoney = (value: number) =>
    Number.isFinite(value) ? Math.min(1_000_000_000_000, Math.max(0, value)) : 0;
  const serviceMonths = safeInteger(years, 40) * 12 + safeInteger(months, 11);
  const totalYears = serviceMonths / 12;
  const taxServiceYears = Math.ceil(totalYears);
  const eligible = serviceMonths >= 12;
  const averageMonthlyWage = safeMoney(monthlySalary) + safeMoney(annualBonus) / 12;
  const estimatedSeverance = eligible ? Math.round(averageMonthlyWage * totalYears) : 0;
  return { eligible, serviceMonths, totalYears, taxServiceYears, averageMonthlyWage, estimatedSeverance };
}
