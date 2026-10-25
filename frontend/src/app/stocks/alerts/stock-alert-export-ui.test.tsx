import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { AlertManager } from './alert-manager';

describe('accessible private stock alert event export entry', () => {
  it('exposes a non-prefetching native download link with truthful English scope', () => {
    const html = renderToStaticMarkup(createElement(AlertManager, {
      stocks: [], alerts: [], events: [], isEn: true,
    }));
    expect(html).toContain('href="/stocks/alerts/events.csv"');
    expect(html).toContain('aria-label="Download up to 100 recent virtual stock alert triggers as CSV"');
    expect(html).toContain('not all-time history or a completed trade receipt');
    expect(html).not.toContain('rel="prefetch"');
  });
  it('exposes an equivalent Korean download label', () => {
    const html = renderToStaticMarkup(createElement(AlertManager, {
      stocks: [], alerts: [], events: [], isEn: false,
    }));
    expect(html).toContain('최근 가상 주식 발생 알림 최대 100건 CSV 다운로드');
  });
});
