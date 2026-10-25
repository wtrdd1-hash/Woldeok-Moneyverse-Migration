import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import PredictionPage from './page';

vi.mock('@/components/locale-provider', () => ({
  useLocale: () => ({ locale: 'ko' }),
}));

afterEach(() => vi.unstubAllGlobals());

describe('PredictionPage verified capability and educational mode', () => {
  it('never offers fictional markets, WLD purchases, or an unverified settlement receipt', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: async () => ({ available: false, reason: 'NO_SETTLEMENT_CONTRACT' }),
    }));
    render(<PredictionPage />);

    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('거래 미지원'));
    expect(screen.queryByText(/월덕게임즈 \(WDG\) 이번 주 종가/)).toBeNull();
    expect(screen.queryByText(/예측 지분 체결 완료/)).toBeNull();
    expect(screen.queryByRole('button', { name: /지분 매수하기/ })).toBeNull();
    expect(screen.getByText(/학습용 계산/)).toBeDefined();
  });

  it('updates complementary binary probabilities without claiming a real payout', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    render(<PredictionPage />);
    fireEvent.change(screen.getByRole('slider', { name: 'YES 확률' }), { target: { value: '70' } });
    expect(screen.getByText('YES 70%')).toBeDefined();
    expect(screen.getByText('NO 30%')).toBeDefined();
    expect(screen.getByText('1.43배')).toBeDefined();
    expect(screen.queryByText(/정상 매수되었습니다/)).toBeNull();
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('상태 확인 불가'));
  });
});
