import { describe, expect, it } from 'vitest';
import { parseStatusRows } from './status-response';

const fresh = {
  sourceKey: 'backend_api',
  displayName: 'Backend API',
  state: 'operational',
  detail: 'HTTP 200',
  observedAt: '2026-10-31T04:45:00.000Z',
  freshnessState: 'fresh',
  ageMs: 10_000,
  policyVersion: 'status-v1',
};

const response = (status: unknown) => ({ status });

describe('public status API response validation', () => {
  it('accepts a verified empty board without inventing healthy observations', () => {
    expect(parseStatusRows(response([]))).toEqual([]);
  });

  it('preserves verified backend observations and server-owned freshness', () => {
    const stale = {
      ...fresh, sourceKey: 'worker_job', state: 'unknown',
      freshnessState: 'stale', ageMs: 120_000,
    };
    expect(parseStatusRows(response([fresh, stale]))).toEqual([fresh, stale]);
  });

  it.each([null, {}, { status: null }, { status: {} }, { status: 'operational' }])(
    'rejects a malformed envelope rather than rendering an empty board: %j', (input) => {
      expect(parseStatusRows(input)).toBeNull();
    },
  );

  it('rejects an entire mixed response when any row is malformed', () => {
    expect(parseStatusRows(response([fresh, null]))).toBeNull();
    expect(parseStatusRows(response([fresh, { ...fresh, displayName: '' }]))).toBeNull();
    expect(parseStatusRows(response([fresh, { ...fresh, state: 'all-good' }]))).toBeNull();
    expect(parseStatusRows(response([fresh, { ...fresh, freshnessState: 'new' }]))).toBeNull();
  });

  it('rejects duplicate source keys and excessive observations', () => {
    expect(parseStatusRows(response([fresh, fresh]))).toBeNull();
    expect(parseStatusRows(response(Array.from({ length: 201 }, (_, index) => ({
      ...fresh, sourceKey: `source_${index}`,
    }))))).toBeNull();
  });

  it('rejects an unsupported freshness policy or contradictory freshness', () => {
    expect(parseStatusRows(response([{ ...fresh, policyVersion: 'status-v2' }]))).toBeNull();
    expect(parseStatusRows(response([{ ...fresh, state: 'operational', freshnessState: 'stale' }]))).toBeNull();
    expect(parseStatusRows(response([{ ...fresh, observedAt: null }]))).toBeNull();
    expect(parseStatusRows(response([{ ...fresh, state: 'unknown' }]))).toBeNull();
  });

  it('rejects invalid timestamps, ages, and unexpected HTML-like source keys', () => {
    expect(parseStatusRows(response([{ ...fresh, observedAt: 'not-a-date' }]))).toBeNull();
    expect(parseStatusRows(response([{ ...fresh, ageMs: -1 }]))).toBeNull();
    expect(parseStatusRows(response([{ ...fresh, ageMs: Number.POSITIVE_INFINITY }]))).toBeNull();
    expect(parseStatusRows(response([{ ...fresh, sourceKey: '<script>' }]))).toBeNull();
  });

  it('accepts the backend unknown observation contract without a timestamp', () => {
    expect(parseStatusRows(response([{
      ...fresh, state: 'unknown', freshnessState: 'unknown',
      observedAt: null, ageMs: null,
    }]))).toHaveLength(1);
  });
});
