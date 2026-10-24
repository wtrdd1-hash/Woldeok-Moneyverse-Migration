import React from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FirstTradeOnboardingModal } from './first-trade-onboarding-modal';

function openOnboarding(eligible: boolean) {
  render(<FirstTradeOnboardingModal eligible={eligible} />);
  act(() => vi.advanceTimersByTime(1100));
}

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('verified first-trade onboarding', () => {
  it('does not trust browser-stored tokens to show a member-only invitation', () => {
    localStorage.setItem('token', 'not-a-server-session');
    openOnboarding(false);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('invites a verified member to the real stock catalog without claiming a reward or execution', () => {
    openOnboarding(true);
    const dialog = screen.getByRole('dialog', { name: /첫 거래 안내/ });
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    const link = screen.getByRole('link', { name: /주식 거래소에서 종목 확인하기/ });
    expect(link.getAttribute('href')).toBe('/stocks');
    expect(dialog.textContent).toContain('실제 주문');
    expect(dialog.textContent).not.toMatch(/지급 완료|매수 완료|정상 체결|확정 지원금/);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: '닫기' }));
  });

  it('never sends an unverified order or invents local holdings when continuing', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false } as Response);
    openOnboarding(true);
    fireEvent.click(screen.getByRole('link', { name: /주식 거래소에서 종목 확인하기/ }));
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(localStorage.getItem('wdmv_virtual_holdings')).toBeNull();
    expect(localStorage.getItem('wdmv_first_trade_onboarded')).toBe('true');
  });

  it('dismisses on Escape and offers a 44px keyboard-accessible close control', () => {
    openOnboarding(true);
    const close = screen.getByRole('button', { name: '닫기' });
    expect(close.className).toContain('min-h-11');
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('onboarding state and keyboard isolation', () => {
  it('respects a previous dismissal without generating a new trade', () => {
    localStorage.setItem('wdmv_first_trade_onboarded', 'true');
    openOnboarding(true);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(localStorage.getItem('wdmv_virtual_holdings')).toBeNull();
  });

  it('keeps keyboard Tab navigation inside the dialog', () => {
    openOnboarding(true);
    const dialog = screen.getByRole('dialog');
    const close = screen.getByRole('button', { name: '닫기' });
    const last = screen.getByRole('button', { name: '나중에 둘러보기' });
    last.focus();
    fireEvent.keyDown(last, { key: 'Tab' });
    expect(document.activeElement).toBe(close);
    fireEvent.keyDown(close, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);
    expect(dialog.contains(document.activeElement)).toBe(true);
  });
});
