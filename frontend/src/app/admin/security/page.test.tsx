import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const { readBlocks, gate } = vi.hoisted(() => ({ readBlocks: vi.fn(), gate: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiOrNull: readBlocks }));
vi.mock('@/lib/session', () => ({ requireAdminConsole: gate }));
vi.mock('../security-abuse-forms', () => ({
  IpBlockDialog: () => <button>IP/CIDR 차단</button>,
  LiftIpBlockDialog: ({ blockId }: { blockId: string }) => (
    <button data-block-id={blockId}>차단 해제</button>
  ),
}));
import Page, { metadata } from './page';

const realBlock = {
  block_id: 'af1a8e0b-5c4b-4931-9f85-8239b3481f90',
  network: '192.0.2.4/32',
  reason: 'Repeated credential abuse',
  blocked_at: '2026-10-27T02:00:00.000Z',
  expires_at: null,
  lifted_at: null,
  active: true,
};

async function html() { return renderToStaticMarkup(await Page()); }

describe('administrator IP-block inventory', () => {
  beforeEach(() => { readBlocks.mockReset(); gate.mockReset(); });

  it('uses the actual PostgreSQL block_id in unblock controls, never an invented id', async () => {
    readBlocks.mockResolvedValue({ blocks: [realBlock] });
    const output = await html();
    expect(gate).toHaveBeenCalledWith('/admin/security');
    expect(readBlocks).toHaveBeenCalledWith('/api/v1/admin/security/ip-blocks');
    expect(output).toContain(`data-block-id="${realBlock.block_id}"`);
    expect(output).toContain('192.0.2.4/32');
    expect(output).not.toContain('차단 기록이 없습니다.');
  });

  it('distinguishes an unavailable backend from a verified empty list and offers retry', async () => {
    readBlocks.mockResolvedValue(null);
    const output = await html();
    expect(output).toContain('차단 기록을 확인할 수 없습니다.');
    expect(output).toContain('다시 조회');
    expect(output).toContain('action="/admin/security"');
    expect(output).toContain('method="get"');
    expect(output).not.toContain('차단 기록이 없습니다.');
    expect(output).not.toContain('IP/CIDR 차단</button>');
  });

  it('rejects malformed and legacy id-only response instead of showing a false empty state', async () => {
    readBlocks.mockResolvedValue({ blocks: [{ ...realBlock, block_id: undefined, id: realBlock.block_id }] });
    const output = await html();
    expect(output).toContain('차단 기록을 확인할 수 없습니다.');
    expect(output).not.toContain('차단 해제</button>');
  });

  it('renders a verified empty response distinctly and keeps the authorized block action', async () => {
    readBlocks.mockResolvedValue({ blocks: [] });
    const output = await html();
    expect(output).toContain('차단 기록이 없습니다.');
    expect(output).toContain('IP/CIDR 차단</button>');
  });

  it('keeps the security console noindex and the outage alert accessible', async () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
    readBlocks.mockResolvedValue({ blocks: 'not-an-array' });
    const output = await html();
    expect(output).toContain('role="alert"');
    expect(output).toContain('min-h-11');
  });
});
