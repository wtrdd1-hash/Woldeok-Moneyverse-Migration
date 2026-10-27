import { describe, expect, it } from 'vitest';
import { isValidIpBlockId, parseAdminIpBlocks } from './ip-block-evidence';

export const BLOCK = {
  block_id: '00000000-0000-4000-8000-000000000101',
  network: '203.0.113.5/32',
  reason: 'Repeated abusive requests',
  blocked_by: '00000000-0000-4000-8000-000000000102',
  blocked_at: '2026-10-27T10:00:00.000Z',
  expires_at: null,
  lifted_by: null,
  lifted_at: null,
  active: true,
};

describe('admin IP block read evidence', () => {
  it('accepts the real PostgreSQL block_id response and preserves its lift identity', () => {
    const blocks = parseAdminIpBlocks({ blocks: [BLOCK] });
    expect(blocks?.[0]?.block_id).toBe(BLOCK.block_id);
    expect(blocks?.[0]?.network).toBe(BLOCK.network);
  });

  it('distinguishes a verified empty list from missing or malformed evidence', () => {
    expect(parseAdminIpBlocks({ blocks: [] })).toEqual([]);
    for (const payload of [null, undefined, {}, { blocks: null }, { blocks: {} }, { blocks: [null] }]) {
      expect(parseAdminIpBlocks(payload)).toBeNull();
    }
  });

  it('rejects invalid IDs, CIDRs, timestamps, actor identities, and contradictory lift state', () => {
    const invalid = [
      { block_id: 'undefined' }, { block_id: 123 }, { network: '999.0.0.1/32' },
      { network: '203.0.113.5/999' }, { network: 'not-an-ip' },
      { blocked_at: 'not-a-date' }, { blocked_by: 'someone' },
      { active: 'true' }, { active: true, lifted_at: '2026-10-27T10:01:00.000Z' },
      { lifted_at: '2026-10-27T10:01:00.000Z', lifted_by: null, active: false },
      { lifted_at: '2026-10-27T09:00:00.000Z', lifted_by: BLOCK.blocked_by, active: false },
      { reason: '' }, { expires_at: '2026-10-27T09:00:00.000Z' },
    ];
    for (const change of invalid) {
      expect(parseAdminIpBlocks({ blocks: [{ ...BLOCK, ...change }] })).toBeNull();
    }
  });

  it('rejects duplicate identities and unbounded lists instead of enabling ambiguous lift actions', () => {
    expect(parseAdminIpBlocks({ blocks: [BLOCK, BLOCK] })).toBeNull();
    expect(parseAdminIpBlocks({ blocks: Array.from({ length: 101 }, (_, i) => ({
      ...BLOCK, block_id: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
    })) })).toBeNull();
  });

  it('checks UUIDs before allowing a server action to consume recent authentication', () => {
    expect(isValidIpBlockId(BLOCK.block_id)).toBe(true);
    expect(isValidIpBlockId('undefined')).toBe(false);
    expect(isValidIpBlockId('')).toBe(false);
    expect(isValidIpBlockId('a'.repeat(36))).toBe(false);
  });
});
