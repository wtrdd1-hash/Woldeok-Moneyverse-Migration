import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import PredictionPage from './page';

/**
 * QA 2026-11-25: production /prediction listed invented markets ("월덕게임즈
 * (WDG) 이번 주 종가 1,500 WLD 돌파할까?") and its buy button opened a
 * "체결 완료" modal without calling any API. No prediction API exists on the
 * Spring backend, so the page states that plainly.
 */
describe('PredictionPage', () => {
  it('says the market is not open instead of listing invented markets', () => {
    const html = renderToStaticMarkup(<PredictionPage />);
    expect(html).toContain('예측 마켓');
    expect(html).toContain('아직 열리지 않았');
    expect(html).not.toContain('1,500 WLD 돌파');
    expect(html).not.toContain('체결 완료');
  });
  it('contains no hard-coded market list', () => {
    const src = readFileSync(join(__dirname, 'page.tsx'), 'utf8');
    expect(src).not.toContain('INITIAL_MARKETS');
  });
});
