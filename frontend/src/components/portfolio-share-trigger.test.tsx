import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PortfolioShareTrigger } from './portfolio-share-trigger';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('portfolio share user flow', () => {
  it('opens a keyboard-accessible, explicitly uncertified snapshot with exact values', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    render(<PortfolioShareTrigger
      totalAssetValue="9007199254740993"
      totalProfitAmount="-12345678901234567"
      profitRateBps="-125"
      topStockSymbol="WDG"
      holdingCount={1}
    />);
    const trigger = screen.getByRole('button', { name: '포트폴리오 공유 이미지' });
    expect(trigger.className).toContain('min-h-11');
    fireEvent.click(trigger);
    expect(await screen.findByRole('dialog')).toBeTruthy();
    expect(screen.getByText(/원장 인증 영수증이 아닙니다/)).toBeTruthy();
    expect(screen.getByRole('img', { name: /9,007,199,254,740,993 WLD/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: 'PNG 다운로드' })).toBeTruthy();
  });
});
