import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { CalculatorRetentionFunnel } from './calculator-retention-funnel';

const props = { stockName: 'Example', ticker: 'EX', targetPrice: '100 WLD', reboundRate: '5%' };

beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('calculator retention: truthful local-only actions', () => {
  it('does not promise unimplemented alerts, server sync, or a 10,000 WLD grant', () => {
    const { container } = render(<CalculatorRetentionFunnel {...props} />);
    expect(container.textContent).not.toMatch(/10,000 WLD|알림 켜짐|즉시 알려드립니다|자동 동기화|입금됩니다/);
    expect(screen.queryByRole('button', { name: /목표가 알림 받기/ })).toBeNull();
    expect(screen.getByRole('link', { name: /가상 주식.*둘러보기/ }).getAttribute('href')).toBe('/stocks');
  });

  it('stores locally, reports browser-only scope, and is keyboard accessible', () => {
    render(<CalculatorRetentionFunnel {...props} />);
    const save = screen.getByRole('button', { name: /브라우저에 저장/ });
    expect(save.getAttribute('type')).toBe('button');
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    fireEvent.click(save);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem('wdmv_saved_scenarios') ?? '[]')[0].ticker).toBe('EX');
    expect(screen.getByRole('status').textContent).toMatch(/이 브라우저/);
    expect(screen.getByRole('button', { name: /저장 완료/ }).hasAttribute('disabled')).toBe(true);
  });

  it('restores a previously saved scenario without a server request', () => {
    localStorage.setItem('wdmv_saved_scenarios', JSON.stringify([{ ...props, savedAt: 123 }]));
    render(<CalculatorRetentionFunnel {...props} />);
    expect(screen.getByRole('button', { name: /저장 완료/ }).hasAttribute('disabled')).toBe(true);
  });

  it('supports compound-calculator context without claiming a registered alert', () => {
    const { container } = render(<CalculatorRetentionFunnel {...props} category="compound" />);
    expect(container.textContent).toContain('만기 예상 자산');
    expect(container.textContent).not.toContain('알림 켜짐');
  });

  it('does not overwrite malformed local scenario data', () => {
    localStorage.setItem('wdmv_saved_scenarios', '{bad');
    render(<CalculatorRetentionFunnel {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /브라우저에 저장/ }));
    expect(screen.getByRole('alert').textContent).toContain('저장하지 못했습니다');
    expect(localStorage.getItem('wdmv_saved_scenarios')).toBe('{bad');
  });

  it('does not claim success when browser storage fails', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota exceeded'); });
    render(<CalculatorRetentionFunnel {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /브라우저에 저장/ }));
    expect(screen.getByRole('alert').textContent).toMatch(/저장하지 못했습니다/);
    expect(screen.queryByRole('button', { name: /저장 완료/ })).toBeNull();
  });
});
