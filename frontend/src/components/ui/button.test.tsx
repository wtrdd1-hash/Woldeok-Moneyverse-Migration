import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Button } from './button';

describe('Button semantic fintech variants', () => {
  it('renders stepup, killswitch, trading-buy, trading-sell, and surface variants', () => {
    const stepupHtml = renderToStaticMarkup(
      <Button variant="stepup" shortcutHint="Ctrl+Enter">
        즉시 승인
      </Button>,
    );
    expect(stepupHtml).toContain('data-variant="stepup"');
    expect(stepupHtml).toContain('bg-amber-500');
    expect(stepupHtml).toContain('Ctrl+Enter');

    const killHtml = renderToStaticMarkup(
      <Button variant="killswitch">긴급 중단</Button>,
    );
    expect(killHtml).toContain('data-variant="killswitch"');
    expect(killHtml).toContain('border-rose-500/80');

    const buyHtml = renderToStaticMarkup(<Button variant="trading-buy">매수</Button>);
    expect(buyHtml).toContain('bg-red-500');

    const sellHtml = renderToStaticMarkup(<Button variant="trading-sell">매도</Button>);
    expect(sellHtml).toContain('bg-blue-500');
  });

  it('disables button and hides shortcut hint while loading', () => {
    const html = renderToStaticMarkup(
      <Button variant="stepup" isLoading shortcutHint="Ctrl+Enter">
        처리 중
      </Button>,
    );
    expect(html).toContain('disabled=""');
    expect(html).toContain('animate-spin');
    expect(html).not.toContain('<kbd');
  });
});
