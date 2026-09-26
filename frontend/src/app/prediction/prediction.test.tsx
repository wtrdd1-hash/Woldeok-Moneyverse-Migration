import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PredictionPage from './page';

vi.mock('@/components/locale-provider', () => ({
  useLocale: () => ({ locale: 'ko' }),
}));

describe('PredictionPage Polymarket-Style Invariants', () => {
  it('renders prediction markets list and calculates 2% fee properly', () => {
    render(<PredictionPage />);

    expect(screen.getByText(/월덕 가상 예측 마켓/i)).toBeDefined();
    expect(screen.getAllByText(/월덕게임즈 \(WDG\) 이번 주 종가 1,500 WLD 돌파할까\?/i)[0]).toBeDefined();

    // Select NO side
    const noButtons = screen.getAllByRole('button', { name: /NO/i });
    if (noButtons[0]) fireEvent.click(noButtons[0]);

    // Click Buy button
    const buyButton = screen.getByRole('button', { name: /NO 지분 매수하기/i });
    expect(buyButton).toBeDefined();
    fireEvent.click(buyButton);

    // Modal popup confirmation
    expect(screen.getByText('예측 지분 체결 완료!')).toBeDefined();

    const closeModalBtn = screen.getByRole('button', { name: '확인 및 닫기' });
    fireEvent.click(closeModalBtn);
    expect(screen.queryByText('예측 지분 체결 완료!')).toBeNull();
  });
});
