import { describe, expect, it } from 'vitest';
import { parsePrivacyRequestHistory } from './privacy-request-evidence';

const request = {
  requestId: '6e9b0c6d-24f7-4387-99b9-1e731d9d2e0c',
  requestType: 'access', status: 'received', detail: null,
  createdAt: '2026-10-30T08:00:00.000Z',
};

describe('owner privacy request history evidence', () => {
  it('accepts a verified empty response and a bounded canonical owner receipt', () => {
    expect(parsePrivacyRequestHistory({ requests: [] }, null)).toEqual([]);
    expect(parsePrivacyRequestHistory({ requests: [{ ...request, internalToken: 'must-not-leak' }] }, null))
      .toEqual([request]);
  });

  it('refuses unavailable, malformed and duplicate source records instead of claiming an empty list', () => {
    for (const value of [null, {}, { requests: null }, { requests: 'none' },
      { requests: [request, request] }, { requests: Array(31).fill(request) },
      { requests: [{ ...request, requestId: 'invalid' }] },
      { requests: [{ ...request, status: 'completed' }] },
      { requests: [{ ...request, createdAt: '2026-02-30T00:00:00.000Z' }] },
      { requests: [{ ...request, detail: '<script>' }] },
      { requests: [{ ...request, detail: 0 }] },
      { requests: [{ ...request, requestType: 'unknown' }] }]) {
      expect(parsePrivacyRequestHistory(value, null)).toBeNull();
    }
  });

  it('rejects a filtered result that does not match the selected owner request type', () => {
    expect(parsePrivacyRequestHistory({ requests: [request] }, 'deletion')).toBeNull();
    expect(parsePrivacyRequestHistory({ requests: [request] }, 'access')).toEqual([request]);
  });

  it('rejects out-of-order history and invalid canonical detail', () => {
    const older = { ...request, requestId: 'fc1a72b9-781f-4c1d-8d5b-2f909ff249d0', createdAt: '2026-10-29T08:00:00.000Z' };
    expect(parsePrivacyRequestHistory({ requests: [older, request] }, null)).toBeNull();
    expect(parsePrivacyRequestHistory({ requests: [{ ...request, detail: '  not canonical ' }] }, null)).toBeNull();
    expect(parsePrivacyRequestHistory({ requests: [{ ...request, detail: 'x'.repeat(1001) }] }, null)).toBeNull();
  });
});
