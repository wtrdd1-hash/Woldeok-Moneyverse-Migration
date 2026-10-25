// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PublicPensionPage from './page';
import { api, publicApi } from '@/lib/api';

vi.mock('@/lib/api', () => ({ api: vi.fn(), publicApi: vi.fn() }));

describe('pension portal public overview failure', () => {
  it('does not fabricate a 25 million WLD vault balance or a zero fund on API failure', async () => {
    vi.mocked(publicApi).mockRejectedValue(new Error('offline'));
    render(await PublicPensionPage());
    expect(screen.getByRole('alert').textContent).toContain('기금 기록을 확인할 수 없습니다');
    expect(screen.queryByText('25,000,000')).toBeNull();
    expect(api).not.toHaveBeenCalled();
  });
});

describe('pension member account query failure', () => {
  it('does not disguise a server-side permission error as a signed-out account with zero WLD', async () => {
    vi.mocked(publicApi).mockResolvedValue({ totalAumWld:'100', totalSubscribersCount:1, totalRetiredReceiversCount:0, totalPensionPaidWld:'45', benchmarkAnnualPayoutRate:'8.0%', vaultMainBalanceWld:'100' });
    vi.mocked(api).mockImplementation(async (path) => {
      if (path === '/api/v1/pension/my-account') throw Object.assign(new Error('unavailable'), { status: 503 });
      return [] as never;
    });
    render(await PublicPensionPage());
    expect(screen.getByRole('alert').textContent).toContain('연금 계좌를 확인할 수 없습니다');
    expect(screen.queryByText('나의 국민연금 적립 증서')).toBeNull();
  });
});
