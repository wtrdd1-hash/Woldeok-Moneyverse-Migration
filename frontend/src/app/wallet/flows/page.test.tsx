import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { apiOrNull } from '@/lib/api';
import { requireMember } from '@/lib/session';
import WalletFlowsPage, { metadata } from './page';

vi.mock('@/lib/api', () => ({ apiOrNull: vi.fn() }));
vi.mock('@/lib/session', () => ({ requireMember: vi.fn() }));

const summary = {
  currency: 'WLD', scope: 'recent_50', completeHistory: false,
  transactionCount: 3, incomingCount: 1, outgoingCount: 1, internalMovementCount: 1,
  incomingAmount: '9007199254740993', outgoingAmount: '2', netAmount: '9007199254740991',
};

describe('member wallet flow page', () => {
  beforeEach(() => {
    vi.mocked(requireMember).mockResolvedValue(undefined as never);
    vi.mocked(apiOrNull).mockResolvedValue(summary);
  });

  it('requires a member before querying any owner ledger projection', async () => {
    vi.mocked(requireMember).mockRejectedValueOnce(new Error('sign-in required'));
    await expect(WalletFlowsPage()).rejects.toThrow('sign-in required');
    expect(apiOrNull).not.toHaveBeenCalled();
  });

  it('renders exact amounts, a recent-only warning and a named back link', async () => {
    const html = renderToStaticMarkup(await WalletFlowsPage());
    expect(apiOrNull).toHaveBeenCalledWith('/api/v1/wallet/flow-summary');
    expect(html).toContain('9,007,199,254,740,993');
    expect(html).toContain('전체 원장 내역이 아님');
    expect(html).toContain('href="/wallet/activity"');
    expect(html).toContain('현금·은행 내부 이동');
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it('never turns a failed server response into zero activity', async () => {
    vi.mocked(apiOrNull).mockResolvedValueOnce(null);
    const html = renderToStaticMarkup(await WalletFlowsPage());
    expect(html).toContain('지금은 수입·지출 내역을 확인할 수 없어요.');
    expect(html).not.toContain('아직 집계할 거래가 없어요.');
  });
});
