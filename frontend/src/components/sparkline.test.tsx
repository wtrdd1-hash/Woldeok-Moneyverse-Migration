import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Sparkline } from './sparkline';

/**
 * The figure is 40px tall, so a series that gets the whole band is drawn 40
 * tall and one that moved a tenth of the band is drawn 4.
 */
const HEIGHT = 40;

/** Prices as the API hands them over: most recent first. */
function draw(prices: readonly number[]): { readonly ys: number[]; readonly drawn: number } {
  const { container } = render(
    <Sparkline points={prices.map((price) => ({ price: String(price) }))} direction="rise" />,
  );
  const d = container.querySelector('path')?.getAttribute('d') ?? '';
  const ys = [...d.matchAll(/,(-?[\d.]+)/g)].map((match) => Number(match[1]));
  return { ys, drawn: Math.max(...ys) - Math.min(...ys) };
}

describe('Sparkline scale', () => {
  it('draws a quiet hour quietly', () => {
    // The bug this pins: normalising to the series' own extremes gave every
    // line the full height of the figure, so an hour in which a 1,000 WLD
    // stock moved a single WLD -- a tenth of a percent, which is what 124's
    // walk does in a calm hour -- was drawn as a saw across the whole card
    // and read as a market coming apart.
    const { drawn } = draw([1000, 1001, 1000, 1001, 1000, 1001]);
    // One percent of 1,000 is the band; the series used a tenth of it.
    expect(drawn).toBeCloseTo(HEIGHT / 10, 1);
  });

  it('gives the whole height to a move worth it', () => {
    const { drawn } = draw([1100, 1075, 1050, 1025, 1000]);
    expect(drawn).toBeCloseTo(HEIGHT, 1);
  });

  it('holds a series that barely moved across the middle', () => {
    // Not along the floor or the ceiling: a line pinned to an edge reads as a
    // price at an extreme, which is the opposite of what it did.
    const { ys } = draw([1000, 1001, 1000, 1001]);
    for (const y of ys) {
      expect(Math.abs(y - HEIGHT / 2)).toBeLessThanOrEqual(HEIGHT / 8);
    }
  });

  it('draws the newest price at the right-hand end', () => {
    // The points arrive most recent first and a chart reads left to right.
    const { ys } = draw([1100, 1000]);
    expect(ys[ys.length - 1]).toBeLessThan(ys[0] as number);
  });

  it('draws nothing at all rather than a point', () => {
    const { container } = render(<Sparkline points={[{ price: '1000' }]} direction={null} />);
    expect(container.querySelector('path')).toBeNull();
  });
});
