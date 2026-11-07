import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { BondsPortalClient } from './bonds-portal-client';

const overview = {
  totalBondsActive: 0, totalFundedWld: '0', totalHoldersCount: 0,
  totalCouponsPaidWld: '0', benchmark1YYield: '—', benchmark3YYield: '—', benchmark5YYield: '—',
};

describe('virtual bond owner UI source truth', () => {
  it('renders an accessible retry state rather than a false empty holding when the owner read is unavailable', () => {
    const html = renderToStaticMarkup(createElement(BondsPortalClient, {
      initialBonds: [], initialHoldings: [], initialRepoLoans: [], overview,
      isLoggedIn: true, holdingsStatus: 'unavailable', repoStatus: 'unavailable',
    }));
    expect(html).toContain('보유 채권 조회를 확인할 수 없습니다');
    expect(html).not.toContain('현재 보유 중인 국채가 없습니다.');
    expect(html).toContain('다시 조회하기');
    expect(html).toContain('min-h-11');
    expect(html).toContain('원장 정산이 검증되기 전까지 중단');
  });
  it('does not show a logged-out owner as a verified zero balance', () => {
    const html = renderToStaticMarkup(createElement(BondsPortalClient, {
      initialBonds: [], initialHoldings: [], overview,
      isLoggedIn: false, holdingsStatus: 'guest', repoStatus: 'guest',
    }));
    expect(html).toContain('보유 채권은 로그인 후 확인할 수 있습니다.');
    expect(html).not.toContain('현재 보유 중인 국채가 없습니다.');
  });
});
