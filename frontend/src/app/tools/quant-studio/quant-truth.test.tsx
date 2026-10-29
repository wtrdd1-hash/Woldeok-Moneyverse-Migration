import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import QuantStudioLayout, { metadata } from './layout';

describe('quant studio public disclosure', () => {
  it('does not claim historical market backtesting or real automatic execution in metadata', () => {
    expect(metadata.description).toContain('예시');
    expect(metadata.description).not.toContain('과거 시세');
    expect(metadata.description).not.toContain('정밀 백테스팅');
  });
  it('does not promise automatic real order execution in FAQ structured data', () => {
    const html = renderToStaticMarkup(QuantStudioLayout({ children: null }));
    expect(html).not.toContain('자동으로 매수/매도 주문을 체결합니다');
    expect(html).toContain('실제');
  });
});
