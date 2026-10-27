import { describe, expect, it } from 'vitest';
import { parseSeoTelemetry, parseSeoAuditSnapshot, parseIndexNowReceipt } from './admin-seo-audit-evidence';

const telemetry = { totalHits24h: 12, totalHits7d: 30, avgDurationMs: 87, botDistribution: { Googlebot: 7 } };
const snapshot = { timestamp: new Date().toISOString(), candidateUrlCount: 2, telemetry,
  telemetryStatus: 'observed', indexingStatus: 'not_measured', schemaValidationStatus: 'not_measured' };

describe('admin SEO audit evidence', () => {
  it('accepts bounded crawler measurements without private source fields', () => {
    expect(parseSeoTelemetry({ ...telemetry, privateLog: 'should not leak' })).toEqual(telemetry);
    expect(parseSeoAuditSnapshot(snapshot)?.telemetry?.totalHits24h).toBe(12);
  });
  it('rejects missing, coerced, nonfinite and contradictory totals', () => {
    for (const value of [
      { ...telemetry, totalHits24h: '12' },
      { ...telemetry, totalHits24h: -1 },
      { ...telemetry, totalHits7d: 3 },
      { ...telemetry, avgDurationMs: Number.POSITIVE_INFINITY },
      { ...telemetry, botDistribution: { Googlebot: 15 } },
      { ...telemetry, botDistribution: ['Googlebot'] },
      { ...telemetry, botDistribution: { 'user@email.invalid': 1 } },
    ]) expect(parseSeoTelemetry(value)).toBeNull();
  });
  it('rejects a forged observed state or invalid audit timestamps', () => {
    expect(parseSeoAuditSnapshot({ ...snapshot, telemetry: null })).toBeNull();
    expect(parseSeoAuditSnapshot({ ...snapshot, timestamp: 'invalid' })).toBeNull();
    expect(parseSeoAuditSnapshot({ ...snapshot, timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString() })).toBeNull();
    expect(parseSeoAuditSnapshot({ ...snapshot, timestamp: new Date(Date.now() + 60 * 60 * 1000).toISOString() })).toBeNull();
    expect(parseSeoAuditSnapshot({ ...snapshot, candidateUrlCount: -1 })).toBeNull();
    expect(parseSeoAuditSnapshot({ ...snapshot, indexingStatus: 'indexed' })).toBeNull();
    expect(parseSeoAuditSnapshot({ ...snapshot, telemetry: null, telemetryStatus: 'unavailable' })?.telemetry).toBeNull();
  });
  it('requires verified accepted IndexNow receipts, not a success boolean alone', () => {
    expect(parseIndexNowReceipt({ ok: true, status: 202, submittedCount: 2, indexingConfirmed: false })).toEqual({ ok: true, status: 202, submittedCount: 2, indexingConfirmed: false });
    for (const value of [
      { ok: true },
      { ok: true, status: 500, submittedCount: 2, indexingConfirmed: false },
      { ok: true, status: 202, submittedCount: '2', indexingConfirmed: false },
      { ok: true, status: 202, submittedCount: 0, indexingConfirmed: false },
      { ok: true, status: 202, submittedCount: 2, indexingConfirmed: true },
    ]) expect(parseIndexNowReceipt(value)).toBeNull();
  });
});
