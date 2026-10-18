// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { SavingsPotCard } from './savings-pot-card';

vi.mock('@/components/locale-provider', () => ({ useLocale: () => ({ locale: 'ko', setLocale: () => {} }) }));
vi.mock('@/lib/audio-effects', () => ({ playCoinCollectSound: vi.fn(), playBetChipSound: vi.fn() }));
vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }));

describe('bank enrollment versus simulated savings plans', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => { cleanup(); vi.clearAllMocks(); });

  it('links actual bank enrollment to the ledger-backed deposit form, not a simulated plan', () => {
    render(<SavingsPotCard userId="member-A" />);
    expect(screen.getByRole('link', { name: /실제 복리예금 가입하기/ }).getAttribute('href')).toBe('#bank-real-deposit');
    expect(screen.getAllByRole('button', { name: /모의 가입 체험/ })).toHaveLength(3);
    expect(screen.queryByRole('button', { name: /^예금 가입하기$/ })).toBeNull();
  });

  it('discloses that simulated plan signup never transfers actual WLD', () => {
    render(<SavingsPotCard userId="member-A" />);
    fireEvent.click(screen.getAllByRole('button', { name: /모의 가입 체험/ })[0]!);
    expect(screen.getAllByText(/실제 WLD 잔액과 무관/).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /모의 예치 기록하기/ })).toBeTruthy();
  });
});

describe('account isolation regression for simulated savings', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => { cleanup(); vi.clearAllMocks(); });

  it('never shows the preceding member simulated pots when a different member signs in on the same browser', () => {
    const first = render(<SavingsPotCard userId="member-A" />);
    fireEvent.click(screen.getAllByRole('button', { name: /모의 가입 체험/ })[0]!);
    fireEvent.click(screen.getByRole('button', { name: /모의 예치 기록하기/ }));
    expect(screen.getByText(/내 모의 복리 포켓 기록/)).toBeTruthy();
    expect(localStorage.getItem('wdmv_savings_pots_member-A')).toBeTruthy();
    first.unmount();
    render(<SavingsPotCard userId="member-B" />);
    expect(screen.queryByText(/내 모의 복리 포켓 기록/)).toBeNull();
    expect(localStorage.getItem('wdmv_savings_pots_member-B')).toBeNull();
  });
});
