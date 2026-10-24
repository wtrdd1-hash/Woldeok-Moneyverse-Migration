// @vitest-environment node
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { apiOrNull } from '@/lib/api';
import { requireMember } from '@/lib/session';
import PrestigePage, { dynamic, metadata } from './page';

vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn() }));
vi.mock('@/lib/session', () => ({ requireMember: vi.fn() }));

const progression = {
  progression: {
    stage_code: 'early',
    reached_at: '2026-10-20T10:00:00Z',
    next_stage_code: 'middle',
    next_requirements: { workCompletions: 10 },
  },
};

const wallet = {
  userId: 'member-1',
  balances: {
    currency: 'WLD',
    cash: { availableAmount: '12345', updatedAt: '2026-10-25T00:00:00Z' },
    bank: { availableAmount: '67890', updatedAt: '2026-10-25T00:00:00Z' },
    totalAvailableAmount: '80235',
  },
  recentTransactions: [],
};

async function html() {
  return renderToStaticMarkup(await PrestigePage());
}

describe('Prestige page — verified server-backed member state', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(requireMember).mockResolvedValue(undefined as never);
  });

  it('requires the member session before fetching any owner-scoped data', async () => {
    vi.mocked(requireMember).mockRejectedValueOnce(new Error('login required'));
    await expect(PrestigePage()).rejects.toThrow('login required');
    expect(apiOrNull).not.toHaveBeenCalled();
  });

  it('renders only the actual progression stage and verified cash/bank balances', async () => {
    vi.mocked(apiOrNull).mockResolvedValueOnce(progression as never).mockResolvedValueOnce(wallet as never);
    const rendered = await html();
    expect(apiOrNull).toHaveBeenNthCalledWith(1, '/api/v1/progression');
    expect(apiOrNull).toHaveBeenNthCalledWith(2, '/api/v1/wallet?recent=1');
    expect(rendered).toContain('성장 초기');
    expect(rendered).toContain('12,345');
    expect(rendered).toContain('67,890');
    expect(rendered).toContain('href="/progression"');
    expect(rendered).toContain('href="/wallet"');
    expect(rendered).not.toContain('Tier 2 (x4.0배)');
    expect(rendered).not.toContain('8,500,000');
    expect(rendered).not.toContain('고대 황금 시계');
    expect(rendered).not.toContain('환생 확정');
  });

  it('does not invent a stage or balance when either API is unavailable', async () => {
    vi.mocked(apiOrNull).mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    const rendered = await html();
    expect(rendered).toContain('성장 단계 정보를 불러오지 못했습니다');
    expect(rendered).toContain('지갑 잔액을 확인할 수 없습니다');
    expect(rendered).not.toContain('2,500,000');
    expect(rendered).not.toContain('Tier 2');
  });

  it('rejects non-canonical or inconsistent wallet values rather than guessing', async () => {
    vi.mocked(apiOrNull).mockResolvedValueOnce(progression as never).mockResolvedValueOnce({
      ...wallet,
      balances: {
        ...wallet.balances,
        cash: { ...wallet.balances.cash, availableAmount: '12.34' },
        totalAvailableAmount: '999999',
      },
    } as never);
    const rendered = await html();
    expect(rendered).toContain('지갑 잔액을 확인할 수 없습니다');
    expect(rendered).not.toContain('999,999');
  });

  it('keeps private member state uncached and non-indexable with no fake mutation action', async () => {
    vi.mocked(apiOrNull).mockResolvedValueOnce(progression as never).mockResolvedValueOnce(wallet as never);
    const rendered = await html();
    expect(dynamic).toBe('force-dynamic');
    expect(metadata.robots).toEqual({ index: false, follow: false });
    expect(rendered).toContain('환생 및 자산 소각 기능은 현재 제공되지 않습니다');
    expect(rendered).not.toContain('<button');
    expect(rendered).not.toContain('환생 완료!');
  });
});
