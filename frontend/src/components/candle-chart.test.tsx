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

  it('draws wider than the frame rather than thinning past readable', () => {
    // The bug this pins: the frame was the only bound, so 200 candles came out
    // at a 3.6px pitch with a 2px body and the chart read as a dashed rule.
    const gaps = centres(chart(200));
    expect((gaps[1] as number) - (gaps[0] as number)).toBe(9);
    expect(chart(200).getAttribute('viewBox')).toBe('0 0 1800 260');
  });

  it('lets the drawing be as wide as it needs to be', () => {
    // Capping the rendered width at the container scaled the whole drawing
    // back down, which is the squeeze the pitch floor exists to prevent.
    expect(chart(200).style.maxWidth).toBe('');
    expect(chart(200).style.width).toBe('1800px');
  });

  it('never lets a body vanish, however many candles there are', () => {
    const svg = chart(400);
    for (const rect of svg.querySelectorAll('rect')) {
      expect(Number(rect.getAttribute('width'))).toBeGreaterThanOrEqual(1.5);
    }
  });
});

describe('CandleChart scale', () => {
  const at = (n: number) => `2026-08-${String(n).padStart(2, '0')}`;
  const flat = (n: number): Candle => ({
    at: at(n),
    open_price: '10',
    high_price: '11',
    low_price: '10',
    close_price: '10',
  });

  /** How tall each candle's wick is drawn: the low-to-high span, in pixels. */
  const wicks = (candles: Candle[]): number[] => {
    const { container } = render(<CandleChart candles={candles} />);
    return [...container.querySelectorAll('line')].map(
      (line) => Number(line.getAttribute('y2')) - Number(line.getAttribute('y1')),
    );
  };

  it('stays linear while the range is narrow', () => {
    const { container } = render(<CandleChart candles={series(5)} />);
    expect(container.textContent).not.toContain('로그 눈금');
  });

  /**
   * The screenshot this comes from: one bucket went from 10 to 1,211 and the
   * hundred flat candles beside it collapsed into a dashed line along the
   * floor. A linear axis has to give the whole height to the largest move in
   * view; a log one draws a move from 10 to 20 the same height as one from
   * 1000 to 2000, which is what a price actually is.
   */
  it('turns logarithmic when one candle dwarfs the rest', () => {
    const spiked = [
      ...Array.from({ length: 5 }, (_, index) => flat(index + 1)),
      { at: at(6), open_price: '10', high_price: '1211', low_price: '10', close_price: '1211' },
    ];
    const { container } = render(<CandleChart candles={spiked} />);
    expect(container.textContent).toContain('로그 눈금');
  });

  it('gives the quiet candles a visible height once it does', () => {
    const quiet = Array.from({ length: 5 }, (_, index) => flat(index + 1));
    const spike = {
      at: at(6),
      open_price: '10',
      high_price: '1211',
      low_price: '10',
      close_price: '1211',
    };

    // Same candles, once with the spike in view and once without. The spike is
    // what forces the axis to cover two decades.
    const withSpike = wicks([...quiet, spike])[0]!;
    const alone = wicks([...quiet, flat(6)])[0]!;

    // Linear, that 10-to-11 wick is 1/1201 of the plot — under a quarter of a
    // pixel, which is the dashed rule in the screenshot.
    const linearHeight = ((11 - 10) / (1211 - 10)) * (260 - 16 * 2);
    expect(linearHeight).toBeLessThan(0.25);

    expect(withSpike).toBeGreaterThan(4);
    // Without the spike the axis covers only 10 to 11, so the same wick fills
    // the plot. The point is not that it is tall; it is that it survives.
    expect(alone).toBeGreaterThan(withSpike);
  });

  it('reads a price past 2^53 without rounding it', () => {
    // A price is a numeric(38,0). Number() rounds silently past 2^53, which on
    // a log axis would put two decades at the same height.
    const huge = [
      { at: at(1), open_price: '10', high_price: '10', low_price: '10', close_price: '10' },
      {
        at: at(2),
        open_price: '10',
        high_price: '1014082300000000000000',
        low_price: '10',
        close_price: '1014082300000000000000',
      },
    ];
    const { container } = render(<CandleChart candles={huge} />);
    expect(container.textContent).toContain('로그 눈금');
    for (const rect of container.querySelectorAll('rect')) {
      expect(Number.isFinite(Number(rect.getAttribute('y')))).toBe(true);
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
