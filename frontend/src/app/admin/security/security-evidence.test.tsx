import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { read, gate } = vi.hoisted(() => ({ read: vi.fn(), gate: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiOrNull: read }));
vi.mock('@/lib/session', () => ({ requireAdminConsole: gate }));
vi.mock('../security-abuse-forms', () => ({
  IpBlockDialog: () => <button>IP/CIDR 차단</button>,
  LiftIpBlockDialog: ({ blockId }: { blockId: string }) => <button data-block-id={blockId}>차단 해제</button>,
}));

import Page from './page';
import { parseAdminIpBlocks } from './security-evidence';

const block = {
  block_id: 'a0f7d3c2-11e2-4d90-bb33-1a5b2e6e24cc',
  network: '203.0.113.5/32',
  reason: 'Abusive requests',
  blocked_by: 'fbb4b8e2-6b1f-4e35-ae8e-339fdb1355f1',
  blocked_at: '2026-10-26T02:00:00.000Z',
  expires_at: null,
  lifted_by: null,
  lifted_at: null,
  active: true,
};

beforeEach(() => vi.clearAllMocks());

describe('admin IP block evidence boundary', () => {
  it('accepts actual backend block_id contract, not an invented id property', () => {
    expect(parseAdminIpBlocks({ blocks: [block] })?.[0]?.block_id).toBe(block.block_id);
  });
  it('distinguishes verified empty from unavailable or malformed responses', () => {
    expect(parseAdminIpBlocks({ blocks: [] })).toEqual([]);
    expect(parseAdminIpBlocks(null)).toBeNull();
    expect(parseAdminIpBlocks({ blocks: 'none' })).toBeNull();
    expect(parseAdminIpBlocks({ blocks: [{ ...block, block_id: 'not-uuid' }] })).toBeNull();
    expect(parseAdminIpBlocks({ blocks: [block, block] })).toBeNull();
    expect(parseAdminIpBlocks({ blocks: [{ ...block, active: 'true' }] })).toBeNull();
    expect(parseAdminIpBlocks({ blocks: [{ ...block, network: '999.999.999.999/99' }] })).toBeNull();
    expect(parseAdminIpBlocks({ blocks: [{ ...block, lifted_at: '2026-10-27T02:00:00Z' }] })).toBeNull();
    expect(parseAdminIpBlocks({ blocks: [{ ...block, blocked_at: 'not-a-date' }] })).toBeNull();
    expect(parseAdminIpBlocks({ blocks: [{ ...block, network: '2001:db8::/64' }] })?.length).toBe(1);
  });
  it('shows an error rather than no blocks or unsafe controls on failed read', async () => {
    read.mockResolvedValue(null);
    const html = renderToStaticMarkup(await Page());
    expect(gate).toHaveBeenCalledWith('/admin/security');
    expect(html).toContain('role="alert"');
    expect(html).not.toContain('차단 기록이 없습니다');
    expect(html).not.toContain('IP/CIDR 차단</button>');
    expect(html).not.toContain('차단 해제</button>');
  });
  it('hides privileged actions when a 200 response contains malformed records', async () => {
    read.mockResolvedValue({ blocks: [{ ...block, block_id: 'broken' }] });
    const html = renderToStaticMarkup(await Page());
    expect(html).toContain('role="alert"');
    expect(html).not.toContain('IP/CIDR 차단</button>');
  });
  it('renders verified empty state and permits new block only after a valid read', async () => {
    read.mockResolvedValue({ blocks: [] });
    const html = renderToStaticMarkup(await Page());
    expect(html).toContain('차단 기록이 없습니다');
    expect(html).toContain('IP/CIDR 차단</button>');
  });
  it('passes the real database UUID into the lift action', async () => {
    read.mockResolvedValue({ blocks: [block] });
    const html = renderToStaticMarkup(await Page());
    expect(html).toContain(`data-block-id="${block.block_id}"`);
    expect(html).toContain('203.0.113.5/32');
  });
});
