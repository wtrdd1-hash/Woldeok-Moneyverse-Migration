import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { StockTradingConsole } from './stocks/[symbol]/stock-trading-console';
import { SavingPocketsCard } from './bank/saving-pockets-card';
import { SiteHeader } from '@/components/site-header';
import { P2PTransferModal } from '@/components/p2p-transfer-modal';

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
    // 한국형 적색 매수(bg-red-500) · 청색 매도(bg-blue-500) 시맨틱 및 44px 터치 타깃 검증
    const mobileBuyBtn = floatingBar?.querySelector('button.bg-red-500');
    const mobileSellBtn = floatingBar?.querySelector('button.bg-blue-500');
    expect(mobileBuyBtn).not.toBeNull();
    expect(mobileSellBtn).not.toBeNull();
    expect(mobileBuyBtn?.className).toContain('min-h-[44px]');
    expect(mobileSellBtn?.className).toContain('min-h-[44px]');
  });

  it('StockTradingConsole renders 3-column trading matrix when chartSlot is provided without duplicating order panel', () => {
    const { container } = render(
      <StockTradingConsole
        stockId="stock-1"
        symbol="CHIPS"
        name="월덕 반도체"
        currentPrice="52000"
        chartSlot={<div data-testid="embedded-chart-slot">차트 슬롯</div>}
      />
    );

    const grid = container.querySelector('[data-testid="trading-matrix-grid"]');
    expect(grid).not.toBeNull();
    expect(grid?.className).toContain('xl:grid-cols-[minmax(285px,330px)_minmax(0,1fr)_minmax(310px,360px)]');
    expect(screen.getByTestId('embedded-chart-slot')).toBeTruthy();
    // 중복 주문 패널 DOM이 제거되어 단일 주문 패널 헤더만 렌더링되어야 함
    expect(screen.getAllByText('CHIPS 주문')).toHaveLength(1);
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

  it('P2PTransferModal trigger fills hero row and meets 44px+ touch target', () => {
    render(<P2PTransferModal triggerText="1:1 간편 송금" />);
    const trigger = screen.getByRole('button', { name: /1:1 간편 송금/ });
    expect(trigger.className).toContain('w-full');
    expect(trigger.className).toContain('min-h-[48px]');
  });

  it('Phase 3 customer portal hubs preserve semantic colors, tabular-nums, and 44px mobile touch targets', () => {
    const home = readFileSync(join(__dirname, 'page.tsx'), 'utf8');
    const wallet = readFileSync(join(__dirname, 'wallet/page.tsx'), 'utf8');
    const bank = readFileSync(join(__dirname, 'bank/page.tsx'), 'utf8');
    const shop = readFileSync(join(__dirname, 'shop/page.tsx'), 'utf8');
    const shopStore = readFileSync(join(__dirname, 'shop/shop-store-view.tsx'), 'utf8');

    expect(home).toContain("isUp ? 'text-red-400' : 'text-blue-400'");
    expect(home).toContain('min-h-[44px]');

    expect(wallet).toContain('triggerVariant="trading-sell"');
    expect(wallet).toContain('triggerVariant="trading-buy"');
    expect(wallet).toContain('min-h-[44px] sm:min-h-[38px]');

    expect(bank).toContain('min-h-[44px] sm:min-h-[36px]');
    expect(bank).toContain('tabular-nums');

    expect(shop).toContain('min-h-[44px]');
    expect(shopStore).toContain('min-h-[44px] sm:min-h-[38px]');
  });

  it('Phase 4 auxiliary hubs preserve 44px touch targets, tabular-nums, and zero-clipping invariants', () => {
    const pensionPortal = readFileSync(join(__dirname, 'pension/pension-portal-client.tsx'), 'utf8');
    const pensionPanel = readFileSync(join(__dirname, 'pension/funded-treasury-pension-panel.tsx'), 'utf8');
    const bondsPortal = readFileSync(join(__dirname, 'bonds/bonds-portal-client.tsx'), 'utf8');
    const treasuryCard = readFileSync(join(__dirname, 'treasury/treasury-program-card.tsx'), 'utf8');
    const arcadeForms = readFileSync(join(__dirname, 'arcade/casino-forms.tsx'), 'utf8');
    const workForms = readFileSync(join(__dirname, 'work/work-forms.tsx'), 'utf8');

    // 국민연금: 44px 프리셋 및 48px 즉시 납입
    expect(pensionPortal).toContain('min-h-[44px] sm:min-h-[36px]');
    expect(pensionPortal).toContain('min-h-[48px]');
    expect(pensionPortal).toContain('tabular-nums');
    expect(pensionPanel).toContain('min-h-[44px]');

    // 가상채권: 44px 터치 버튼 및 폰트 수치
    expect(bondsPortal).toContain('min-h-[44px] sm:min-h-[36px]');
    expect(bondsPortal).toContain('tabular-nums');

    // 국고 프로그램 카드: 44px 긴급 구제/배당/그랜트 버튼
    expect(treasuryCard).toContain('w-full min-h-[44px]');

    // 아케이드/카지노: 44px 퀵 베팅 칩 및 슬라이더 버튼
    expect(arcadeForms).toContain('min-h-[44px] sm:min-h-[36px]');

    // 직업 시스템: 48px 업무 시작 및 44px 전직 버튼
    expect(workForms).toContain('min-h-[48px]');
    expect(workForms).toContain('min-h-[44px]');
  });
});
