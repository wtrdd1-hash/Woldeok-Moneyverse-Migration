import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const apiMock = vi.hoisted(() => vi.fn());
vi.mock('@/lib/api', () => ({ apiOrNull: apiMock }));
vi.mock('@/lib/session', () => ({ requireAdminConsole: vi.fn().mockResolvedValue(undefined) }));
vi.mock('next/link', () => ({ default: ({ href, children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => <a href={href} {...rest}>{children}</a> }));
vi.mock('../admin-back', () => ({ AdminBack: () => null }));

import AdminMoneyFlowPage from './page';

const params = { searchParams: Promise.resolve({}) };

describe('admin money-flow verified server render', () => {
  beforeEach(() => apiMock.mockReset());

  it('shows a retryable failure instead of fake ledger counts or 100% integrity', async () => {
    apiMock.mockResolvedValue(null);
    const html = renderToStaticMarkup(await AdminMoneyFlowPage(params));
    expect(html).toContain('원장 조회에 실패');
    expect(html).toContain('다시 조회');
    expect(html).not.toContain('831건');
    expect(html).not.toContain('13명');
    expect(html).not.toContain('무결성 100%');
    expect(html).not.toContain('최근 24시간 동안 신규 체결된 거래가 없습니다');
  });

  it('renders exact high-value WLD from authenticated API without rounding', async () => {
    apiMock.mockResolvedValue({
      items: [{
        transaction_id: '8a12662b-fcaa-4e50-9234-9b6d7ec5c412',
        type: 'BANK_DEPOSIT',
        user_id: 'ee0eab31-79f2-47ab-bad8-55b82933c9f2',
        display_name: 'Member',
        account_type: 'cash',
        direction: 'debit',
        amount: '9007199254740993',
        created_at: '2026-10-27T00:00:00.000Z',
      }],
      summary: {
        total_volume_24h: '9007199254740993',
        total_transactions_24h: 1,
        active_users_24h: 1,
        total_inflow_24h: '9007199254740993',
        total_outflow_24h: '0',
        all_time_transactions: 1,
        all_time_users: 1,
      },
      next_cursor: null,
    });
    const html = renderToStaticMarkup(await AdminMoneyFlowPage(params));
    expect(html).toContain('9,007,199,254,740,993');
    expect(html).not.toContain('9,007,199,254,740,992');
    expect(html).not.toContain('원장 조회에 실패');
  });
});
