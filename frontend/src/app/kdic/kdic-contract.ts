/** Public, read-only virtual-fund snapshot. Never treat this as a legal deposit guarantee. */
export interface KdicPortalData {
  readonly fund: {
    readonly fundName: string;
    readonly totalFundWld: number;
    readonly protectionLimitPerUser: number;
    readonly totalInsuredDepositsWld: number;
    readonly isEmergencyMode: boolean;
    readonly updatedAt: string;
  };
  readonly institutions: readonly {
    readonly id: string;
    readonly institutionName: string;
    readonly institutionType: string;
    readonly bisRatioPct: number;
    readonly soundnessGrade: string;
    readonly totalDepositsWld: number;
    readonly premiumRatePct: number;
    readonly status: string;
  }[];
  readonly summary: {
    readonly totalInsuredInstitutions: number;
    readonly totalDepositsWld: number;
    readonly averageBisRatioPct: number;
    readonly reserveCoverageRatioPct: number;
  };
}

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= 256;
const wld = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
const ratio = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100000;

/** Fail closed on upstream shape drift, NaN, overflow, missing or fictional values. */
export function parseKdicPortal(input: unknown): KdicPortalData | null {
  if (!record(input) || input.success !== true || !record(input.data)) return null;
  const { fund, institutions, summary } = input.data;
  if (!record(fund) || !Array.isArray(institutions) || !record(summary)) return null;
  if (!text(fund.fundName) || !wld(fund.totalFundWld) ||
    !wld(fund.protectionLimitPerUser) || !wld(fund.totalInsuredDepositsWld) ||
    typeof fund.isEmergencyMode !== 'boolean' || !text(fund.updatedAt) ||
    !Number.isFinite(Date.parse(fund.updatedAt))) return null;
  if (!wld(summary.totalInsuredInstitutions) ||
    summary.totalInsuredInstitutions !== institutions.length ||
    !wld(summary.totalDepositsWld) || !ratio(summary.averageBisRatioPct) ||
    !ratio(summary.reserveCoverageRatioPct)) return null;
  for (const item of institutions) {
    if (!record(item) || !text(item.id) || !text(item.institutionName) ||
      !text(item.institutionType) || !ratio(item.bisRatioPct) ||
      !text(item.soundnessGrade) || !wld(item.totalDepositsWld) ||
      !ratio(item.premiumRatePct) || !text(item.status)) return null;
  }
  return input.data as unknown as KdicPortalData;
}
