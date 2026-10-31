import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CasinoJackpotTicker } from './casino-jackpot-ticker';

describe('P0 #2077 arcade jackpot unverified source', () => {
  it('does not fabricate WLD, plays or RNG certification on unavailable source', () => {
    const html = renderToStaticMarkup(<CasinoJackpotTicker data={null} />);
    expect(html).toMatch(/role="status"/);
    expect(html).toMatch(/증빙 확인 불가/);
    expect(html).not.toMatch(/74,500,000|12,845,000|RNG 불변 검증|0 판/);
  });

  it('does not trust a success-shaped legacy response lacking ledger-backed proof', () => {
    const html = renderToStaticMarkup(<CasinoJackpotTicker data={{
      jackpot_amount: '74500000', house_reserve: '12845000', total_plays_today: '0',
    }} />);
    expect(html).toMatch(/증빙 확인 불가/);
    expect(html).not.toMatch(/74,500,000|12,845,000|RNG 불변 검증|0 판/);
  });
});
