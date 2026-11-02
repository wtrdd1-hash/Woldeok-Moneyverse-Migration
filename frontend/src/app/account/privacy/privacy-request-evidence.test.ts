import { describe, expect, it } from 'vitest';
import { parseOwnerPrivacyRequests } from './privacy-request-evidence';

const row = {
  requestId: '1b6c0a5f-c623-4c0e-b9f2-3e897dcbe8fd',
  requestType: 'access', detail: null, status: 'received',
  createdAt: '2026-10-29T03:00:00.000Z',
};

describe('owner privacy request evidence', () => {
  it('accepts verified empty and bounded owner list', () => {
    expect(parseOwnerPrivacyRequests({ requests: [] })).toEqual([]);
    expect(parseOwnerPrivacyRequests({ requests: [row] })).toEqual([row]);
    expect(parseOwnerPrivacyRequests({ requests: [{ ...row, requestType: 'deletion' }] }, 'deletion')).toHaveLength(1);
  });
  it.each([null, {}, { requests: null }, { requests: 'not a list' },
    { requests: Array.from({ length: 31 }, (_, i) => ({ ...row, requestId: `${i}` })) },
    { requests: [row, row] }, { requests: [{ ...row, requestId: 'not-uuid' }] },
    { requests: [{ ...row, requestType: 'unknown' }] }, { requests: [{ ...row, status: 'completed' }] },
    { requests: [{ ...row, createdAt: 'not-a-date' }] },
    { requests: [{ ...row, detail: '<script>' }] },
    { requests: [{ ...row, detail: 'a'.repeat(1001) }] },
    { requests: [{ ...row, detail: 3 }] },
    { requests: [{ ...row, detail: 'ok', secret: 'unexpected' }] },
  ])('rejects unverified owner list %j', (value) => {
    expect(parseOwnerPrivacyRequests(value)).toBeNull();
  });
  it('rejects a mismatched filter instead of showing another request category', () => {
    expect(parseOwnerPrivacyRequests({ requests: [row] }, 'deletion')).toBeNull();
  });
  it('rejects future or unsorted evidence', () => {
    expect(parseOwnerPrivacyRequests({ requests: [{ ...row, createdAt: '2999-01-01T00:00:00.000Z' }] })).toBeNull();
    expect(parseOwnerPrivacyRequests({ requests: [row, { ...row, requestId: '2b6c0a5f-c623-4c0e-b9f2-3e897dcbe8fd', createdAt: '2026-10-30T03:00:00.000Z' }] })).toBeNull();
  });
});
