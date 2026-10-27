import type { KdicOverviewData } from './kdic-control-tower';

const identifier = /^[A-Z][A-Z0-9_]{1,63}$/;
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function object(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown> : null;
}
function text(value: unknown, max = 255): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= max;
}
function money(value: unknown): value is number {
  // The existing backend casts BIGINT to float; reject values it cannot represent exactly.
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}
function rate(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 10000;
}
function date(value: unknown): value is string {
  return text(value, 40) && /^\d{4}-\d\d-\d\dT/.test(value) && Number.isFinite(Date.parse(value));
}
function unique<T>(items: T[], getId: (item: T) => string): boolean {
  return new Set(items.map(getId)).size === items.length;
}

/** An unverified or imprecise observation must never be rendered as a real financial balance. */
export function parseKdicOverview(raw: unknown): KdicOverviewData | null {
  const envelope = object(raw);
  if (!envelope || envelope.success !== true) return null;
  const data = object(envelope.data);
  const fund = object(data?.fund);
  const summary = object(data?.summary);
  if (!data || !fund || !summary || !Array.isArray(data.institutions) ||
    !Array.isArray(data.recentPremiums) || !Array.isArray(data.recentPayouts) ||
    data.institutions.length > 200 || data.recentPremiums.length > 10 || data.recentPayouts.length > 10 ||
    !text(fund.id, 64) || !identifier.test(fund.id) || !text(fund.fundName, 100) ||
    !money(fund.totalFundWld) || !money(fund.protectionLimitPerUser) ||
    !money(fund.totalInsuredDepositsWld) || !money(fund.cumulativePremiumsCollectedWld) ||
    !money(fund.cumulativePayoutsWld) || typeof fund.isEmergencyMode !== 'boolean' || !date(fund.updatedAt) ||
    !money(summary.totalInsuredInstitutions) || !money(summary.totalDepositsWld) ||
    !rate(summary.averageBisRatioPct) || !rate(summary.reserveCoverageRatioPct)) return null;

  const institutions = data.institutions.map(object);
  if (institutions.some((i) => !i || !text(i.id, 64) || !identifier.test(i.id) ||
    !text(i.institutionName, 100) || !text(i.institutionType, 32) ||
    !rate(i.bisRatioPct) || !text(i.soundnessGrade, 32) || !money(i.totalDepositsWld) ||
    !rate(i.premiumRatePct) || !text(i.status, 32) || !date(i.updatedAt))) return null;
  const typedInstitutions = institutions as Record<string, unknown>[];
  if (!unique(typedInstitutions, (i) => i.id as string) ||
    summary.totalInsuredInstitutions !== institutions.length ||
    summary.totalDepositsWld !== institutions.reduce((n, i) => n + (i!.totalDepositsWld as number), 0) ||
    !Number.isSafeInteger(summary.totalDepositsWld)) return null;
  // Reject the backend's fallback 14%/40% when there is no observed denominator.
  if (institutions.length === 0 || summary.totalDepositsWld === 0) return null;
  const expectedAverage = Math.round(institutions.reduce((n, i) => n + (i!.bisRatioPct as number), 0) / institutions.length * 10) / 10;
  const expectedCoverage = Math.round((fund.totalFundWld / summary.totalDepositsWld) * 1000) / 10;
  if (Math.abs(summary.averageBisRatioPct - expectedAverage) > 0.00001 ||
    Math.abs(summary.reserveCoverageRatioPct - expectedCoverage) > 0.00001) return null;

  const premiums = data.recentPremiums.map(object);
  if (premiums.some((p) => !p || !text(p.id, 36) || !uuid.test(p.id) ||
    !text(p.institutionId, 64) || !identifier.test(p.institutionId) ||
    !text(p.institutionName, 100) || !text(p.quarter, 32) ||
    !money(p.assessedDepositBase) || !money(p.premiumAmountWld) ||
    !text(p.status, 32) || !date(p.createdAt))) return null;
  const payouts = data.recentPayouts.map(object);
  if (payouts.some((p) => !p || !text(p.id, 36) || !uuid.test(p.id) ||
    !text(p.institutionId, 64) || !identifier.test(p.institutionId) ||
    !text(p.institutionName, 100) || !text(p.userId, 36) || !uuid.test(p.userId) ||
    (p.displayName !== undefined && !text(p.displayName, 100)) ||
    !money(p.originalDepositWld) || !money(p.payoutAmountWld) ||
    !text(p.status, 32) || !text(p.reason, 255) || !date(p.createdAt))) return null;
  if (!unique(premiums as Record<string, unknown>[], (p) => p.id as string) ||
    !unique(payouts as Record<string, unknown>[], (p) => p.id as string)) return null;
  return data as unknown as KdicOverviewData;
}
