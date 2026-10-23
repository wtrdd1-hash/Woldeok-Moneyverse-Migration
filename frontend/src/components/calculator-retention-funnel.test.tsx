import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { CalculatorRetentionFunnel } from './calculator-retention-funnel';

const scenario = { stockName: 'CHIPS', ticker: 'CHIPS', targetPrice: '120 WLD', reboundRate: '+5%' };

beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('CalculatorRetentionFunnel: truthful local retention', () => {
  it('links real stock alerts to the server-backed alert manager without claiming enrollment', () => {
    render(<CalculatorRetentionFunnel {...scenario} />);
    const link = screen.getByRole('link', { name: /조건부 알림 설정/ });
    expect(link.getAttribute('href')).toBe('/stocks/alerts?stock=CHIPS');
    expect(screen.queryByText(/알림 켜짐|알림이 발송되도록 설정/)).toBeNull();
  });

  it('saves a scenario only to this browser and labels the scope', () => {
    render(<CalculatorRetentionFunnel {...scenario} />);
    fireEvent.click(screen.getByRole('button', { name: /이 브라우저에 저장/ }));
    const saved = JSON.parse(localStorage.getItem('wdmv_saved_scenarios') || '[]') as Array<{ ticker: string }>;
    expect(saved[0]?.ticker).toBe('CHIPS');
    expect(screen.getByRole('status').textContent).toContain('브라우저');
    expect(screen.getByRole('button', { name: /브라우저에 저장됨/ })).toBeDefined();
  });

  it('treats a revised price calculation as unsaved until explicitly stored', () => {
    const { rerender } = render(<CalculatorRetentionFunnel {...scenario} />);
    fireEvent.click(screen.getByRole('button', { name: /이 브라우저에 저장/ }));
    rerender(<CalculatorRetentionFunnel {...scenario} targetPrice="140 WLD" />);
    expect(screen.getByRole('button', { name: /이 브라우저에 저장/ })).toBeDefined();
  });

  it('does not claim success when browser storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('quota'); });
    render(<CalculatorRetentionFunnel {...scenario} />);
    fireEvent.click(screen.getByRole('button', { name: /이 브라우저에 저장/ }));
    expect(screen.getByRole('alert').textContent).toContain('저장하지 못했습니다');
    expect(screen.queryByRole('button', { name: /브라우저에 저장됨/ })).toBeNull();
  });

  it('does not advertise an unverified WLD reward or simulated compound maturity alerts', () => {
    const { rerender } = render(<CalculatorRetentionFunnel {...scenario} />);
    expect(screen.queryByText(/10,000 WLD|가입 즉시 지갑|지원금이 예약/)).toBeNull();
    rerender(<CalculatorRetentionFunnel {...scenario} category="compound" />);
    expect(screen.queryByRole('link', { name: /조건부 알림 설정/ })).toBeNull();
    expect(screen.getByText(/만기 알림은 아직 제공되지 않습니다/)).toBeDefined();
  });
});
