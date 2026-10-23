import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { UserConversionLockInWidget } from './user-conversion-lockin-widget';

vi.mock('@/lib/use-viewer', () => ({ useViewer: () => ({ signedIn: true, consentCurrent: true, adminRoles: [] }) }));
const props = { title: '복리 계산', summaryValue: '120,000원', summaryLabel: '예상 금액' };
beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('UserConversionLockInWidget', () => {
  it('never claims an account save or automatic WLD payout', () => {
    render(<UserConversionLockInWidget {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /이 브라우저에 결과 저장/ }));
    expect(screen.getByRole('status').textContent).toContain('이 브라우저');
    expect(localStorage.getItem('wdmv_calculator_result')).toContain('복리 계산');
    expect(screen.queryByText(/내 포트폴리오에 성공적으로 저장|즉시 지급/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /가상 거래소/ }));
    expect(screen.queryByText(/10,000 WLD|10만 WLD|지원금/)).toBeNull();
  });

  it('reports browser storage failures without a false success', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    render(<UserConversionLockInWidget {...props} />);
    fireEvent.click(screen.getByRole('button', { name: /이 브라우저에 결과 저장/ }));
    expect(screen.getByRole('alert').textContent).toContain('저장하지 못했습니다');
  });
});
