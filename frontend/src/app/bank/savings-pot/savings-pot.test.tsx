import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { SavingsChallengePlanner } from './savings-challenge-planner';

describe('Verified savings challenge planner', () => {
  afterEach(cleanup);

  it('shows only owner-verified bank and cash balances, no fabricated social deposits or rewards', () => {
    render(<SavingsChallengePlanner bankBalance="100000" cashBalance="50000" />);
    expect(screen.getByText('100,000 WLD')).toBeDefined();
    expect(screen.getByText('50,000 WLD')).toBeDefined();
    expect(screen.getByText(/42,858 WLD/)).toBeDefined();
    expect(screen.getByRole('link', { name: /실제 은행에서 입출금하기/ }).getAttribute('href')).toBe('/bank');
    for (const claim of ['파이낸스덕', '월가고래', '확정 가산', '원천 소각', '입금 시뮬레이션 완료', '친구 찌르기']) {
      expect(document.body.textContent).not.toContain(claim);
    }
    expect(screen.queryByRole('button', { name: /입금|매수|보상 수령/ })).toBeNull();
  });

  it('allows keyboard-accessible 7/30 day target planning without a ledger mutation', () => {
    render(<SavingsChallengePlanner bankBalance="100000" cashBalance="50000" />);
    fireEvent.change(screen.getByRole('combobox', { name: /계획 기간/ }), { target: { value: '30' } });
    expect(screen.getByText(/10,000 WLD/)).toBeDefined();
    fireEvent.change(screen.getByRole('textbox', { name: /가상 저축 목표/ }), { target: { value: 'abc' } });
    expect(screen.getByRole('alert').textContent).toMatch(/유효한 WLD/);
    expect(screen.queryByText(/하루에 필요한 추가 저축/)).toBeNull();
  });
});
