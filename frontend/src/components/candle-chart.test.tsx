import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { CandleChart, axisTicks } from './candle-chart';
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

/**
 * jsdom lays nothing out, so the frame measures zero and the chart falls back
 * to the 720px it assumes until a real browser tells it otherwise. Every
 * figure below is against that frame.
 */
const FRAME = 720;

describe('CandleChart spacing', () => {
  it('keeps a readable pitch when there are only a few candles', () => {
    // The bug this pins: the slot was the full width divided by the count, so
    // two candles landed 360px apart with 14px of body between them.
    const gaps = centres(chart(2));
    expect(gaps).toHaveLength(2);
    expect((gaps[1] as number) - (gaps[0] as number)).toBe(20);
  });

  it('draws a short series narrow rather than stretching it', () => {
    // The figure is the frame either way; what stays narrow is the drawing
    // inside it. Two candles at the 20px pitch occupy 40 of the 720.
    expect(chart(2).getAttribute('viewBox')).toBe(`0 0 ${FRAME} 260`);
    const twenty = centres(chart(20));
    expect((twenty[19] as number) - (twenty[0] as number)).toBe(19 * 20);
    // 36 is where 720/n meets the cap; past it the pitch gives way.
    const forty = centres(chart(40));
    expect((forty[1] as number) - (forty[0] as number)).toBe(18);
  });

  it('centres a series too short to fill the figure', () => {
    const gaps = centres(chart(2));
    // 720 wide, 40 drawn: 340 of margin either side, first centre at 350.
    expect(gaps[0]).toBe(350);
  });

  it('drops the oldest candles rather than thinning past readable', () => {
    // The bug this pins: the frame was the only bound, so 200 candles came out
    // at a 3.6px pitch with a 2px body and the chart read as a dashed rule.
    const gaps = centres(chart(200));
    expect((gaps[1] as number) - (gaps[0] as number)).toBe(9);
    // 720 of frame at that pitch holds eighty, and the eighty it keeps are
    // the newest — a reader opened the chart for the right-hand end of it.
    expect(gaps).toHaveLength(80);
  });

  it('says which candles those are', () => {
    const { container } = render(<CandleChart candles={series(200)} />);
    // The caption names the ends of what is drawn, not of what was passed.
    expect(container.textContent).toContain('2026-08-121');
    expect(container.textContent).toContain('2026-08-200');
    expect(container.textContent).not.toContain('2026-08-120');
  });

  it('never draws wider than its frame', () => {
    // The bug this pins: the drawing grew past the frame and the frame
    // scrolled sideways, which inside a dialog dragged the dialog's own text
    // out of the box and put a horizontal scrollbar across it.
    const svg = chart(200);
    expect(svg.style.width).toBe('');
    expect(svg.getAttribute('viewBox')).toBe(`0 0 ${FRAME} 260`);
    expect(svg.getAttribute('class')).toContain('w-full');
    const frame = svg.parentElement;
    expect(frame?.className).not.toContain('overflow-x');
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

describe('axisTicks', () => {
  it('steps by 1, 2, 2.5 or 5 times a power of ten, about four times across the range', () => {
    // The screenshot's range: 98,091 to 101,824 wants thousands.
    expect(axisTicks(98_091n, 101_824n, false)).toEqual([99_000n, 100_000n, 101_000n]);
    expect(axisTicks(900n, 1100n, false)).toEqual([900n, 950n, 1000n, 1050n, 1100n]);
    // 2.5 earns its place: 0..1000 in fours is 250, not 200 or 500.
    expect(axisTicks(0n, 1000n, false)).toEqual([0n, 250n, 500n, 750n, 1000n]);
  });

  it('marks 1, 2 and 5 of each decade on a log axis', () => {
    expect(axisTicks(10n, 1211n, true)).toEqual([10n, 20n, 50n, 100n, 200n, 500n, 1000n]);
  });

  it('thins a log axis to its decades when there are too many to read', () => {
    expect(axisTicks(1n, 10_000_000n, true)).toEqual([1n, 10n, 100n, 1000n, 10_000n, 100_000n, 1_000_000n, 10_000_000n]);
  });

  it('reads a range past 2^53 without rounding it', () => {
    const ticks = axisTicks(9_007_199_254_740_990n, 9_007_199_254_741_010n, false);
    expect(ticks).toEqual([9_007_199_254_740_990n, 9_007_199_254_740_995n, 9_007_199_254_741_000n, 9_007_199_254_741_005n, 9_007_199_254_741_010n]);
  });
});

describe('CandleChart axis', () => {
  it('writes a figure beside every rule, at the same height', () => {
    const { container } = render(<CandleChart candles={series(5)} />);
    // series(): every candle spans 900 to 1100.
    const labels = [...container.querySelectorAll('text')].map((node) => node.textContent);
    expect(labels).toEqual(['900', '950', '1,000', '1,050', '1,100']);

    const rules = [...container.querySelectorAll('path')].map((node) => node.getAttribute('d'));
    const heights = [...container.querySelectorAll('text')].map((node) => Number(node.getAttribute('y')) - 3.5);
    expect(rules).toHaveLength(labels.length);
    rules.forEach((d, index) => {
      expect(d).toBe(`M0 ${heights[index]} H ${FRAME}`);
    });
  });

  it('keeps the figures in a column of their own', () => {
    // The rules are drawn across the candles and their figures are not: a
    // number written over a candle is a number a reader has to subtract the
    // candle from.
    const { container } = render(<CandleChart candles={series(200)} />);
    const [drawing, axis] = [...container.querySelectorAll('svg')];
    expect(drawing?.querySelectorAll('text')).toHaveLength(0);
    expect(axis?.querySelectorAll('text').length).toBeGreaterThan(0);
    expect(drawing?.contains(axis ?? null)).toBe(false);
  });
});
