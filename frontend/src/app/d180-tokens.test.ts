import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * DESIGN180 (PR #3443, owner-approved spec 2026-11-24) token values, with the
 * owner corrections: Korean rise red / fall blue, radii capped at 8px.
 * The token file is imported last and remaps every legacy colour, so these
 * values are what all 180 routes render.
 */
const css = readFileSync(join(__dirname, 'g1-tokens.css'), 'utf8');

function token(name: string): string | undefined {
  return css.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1]?.trim();
}

describe('DESIGN180 tokens', () => {
  it.each([
    ['--g1-night', '#0c1020'],
    ['--g1-night-2', '#0f1425'],
    ['--g1-plum', '#141b2e'],
    ['--g1-plum-2', '#1b2440'],
    ['--g1-line', '#2d3753'],
    ['--g1-violet', '#a98aff'],
    ['--g1-ink', '#f3f5fc'],
    ['--g1-muted', '#b9c3d9'],
    ['--g1-ember', '#ff5d73'],
    ['--g1-rare-rare', '#4ba3ff'],
    ['--g1-mint', '#67d8b2'],
    ['--g1-gold', '#f6cf87'],
  ])('%s is %s', (name, value) => {
    expect(token(name)).toBe(value);
  });

  it('caps rounded panels at 8px inside main', () => {
    expect(css).toMatch(/\.rounded-2xl[^{]*\{\s*border-radius:\s*8px/);
  });

  it('names DESIGN180 as the active reference', () => {
    expect(css.slice(0, 400)).toContain('DESIGN180');
  });
});
