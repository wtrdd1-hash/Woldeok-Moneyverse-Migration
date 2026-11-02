import { describe, expect, it } from 'vitest';
import { parseTakedownStatus } from './takedown-status';

const verified = {
  caseId: 'CASE-2026-00001', status: 'TRIAGED',
  reasonCategory: 'harassment_stalking', targetContentType: 'board_post',
  createdAt: '2026-11-02T10:00:00.000Z', actionedAt: null,
};

describe('guest takedown status source contract', () => {
  it('accepts an exact verified status without carrying credentials', () => {
    expect(parseTakedownStatus(verified)).toEqual(verified);
  });
  it.each(['SUBMITTED', 'TRIAGED', 'ACTIONED_REMOVED', 'ACTIONED_RESTRICTED', 'REJECTED', 'APPEALED'])(
    'recognizes actual backend state %s', (status) => {
      expect(parseTakedownStatus({ ...verified, status })).not.toBeNull();
    },
  );
  it('rejects malformed or synthetic status, missing evidence and invalid dates', () => {
    for (const input of [null, [], { ...verified, status: 'APPROVED' },
      { ...verified, caseId: '' }, { ...verified, createdAt: 'tomorrow' },
      { ...verified, actionedAt: '2026-13-40T00:00:00Z' },
      { ...verified, reasonCategory: 'unknown' }, { ...verified, targetContentType: null }]) {
      expect(parseTakedownStatus(input)).toBeNull();
    }
  });
});
