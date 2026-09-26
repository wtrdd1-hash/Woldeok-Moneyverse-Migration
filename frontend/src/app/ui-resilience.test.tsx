import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { StockTradingConsole } from './stocks/[symbol]/stock-trading-console';
import { SavingPocketsCard } from './bank/saving-pockets-card';
import { SiteHeader } from '@/components/site-header';

// next/navigation 및 use-viewer 모킹
vi.mock('next/navigation', () => ({
  usePathname: () => '/stocks/CHIPS',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock('@/lib/use-viewer', () => ({
  useViewer: () => ({
    signedIn: true,
    consentCurrent: true,
    adminRoles: [],
    username: 'testuser',
  }),
  isAdministrator: () => false,
}));

vi.mock('@/components/locale-provider', () => ({
  useLocale: () => ({ locale: 'ko' }),
}));

describe('UI Multi-Viewport Resilience & Zero-Clipping Invariants', () => {
  afterEach(() => {
    cleanup();
  });

  it('StockTradingConsole mobile floating action bar has safe-area padding and compact classes', () => {
    const { container } = render(
      <StockTradingConsole
        stockId="stock-1"
        symbol="CHIPS"
        name="월덕 반도체"
        currentPrice="52000"
      />
    );

    // 모바일 플로팅 액션 바 요소 탐색
    const floatingBar = container.querySelector('.lg\\:hidden.fixed.bottom-0');
    expect(floatingBar).not.toBeNull();
    expect(floatingBar?.className).toContain('pb-[max(0.75rem,env(safe-area-inset-bottom))]');
    expect(floatingBar?.className).toContain('p-2.5');
  });

  it('SavingPocketsCard prevents pocket title and balance clipping with min-w-0 and flex-wrap', () => {
    const mockPockets = [
      {
        pocket_id: 'pocket-1',
        name: '비상금 마련을 위한 아주 긴 이름의 저축 포켓',
        balance: '999999999999',
        target_amount: '1000000000000',
        target_date: '2026-12-31',
        icon_code: 'piggy-bank',
        theme_color: 'sky',
        is_archived: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    render(
      <SavingPocketsCard
        pockets={mockPockets}
        cashBalance="500000"
        bankBalance="2000000"
      />
    );

    const pocketTitle = screen.getByText('비상금 마련을 위한 아주 긴 이름의 저축 포켓');
    expect(pocketTitle.className).toContain('truncate');
    expect(pocketTitle.parentElement?.className).toContain('min-w-0');
  });

  it('SiteHeader protects 320px viewport by hiding wallet button below 480px', () => {
    const { container } = render(<SiteHeader />);

    // SessionControl 내의 지갑 버튼(nav 외부의 지갑 링크) 탐색
    const walletLinks = container.querySelectorAll('a[href="/wallet"]');
    const sessionWalletLink = Array.from(walletLinks).find((el) => !el.closest('nav'));
    expect(sessionWalletLink).toBeDefined();

    // 버튼 컨테이너에 hidden min-[480px]:inline-flex 가 적용되어 있는지 검증
    const walletButton = sessionWalletLink?.closest('button') || sessionWalletLink;
    expect(walletButton?.className).toContain('hidden min-[480px]:inline-flex');
  });
});
