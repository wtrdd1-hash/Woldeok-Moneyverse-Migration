import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { StockDisclosureTicker } from './stock-disclosure-ticker';

vi.mock('./stock-disclosure-toast-notifier', () => ({
  StockDisclosureToastNotifier: () => null,
}));

describe('StockDisclosureTicker mobile dialog', () => {
  it('does not imply a static October bulletin is a new live market disclosure', () => {
    render(<StockDisclosureTicker />);
    expect(screen.getByText('가상 공시 자료')).toBeTruthy();
    expect(screen.queryByText('LIVE')).toBeNull();
  });

  it('keeps long disclosure body scrollable with mobile-size close and trade actions', () => {
    render(<StockDisclosureTicker />);
    fireEvent.click(screen.getAllByRole('button', { name: /공시/ })[0]!);
    const dialog = screen.getByRole('dialog');
    expect(dialog.className).toContain('max-h-[calc(100dvh-1rem)]');
    expect(screen.getByText('공시 상세 본문').closest('.overflow-y-auto')).toBeTruthy();
    expect(screen.getAllByRole('button', { name: '닫기' }).some((button) => button.className.includes('min-h-11'))).toBe(true);
    expect(screen.getByRole('link', { name: /해당 종목 호가 매매하기/ }).className).toContain('min-h-11');
  });
});
