import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { read, gate } = vi.hoisted(() => ({ read: vi.fn(), gate: vi.fn() }));
vi.mock('@/lib/api', () => ({ apiOrNull: read }));
vi.mock('@/lib/session', () => ({ requireAdminConsole: gate }));
vi.mock('../admin-back', () => ({ AdminBack: () => null }));

import Page from './page';
import { validateMoneyFlowResponse } from './money-flow-data';

const uuid = '123e4567-e89b-42d3-a456-426614174000';
const cursor = 'mf1.' + Buffer.from(JSON.stringify({
  at: '2026-10-27 06:00:00.123456+00', tx: uuid, posting: uuid,
  filter: 'a'.repeat(64),
})).toString('base64url');
const valid = {
  items: [{ transaction_id: uuid, type: 'WORK_REWARD_CLAIM', user_id: uuid,
    display_name: 'Tester', account_type: 'USER_CASH', direction: 'debit',
    amount: '9007199254740993', created_at: '2026-10-27T10:00:00.000Z' }],
  summary: { total_volume_24h: '9007199254740993', total_transactions_24h: 1,
    active_users_24h: 1, total_inflow_24h: '9007199254740993', total_outflow_24h: '0',
    all_time_transactions: 1, all_time_users: 1,
    last_transaction_at: '2026-10-27T10:00:00.000Z' },
  next_cursor: cursor,
};
const render = async () => renderToStaticMarkup(await Page({ searchParams: Promise.resolve({}) }));

beforeEach(() => vi.clearAllMocks());

describe('admin money flow keyset continuation', () => {
  it('accepts the exact opaque mf1 cursor emitted by the NestJS API', () => {
    expect(validateMoneyFlowResponse(valid)?.next_cursor).toBe(cursor);
  });
  it('renders the server-issued cursor in the next-page link without converting to a timestamp', async () => {
    read.mockResolvedValue(valid);
    const html = await render();
    expect(gate).toHaveBeenCalledWith('/admin/money-flow');
    expect(html).toContain('9,007,199,254,740,993');
    expect(html).toContain('다음 50건 조회');
    expect(html).toContain(encodeURIComponent(cursor));
    expect(html).not.toContain('원장 조회에 실패');
  });
  it.each([
    '2026-10-27T06:00:00Z', 'mf1.invalid+payload', 'mf1.' + 'A'.repeat(481),
    'mf1.' + 'A'.repeat(50) + '\n', 123,
  ])('rejects unsupported, oversized, or non-string cursors', (badCursor) => {
    expect(validateMoneyFlowResponse({ ...valid, next_cursor: badCursor })).toBeNull();
  });
  it('still fails closed for an absent response and keeps admin auth', async () => {
    read.mockResolvedValue(null);
    const html = await render();
    expect(gate).toHaveBeenCalledWith('/admin/money-flow');
    expect(html).toContain('role="alert"');
    expect(html).toContain('원장 조회에 실패');
    expect(html).not.toContain('831건');
  });
});
