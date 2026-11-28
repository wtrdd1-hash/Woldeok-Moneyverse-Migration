import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { ReactElement } from 'react';
import { LocaleProvider } from '@/components/locale-provider';
import { copyProblems } from '@/lib/copy';
import { MembershipTierCard, MEMBERSHIP_COPY } from './membership-tier-card';

afterEach(cleanup);

// Decision v2026.11.27.1101.1 (membership): none of the Plus benefits the card listed (ad removal,
// extra star drops, prestige asset preservation, a preferential pocket rate, a gold nametag) has a
// backend implementation, the price was hard-coded at 10,000 while the catalogue sells the pass at
// its own price, and the purchase pointed at a fixed catalogue id that environments do not share.
// The card now shows only what the catalogue says, and names the missing benefits as unavailable.

const PASS = {
  catalogId: '0be19549-2dde-4b07-a7a8-3fb11d23a6c0',
  name: 'VIP lounge 30-day pass',
  description: 'Lounge pass described by the catalogue',
  price: '15000',
};

function renderIn(locale: 'ko' | 'en', ui: ReactElement) {
  return render(ui, { wrapper: ({ children }) => <LocaleProvider initialLocale={locale}>{children}</LocaleProvider> });
}

describe('MembershipTierCard shows verified facts only', () => {
  it('prices the pass from the catalogue, not a hard-coded figure', () => {
    const { container } = renderIn('ko', <MembershipTierCard userBalance="20000" pass={PASS} />);
    expect(container.textContent).toContain('15,000 WLD');
    expect(container.textContent).not.toContain('10,000');
  });

  it('does not offer unimplemented benefits as available', () => {
    const { container } = renderIn('ko', <MembershipTierCard userBalance="20000" pass={PASS} />);
    const text = container.textContent ?? '';
    for (const claim of ['100% 광고 완전 제거', '자산 30% 영구 보존', '우대 금리 +0.5%', '스타 드롭 일일 5회', 'VIP 골드 네임택', 'Best value', '자산 0% 보존', '스타 드롭 일일 무료 3회']) {
      expect(text).not.toContain(claim);
    }
    expect(text).toContain(PASS.description);
    expect(screen.getByTestId('membership-unavailable-benefits')).toBeTruthy();
  });

  it('withholds the offer when the catalogue did not return the pass', () => {
    const { container } = renderIn('ko', <MembershipTierCard userBalance="20000" pass={null} />);
    expect(container.textContent).toContain('불러오지 못했어요');
    const start = screen.getByRole('button', { name: 'Plus VIP 시작하기' }) as HTMLButtonElement;
    expect(start.disabled).toBe(true);
  });

  it('buys the pass the catalogue named', async () => {
    const onSubscribe = vi.fn().mockResolvedValue(true);
    renderIn('ko', <MembershipTierCard userBalance="20000" pass={PASS} onSubscribe={onSubscribe} />);
    fireEvent.click(screen.getByRole('button', { name: 'Plus VIP 시작하기' }));
    await waitFor(() => expect(onSubscribe).toHaveBeenCalledWith(PASS.catalogId));
  });

  it('compares the balance as an integer string', async () => {
    const onSubscribe = vi.fn();
    renderIn('ko', <MembershipTierCard userBalance="14999" pass={PASS} onSubscribe={onSubscribe} />);
    fireEvent.click(screen.getByRole('button', { name: 'Plus VIP 시작하기' }));
    await screen.findByText(/잔액이 부족합니다/);
    expect(onSubscribe).not.toHaveBeenCalled();
  });

  it('never acknowledges a cancellation on its own', async () => {
    const { container } = renderIn('ko', <MembershipTierCard userBalance="20000" isPlusMember pass={PASS} />);
    fireEvent.click(screen.getByRole('button', { name: 'Plus VIP 구독 관리' }));
    await waitFor(() => expect(container.textContent).toContain('구독 취소를 처리할 수 없어요'));
    expect(container.textContent).not.toContain('접수 완료');
  });

  it('renders English without Korean apart from catalogue data', () => {
    const { container } = renderIn('en', <MembershipTierCard userBalance="20000" pass={PASS} />);
    expect(container.textContent).not.toMatch(/[가-힣]/);
  });

  it('has the card copy in all five locales', () => {
    expect(copyProblems(MEMBERSHIP_COPY)).toEqual([]);
  });
});
