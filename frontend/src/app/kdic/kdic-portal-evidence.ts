/** Source-truth parser: neither unavailable data nor numeric zero may become a fake insured fund. */
export interface VerifiedKdicPortalData {
  fund: {
    fundName: string;
    totalFundWld: number;
    protectionLimitPerUser: number;
    totalInsuredDepositsWld: number;
    isEmergencyMode: boolean;
    updatedAt: string;
  };
  institutions: Array<{
    id: string;
    institutionName: string;
    institutionType: string;
    bisRatioPct: number;
    soundnessGrade: string;
    totalDepositsWld: number;
    premiumRatePct: number;
    status: string;
  }>;
  summary: {
    totalInsuredInstitutions: number;
    totalDepositsWld: number;
    averageBisRatioPct: number;
    reserveCoverageRatioPct: number;
  };
}

type Row = Record<string, unknown>;
const object = (v: unknown): v is Row => !!v && typeof v === 'object' && !Array.isArray(v);
const text = (v: unknown): v is string => typeof v === 'string' && v.length > 0 && v.length < 200;
const money = (v: unknown): v is number => typeof v === 'number' && Number.isSafeInteger(v) && v >= 0;
const percentage = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 100;

export function parseKdicPortalResponse(raw: unknown): VerifiedKdicPortalData | null {
  if (!object(raw) || raw.success !== true || !object(raw.data)) return null;
  const data = raw.data;
  if (!object(data.fund) || !object(data.summary) || !Array.isArray(data.institutions)) return null;
  const fund = data.fund, summary = data.summary;
  if (!text(fund.fundName) || !money(fund.totalFundWld)
    || !money(fund.protectionLimitPerUser) || !money(fund.totalInsuredDepositsWld)
    || typeof fund.isEmergencyMode !== 'boolean' || !text(fund.updatedAt)
    || !Number.isFinite(Date.parse(fund.updatedAt))) return null;
  if (!money(summary.totalInsuredInstitutions) || !money(summary.totalDepositsWld)
    || !percentage(summary.averageBisRatioPct) || !percentage(summary.reserveCoverageRatioPct)) return null;
  if (summary.totalInsuredInstitutions !== data.institutions.length) return null;
  let institutionsSum = 0;
  for (const entry of data.institutions) {
    if (!object(entry) || !text(entry.id) || !text(entry.institutionName)
      || !text(entry.institutionType) || !percentage(entry.bisRatioPct)
      || !text(entry.soundnessGrade) || !money(entry.totalDepositsWld)
      || !percentage(entry.premiumRatePct) || !text(entry.status)) return null;
    institutionsSum += entry.totalDepositsWld;
    if (!Number.isSafeInteger(institutionsSum)) return null;
  }
  if (institutionsSum !== summary.totalDepositsWld) return null;
  return data as unknown as VerifiedKdicPortalData;
}

/** Pure illustration, never evidence of a payable or insured balance. */
export function calculateKdicIllustration(principal: number, interest: number, policyLimit: number) {
  if (![principal, interest, policyLimit].every(money) || !Number.isSafeInteger(principal + interest)) return null;
  const totalDeposit = principal + interest;
  const protectedAmount = Math.min(totalDeposit, policyLimit);
  const unprotectedAmount = totalDeposit - protectedAmount;
  return { totalDeposit, protectedAmount, unprotectedAmount,
    isFullyProtected: unprotectedAmount === 0,
    illustratedCoveragePct: totalDeposit > 0 ? protectedAmount / totalDeposit * 100 : 0 };
}
