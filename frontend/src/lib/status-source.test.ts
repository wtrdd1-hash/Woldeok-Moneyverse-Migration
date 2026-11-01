import { describe, expect, it } from 'vitest';
import { parseSourceStatusRows, validStatusSourceKey } from './status-source';
const row = { sourceKey: 'backend_api', displayName: 'Backend', state: 'unknown', detail: null,
  observedAt: null, freshnessState: 'unknown', ageMs: null, policyVersion: 'status-v1' };
describe('verified status source drill-down', () => {
  it('validates exact source keys', () => {
    expect(validStatusSourceKey('backend_api')).toBe(true);
    expect(validStatusSourceKey('frontend-web')).toBe(true);
    for (const key of ['A', '../secret', '%', 'x'.repeat(65), ' Backend', '']) expect(validStatusSourceKey(key)).toBe(false);
  });
  it('accepts explicit verified empty and exact matching source rows', () => {
    expect(parseSourceStatusRows({ sourceKey: 'backend_api', status: [] }, 'backend_api')).toEqual([]);
    expect(parseSourceStatusRows({ sourceKey: 'backend_api', status: [row] }, 'backend_api')).toHaveLength(1);
  });
  it('rejects legacy ignored filter, wrong source and duplicates', () => {
    expect(parseSourceStatusRows({ status: [] }, 'backend_api')).toBeNull();
    expect(parseSourceStatusRows({ sourceKey: 'frontend_web', status: [] }, 'backend_api')).toBeNull();
    expect(parseSourceStatusRows({ sourceKey: 'backend_api', status: [{ ...row, sourceKey: 'frontend_web' }] }, 'backend_api')).toBeNull();
    expect(parseSourceStatusRows({ sourceKey: 'backend_api', status: [row, row] }, 'backend_api')).toBeNull();
  });
});
