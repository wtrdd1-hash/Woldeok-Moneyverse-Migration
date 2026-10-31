// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { PensionPortalClient } from './pension-portal-client';

afterEach(() => cleanup());

describe('P1 pension member receipt evidence UI', () => {
  it('does not show fabricated account/wallet zeros or false empty receipt history on partial failure', () => {
    render(<PensionPortalClient
      overview={null} myAccount={null} contributions={[]} payouts={[]}
      userCashBalance="0" isLoggedIn
      sourceEvidence={{ account: false, contributions: false, payouts: false, wallet: false }}
    />);
    expect(screen.getByText('내 연금 계좌 조회 불가')).toBeTruthy();
    expect(screen.getByRole('tablist').className).toContain('overflow-x-auto');
    expect(screen.getByText('내 지갑 가용 잔액:').parentElement?.textContent).toContain('조회 불가');
    fireEvent.mouseDown(screen.getByRole('tab', { name: /내 기여금 납입 이력/ }), { button: 0, ctrlKey: false });
    expect(screen.getByText('납입 내역 조회 불가')).toBeTruthy();
    fireEvent.mouseDown(screen.getByRole('tab', { name: /기초연금 수령 내역/ }), { button: 0, ctrlKey: false });
    expect(screen.getByText('수령 내역 조회 불가')).toBeTruthy();
    expect(document.body.textContent).not.toContain('아직 기여금 납입 내역이 없습니다.');
    expect(document.body.textContent).not.toContain('아직 기초연금 수령 내역이 없습니다.');
    expect(screen.getByRole('link', { name: '연금 정보 다시 조회' }).getAttribute('href')).toBe('/pension');
  });

  it('keeps verified empty contributions separate from unavailable payouts', () => {
    render(<PensionPortalClient
      overview={null} myAccount={null} contributions={[]} payouts={[]}
      userCashBalance="0" isLoggedIn
      sourceEvidence={{ account: false, contributions: true, payouts: false, wallet: true }}
    />);
    fireEvent.mouseDown(screen.getByRole('tab', { name: /내 기여금 납입 이력/ }), { button: 0, ctrlKey: false });
    expect(screen.getByText('아직 기여금 납입 내역이 없습니다.')).toBeTruthy();
    fireEvent.mouseDown(screen.getByRole('tab', { name: /기초연금 수령 내역/ }), { button: 0, ctrlKey: false });
    expect(screen.getByText('수령 내역 조회 불가')).toBeTruthy();
    expect(document.body.textContent).toContain('최근 최대 20건');
  });
});
