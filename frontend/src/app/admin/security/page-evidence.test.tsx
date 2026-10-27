import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiRead = vi.hoisted(() => vi.fn());
const gate = vi.hoisted(() => vi.fn(async () => undefined));
vi.mock('@/lib/api', () => ({ apiOrNull: apiRead }));
vi.mock('@/lib/session', () => ({ requireAdminConsole: gate }));
vi.mock('../security-abuse-forms', () => ({
  IpBlockDialog: () => <button type="button">IP/CIDR 차단</button>,
  LiftIpBlockDialog: ({ blockId }: { blockId: string }) =>
    <button type="button" data-block-id={blockId}>차단 해제</button>,
}));

import AdminSecurityPage from './page';
const BLOCK = {
  block_id: '00000000-0000-4000-8000-000000000101', network: '203.0.113.5/32',
  reason: 'Repeated abusive requests', blocked_by: '00000000-0000-4000-8000-000000000102',
  blocked_at: '2026-10-27T10:00:00.000Z', expires_at: null, lifted_by: null, lifted_at: null, active: true,
};

beforeEach(() => { apiRead.mockReset(); gate.mockClear(); });

describe('admin security IP block console', () => {
  it('passes the real PostgreSQL block_id to the lift action, with admin authorization', async () => {
    apiRead.mockResolvedValue({ blocks: [BLOCK] });
    const html = renderToStaticMarkup(await AdminSecurityPage());
    expect(gate).toHaveBeenCalledWith('/admin/security');
    expect(html).toContain(`data-block-id="${BLOCK.block_id}"`);
    expect(html).toContain('203.0.113.5/32');
    expect(html).not.toContain('차단 기록이 없습니다.');
  });

  it('does not present a failed API read as zero blocks or enable blind mutations', async () => {
    apiRead.mockResolvedValue(null);
    const html = renderToStaticMarkup(await AdminSecurityPage());
    expect(html).toContain('차단 기록을 확인할 수 없습니다.');
    expect(html).not.toContain('차단 기록이 없습니다.');
    expect(html).not.toContain('data-block-id');
    expect(html).not.toContain('<button');
  });

  it('distinguishes a real empty list from a malformed response', async () => {
    apiRead.mockResolvedValue({ blocks: [] });
    expect(renderToStaticMarkup(await AdminSecurityPage())).toContain('차단 기록이 없습니다.');
    apiRead.mockResolvedValue({ blocks: [{ ...BLOCK, block_id: 'undefined' }] });
    const invalid = renderToStaticMarkup(await AdminSecurityPage());
    expect(invalid).toContain('차단 기록을 확인할 수 없습니다.');
    expect(invalid).not.toContain('data-block-id');
  });
});
