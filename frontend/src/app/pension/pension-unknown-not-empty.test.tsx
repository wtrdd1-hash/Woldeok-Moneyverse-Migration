// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { PensionPortalClient } from './pension-portal-client';

afterEach(() => cleanup());

/**
 * QA 2026-11-25: Spring has no my-contributions / my-payouts endpoints and the
 * page read a wallet field Spring never sends, so a member saw "0 WLD" and
 * "no history". Unknown must read as unknown, never as zero or empty.
 */
describe('pension unknown values', () => {
  it('shows unavailable history and balance instead of empty and 0', () => {
    render(
      <PensionPortalClient overview={null} myAccount={null} contributions={null} payouts={null} userCashBalance={null} isLoggedIn />,
    );
    expect(screen.queryByText('아직 기여금 납입 내역이 없습니다.')).toBeNull();
    expect(screen.queryByText(/\(0\)/)).toBeNull();
    expect(screen.getByText('확인 불가')).toBeTruthy();
    expect(screen.queryByText(/^0 WLD$/)).toBeNull();
  });

  it('still shows a real empty history as empty', () => {
    render(
      <PensionPortalClient overview={null} myAccount={null} contributions={[]} payouts={[]} userCashBalance="5000" isLoggedIn />,
    );
    expect(screen.getByText(/내 기여금 납입 이력 \(0\)/)).toBeTruthy();
    expect(screen.getByText(/5,000 WLD/)).toBeTruthy();
  });
});
