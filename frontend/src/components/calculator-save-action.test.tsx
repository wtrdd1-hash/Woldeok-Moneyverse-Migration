import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { CalculatorSaveAction } from './calculator-save-action';

vi.mock('next/navigation', () => ({ usePathname: () => '/tools/stock-calculator' }));
const scenario = { type: 'stock' as const, title: 'CHIPS', badge: '게임', primaryMetric: { label: '예상', value: '100 WLD' }, details: { ticker: 'CHIPS' } };
beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });

describe('CalculatorSaveAction', () => {
  it('stores only in this browser and does not POST to a nonexistent account-sync endpoint', () => {
    const fetch = vi.fn(); vi.stubGlobal('fetch', fetch);
    render(<CalculatorSaveAction scenario={scenario} />);
    fireEvent.click(screen.getByRole('button', { name: /이 브라우저에 시뮬레이션 저장/ }));
    expect(JSON.parse(localStorage.getItem('wdmv_saved_scenarios') || '[]')[0].ticker).toBe('CHIPS');
    expect(screen.getByRole('status').textContent).toContain('브라우저');
    expect(fetch).not.toHaveBeenCalled();
    expect(screen.queryByText(/10,000 WLD|영구 저장|자동 동기화/)).toBeNull();
  });

  it('lets the user save a revised calculation instead of showing stale saved success', () => {
    const { rerender } = render(<CalculatorSaveAction scenario={scenario} />);
    fireEvent.click(screen.getByRole('button', { name: /이 브라우저에 시뮬레이션 저장/ }));
    rerender(<CalculatorSaveAction scenario={{ ...scenario, primaryMetric: { label: '예상', value: '200 WLD' } }} />);
    expect(screen.getByRole('button', { name: /이 브라우저에 시뮬레이션 저장/ })).toBeDefined();
  });

  it('never reports saved when localStorage rejects a write', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    render(<CalculatorSaveAction scenario={scenario} />);
    fireEvent.click(screen.getByRole('button', { name: /이 브라우저에 시뮬레이션 저장/ }));
    expect(screen.getByRole('alert').textContent).toContain('저장하지 못했습니다');
    expect(screen.queryByRole('button', { name: /브라우저에 저장됨/ })).toBeNull();
  });
});
