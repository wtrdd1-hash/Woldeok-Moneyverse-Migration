import type { FxStatusData } from './fx-control-tower';

type RecordValue = Record<string, unknown>;

const record = (value: unknown): value is RecordValue =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const text = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0 && value.length <= 500;
const uuid = (value: unknown): value is string =>
  typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
const date = (value: unknown): value is string =>
  typeof value === 'string' && value.length <= 40 && Number.isFinite(Date.parse(value));
const amount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0 && Number.isSafeInteger(Math.trunc(value));
const positive = (value: unknown): value is number => amount(value) && value > 0;
const signed = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && Math.abs(value) <= Number.MAX_SAFE_INTEGER;
const optionalText = (value: unknown): boolean => value === undefined || value === null || text(value);
const optionalNumber = (value: unknown): boolean => value === null || signed(value);
const code = (value: unknown): value is string =>
  typeof value === 'string' && /^[A-Z0-9_]{1,64}$/.test(value);
const list = (value: unknown, limit: number, validId: (value: unknown) => boolean,
  valid: (entry: RecordValue) => boolean): boolean => {
  if (!Array.isArray(value) || value.length > limit) return false;
  const ids = new Set<string>();
  for (const item of value) {
    if (!record(item) || !validId(item.id) || ids.has(item.id as string) || !valid(item)) return false;
    ids.add(item.id as string);
  }
  return true;
};

/** Never turn a missing or malformed FX read into healthy-market or zero-balance telemetry. */
export function parseFxStatusResponse(value: unknown, nowMs: number = Date.now()): FxStatusData | null {
  if (!record(value) || value.success !== true || !record(value.data)) return null;
  const data = value.data;
  const r = data.reserves;
  const e = data.ews;
  if (!record(r) || !uuid(r.id) || !text(r.reserveName) || r.currency !== 'USD' ||
    !amount(r.totalReservesUsd) || !positive(r.targetAnchorRate) || !positive(r.currentRate) ||
    typeof r.isHalted !== 'boolean' || !Number.isSafeInteger(r.totalInterventionsCount) ||
    (r.totalInterventionsCount as number) < 0 || !amount(r.totalIntervenedUsd) || !date(r.updatedAt) ||
    Date.parse(r.updatedAt) > nowMs + 5 * 60_000 ||
    nowMs - Date.parse(r.updatedAt) > 24 * 60 * 60_000) return null;
  if (!record(e) || !amount(e.fsiScore) || e.fsiScore > 100 ||
    !['NORMAL', 'WATCH', 'CAUTION', 'EMERGENCY'].includes(String(e.stage)) ||
    !text(e.triggerReason) || !positive(e.currentSpotRate)) return null;
  if (!list(data.history, 100, uuid, (v) => positive(v.rate) && signed(v.changePct) &&
    amount(v.volumeUsd) && text(v.interventionType) && optionalText(v.note) && date(v.createdAt))) return null;
  if (!list(data.txs, 100, uuid, (v) => uuid(v.userId) && optionalText(v.displayName) &&
    ['BUY_USD', 'SELL_USD'].includes(String(v.transactionType)) && text(v.fromCurrency) &&
    text(v.toCurrency) && positive(v.fromAmount) && positive(v.toAmount) &&
    positive(v.appliedRate) && amount(v.feeWld) && date(v.createdAt))) return null;
  if (!list(data.sdrAllocations, 100, code, (v) => text(v.assetName) && text(v.assetType) &&
    amount(v.allocationWeightPct) && v.allocationWeightPct <= 100 && amount(v.holdingAmount) &&
    text(v.unit) && amount(v.usdValue) && date(v.updatedAt))) return null;
  if (!list(data.swapAgreements, 100, code, (v) => text(v.counterparty) && amount(v.totalFacilityUsd) &&
    amount(v.drawnAmountUsd) && amount(v.availableFacilityUsd) &&
    (v.drawnAmountUsd as number) <= (v.totalFacilityUsd as number) &&
    Math.abs((v.availableFacilityUsd as number) + (v.drawnAmountUsd as number) - (v.totalFacilityUsd as number)) < 0.01 &&
    text(v.status) && signed(v.interestRatePct) && date(v.effectiveDate) &&
    date(v.expiryDate) && date(v.updatedAt))) return null;
  if (!list(data.forwardContracts, 100, uuid, (v) => uuid(v.userId) && optionalText(v.displayName) &&
    ['BUY_USD', 'SELL_USD'].includes(String(v.position)) &&
    ['1M', '3M', '6M'].includes(String(v.tenor)) && positive(v.contractAmountUsd) &&
    positive(v.contractRate) && positive(v.spotRateAtContract) && amount(v.marginWld) &&
    date(v.maturityDate) && optionalNumber(v.settlementRate) && optionalNumber(v.realizedPnlWld) &&
    ['ACTIVE', 'SETTLED', 'CANCELLED'].includes(String(v.status)) && date(v.createdAt) &&
    (v.settledAt === null || date(v.settledAt)))) return null;
  return data as unknown as FxStatusData;
}
