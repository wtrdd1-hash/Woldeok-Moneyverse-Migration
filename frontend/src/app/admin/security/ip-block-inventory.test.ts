import { describe, expect, it } from 'vitest';
import { verifiedIpBlocks } from './ip-block-inventory';

const row = {
  block_id: 'af1a8e0b-5c4b-4931-9f85-8239b3481f90',
  network: '2001:db8::/32',
  reason: 'Abusive traffic',
  blocked_at: '2026-10-27T02:00:00.000Z',
  expires_at: null,
  lifted_at: null,
  active: true,
};

describe('authenticated PostgreSQL IP-block wire contract', () => {
  it('accepts a verified empty list but not a failed response', () => {
    expect(verifiedIpBlocks({ blocks: [] })).toEqual([]);
    expect(verifiedIpBlocks(null)).toBeNull();
    expect(verifiedIpBlocks({})).toBeNull();
  });
  it('accepts the backend block_id, IPv6 CIDR and nullable timestamps', () => {
    expect(verifiedIpBlocks({ blocks: [row] })).toEqual([row]);
  });
  it('rejects legacy id-only records and non-UUID block ids', () => {
    expect(verifiedIpBlocks({ blocks: [{ ...row, block_id: undefined, id: row.block_id }] })).toBeNull();
    expect(verifiedIpBlocks({ blocks: [{ ...row, block_id: 'undefined' }] })).toBeNull();
  });
  it('rejects malformed timestamps and missing authoritative active state', () => {
    expect(verifiedIpBlocks({ blocks: [{ ...row, blocked_at: 'not-a-date' }] })).toBeNull();
    expect(verifiedIpBlocks({ blocks: [{ ...row, active: 'true' }] })).toBeNull();
  });
  it('rejects duplicate identifiers and unbounded result lists', () => {
    expect(verifiedIpBlocks({ blocks: [row, row] })).toBeNull();
    expect(verifiedIpBlocks({ blocks: Array(101).fill(row) })).toBeNull();
  });
});
