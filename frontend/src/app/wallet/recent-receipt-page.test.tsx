import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiMock, requireMemberMock } = vi.hoisted(() => ({ apiMock: vi.fn(), requireMemberMock: vi.fn() }));
vi.mock('@/lib/api', () => ({
  api: apiMock,
  ApiError: class ApiError extends Error { constructor(public status: number) { super('API unavailable'); } },
}));
vi.mock('@/lib/session', () => ({ requireMember: requireMemberMock }));

import Page, { metadata, dynamic } from './activity/[id]/page';

const TX = '33333333-3333-4333-8333-333333333333';
const BIG = '900719925474099312345678901234567890';

beforeEach(() => { apiMock.mockReset(); requireMemberMock.mockReset().mockResolvedValue(undefined); });

async function html(id: string) {
  return renderToStaticMarkup(await Page({ params: Promise.resolve({ id }) }));
}

describe('owner recent wallet receipt page', () => {
  it('is private, dynamic, noindex and rejects malformed URLs before API calls', async () => {
    expect(dynamic).toBe('force-dynamic');
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(await html('not-a-uuid')).toContain('최근 50건에서');
    expect(apiMock).not.toHaveBeenCalled();
    expect(requireMemberMock).toHaveBeenCalledOnce();
  });
  it('shows exact confirmed pocket movements without inventing a counterparty', async () => {
    apiMock.mockResolvedValue({ scope: 'recent_50', receipt: {
      transactionId: TX, type: 'BANK_DEPOSIT', label: '은행 입금', netAmount: '0', cashDelta: `-${BIG}`, bankDelta: BIG, direction: 'neutral', occurredAt: '2026-10-25T00:00:00.000Z',
    } });
    const rendered = await html(TX);
    expect(rendered).toContain('확인된 최근 거래');
    expect(rendered).toContain('900,719,925,474,099,312,345,678,901,234,567,890');
    expect(rendered).toContain('최근 최대 50건');
    expect(rendered).toContain(TX);
  });
  it('never displays a confirmed payment on upstream failure', async () => {
    apiMock.mockRejectedValue(new Error('database offline'));
    const rendered = await html(TX);
    expect(rendered).toContain('영수증을 확인할 수 없어요');
    expect(rendered).not.toContain('확인된 최근 거래');
  });
});
