import { describe, expect, it, vi } from 'vitest';
vi.mock('./actions', () => ({
  claimInterestAction: async () => ({ status: 'idle' }),
  depositAction: async () => ({ status: 'idle' }),
  withdrawAction: async () => ({ status: 'idle' }),
}));
vi.mock('@/lib/audio-effects', () => ({ playCoinCollectSound: vi.fn(), playStockTickSound: vi.fn() }));
import { renderToStaticMarkup } from 'react-dom/server';
import { TossBankHeroCard } from './toss-bank-hero-card';

const huge = '900719925474099312345678901';
function render(unclaimedInterest: string) {
  return renderToStaticMarkup(<TossBankHeroCard bankBalance={huge} cashBalance="2"
    unclaimedInterest={unclaimedInterest} dailyRatePct={0.1} annualYieldPct={44.03} />);
}

describe('bank claim interest is a verified PostgreSQL observation, not a live counter', () => {
  it('preserves an exact huge accrued amount without float conversion or synthetic ticks', () => {
    const html = render(huge);
    expect(html).toContain('조회된 미수령 이자');
    expect(html).toContain('900,719,925,474,099,312,345,678,901');
    expect(html).not.toContain('지금 실시간으로 쌓이는 이자');
    expect(html).not.toContain('Infinity');
  });

  it('does not enable claiming when verified unclaimed interest is zero', () => {
    const html = render('0');
    expect(html).toContain('조회된 미수령 이자');
    expect(html).toMatch(/disabled[^>]*>[^<]*<svg|disabled/);
  });
});
