import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { CandleChart } from './candle-chart';
import type { Candle } from './candle-chart';

const candle = (n: number): Candle => ({
  at: `2026-08-${String(n).padStart(2, '0')}`,
  open_price: '1000',
  high_price: '1100',
  low_price: '900',
  close_price: '1050',
});

const series = (count: number): Candle[] =>
  Array.from({ length: count }, (_, index) => candle(index + 1));

function chart(count: number): SVGSVGElement {
  const { container } = render(<CandleChart candles={series(count)} />);
  const svg = container.querySelector('svg');
  if (!svg) throw new Error('no chart drawn');
  return svg as SVGSVGElement;
}

const centres = (svg: SVGSVGElement): number[] =>
  [...svg.querySelectorAll('line')].map((line) => Number(line.getAttribute('x1')));

describe('CandleChart spacing', () => {
  it('keeps a readable pitch when there are only a few candles', () => {
    // The bug this pins: the slot was the full width divided by the count, so
    // two candles landed 360px apart with 14px of body between them.
    const gaps = centres(chart(2));
    expect(gaps).toHaveLength(2);
    expect((gaps[1] as number) - (gaps[0] as number)).toBe(20);
  });

  it('draws a short series narrow rather than stretching it', () => {
    expect(chart(2).getAttribute('viewBox')).toBe('0 0 260 260');
    // 20 candles at the 20px pitch: 400 wide, not the full frame.
    expect(chart(20).getAttribute('viewBox')).toBe('0 0 400 260');
    // 36 is where 720/n meets the cap; past it the frame is full and the
    // pitch gives way instead of the width growing.
    expect(chart(40).getAttribute('viewBox')).toBe('0 0 720 260');
  });

  it('centres a series too short to fill the figure', () => {
    const gaps = centres(chart(2));
    // 260 wide, 40 drawn: 110 of margin either side, first centre at 120.
    expect(gaps[0]).toBe(120);
  });

  it('shrinks the pitch once the candles outgrow the frame', () => {
    // 720 / 200 is well under the cap, so the slot narrows instead.
    const gaps = centres(chart(200));
    expect((gaps[1] as number) - (gaps[0] as number)).toBeCloseTo(3.6, 5);
    expect(chart(200).getAttribute('viewBox')).toBe('0 0 720 260');
  });

  it('never lets a body vanish, however many candles there are', () => {
    const svg = chart(400);
    for (const rect of svg.querySelectorAll('rect')) {
      expect(Number(rect.getAttribute('width'))).toBeGreaterThanOrEqual(1.5);
    }
  });
});

describe('CandleChart bodies', () => {
  it('fills a session that closed up, not just one that closed down', () => {
    // Korean convention, and the reason the hollow-for-up body went: it read
    // as a candle that was missing something.
    const { container } = render(
      <CandleChart
        candles={[
          { at: '2026-08-01', open_price: '1000', high_price: '1200', low_price: '900', close_price: '1100' },
        ]}
      />,
    );
    const rect = container.querySelector('rect');
    expect(rect?.getAttribute('fill')).toBe('var(--rise)');
  });
});
