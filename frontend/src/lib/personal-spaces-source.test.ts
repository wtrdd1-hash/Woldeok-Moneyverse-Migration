import { describe, expect, it } from 'vitest';
import { parseVerifiedPersonalSpaces } from './personal-spaces-source';

const owner = '11111111-2222-4333-8444-555555555555';
const row = {
  id: '33333333-4444-4555-8666-777777777777', user_id: owner,
  space_type: 'SPACE_STUDIO', name: 'Owner Studio', privacy: 'private',
  layout: { theme: 'zen' }, created_at: '2026-10-31T00:00:00.000Z', updated_at: '2026-10-31T01:00:00.000Z',
};

describe('authenticated personal space source', () => {
  it('accepts verified owner-scoped rows without inventing balance or rent', () => {
    expect(parseVerifiedPersonalSpaces({ spaces: [row] })).toEqual([{
      id: row.id, name: 'Owner Studio', spaceType: 'SPACE_STUDIO', privacy: 'private',
      updatedAt: row.updated_at,
    }]);
  });
  it('distinguishes a verified empty source from a malformed or missing source', () => {
    expect(parseVerifiedPersonalSpaces({ spaces: [] })).toEqual([]);
    for (const bad of [null, {}, { spaces: null }, { spaces: '[]' }, { spaces: [null] }]) {
      expect(parseVerifiedPersonalSpaces(bad)).toBeNull();
    }
  });
  it('rejects duplicates, malformed IDs, impossible dates and unbounded rows', () => {
    for (const bad of [
      { spaces: [row, row] },
      { spaces: [{ ...row, id: 'local-space-1' }] },
      { spaces: [{ ...row, user_id: 'not-a-uuid' }] },
      { spaces: [{ ...row, updated_at: '2026-02-30T01:00:00Z' }] },
      { spaces: [{ ...row, name: '' }] },
      { spaces: Array.from({ length: 501 }, () => row) },
    ]) expect(parseVerifiedPersonalSpaces(bad)).toBeNull();
  });
  it('rejects fabricated monetary fields and cross-owner source mixtures', () => {
    expect(parseVerifiedPersonalSpaces({ spaces: [{ ...row, accumulatedRentYield: '120' }] })).toBeNull();
    expect(parseVerifiedPersonalSpaces({ spaces: [row, { ...row, id: '44444444-4444-4555-8666-777777777777', user_id: '99999999-9999-4999-8999-999999999999' }] })).toBeNull();
  });
});
