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

describe('DESIGN180 tokens (passbook redesign, owner direction 2026-11-26)', () => {
  it.each([
    ['--g1-night', '#0a1428'],
    ['--g1-night-2', '#0c1830'],
    ['--g1-plum', '#11203c'],
    ['--g1-plum-2', '#172a4b'],
    ['--g1-line', '#283d63'],
    ['--g1-violet', '#a98aff'],
    ['--g1-violet-ink', '#6a4cdb'],
    ['--g1-ink', '#f3f5fa'],
    ['--g1-muted', '#b0bbcd'],
    ['--g1-ember', '#ff5d6c'],
    ['--g1-rare-rare', '#5aa9ff'],
    ['--g1-mint', '#6fd3ae'],
    ['--g1-gold', '#f0d08a'],
    ['--mv-page', '#f5efdf'],
    ['--mv-seal', '#d9472e'],
  ])('%s is %s', (name, value) => {
    expect(token(name)).toBe(value);
  });

  it('keeps Korean rise red / fall blue', () => {
    expect(token('--rise')).toBe('var(--g1-ember)');
    expect(token('--fall')).toBe('var(--g1-rare-rare)');
  });

  // v2026.11.27.1101.1: G2 is the common baseline. Common actions are violet; the
  // 11-26 passbook gold stays as decorative foil (date stamp, own balance), never an action.
  it('keeps common actions violet and passbook gold decorative', () => {
    expect(token('--primary')).toBe('var(--g1-violet)');
    expect(token('--primary-foreground')).toBe('var(--g1-night)');
    expect(token('--sidebar-primary-foreground')).toBe('var(--g1-night)');
    expect(token('--mv-foil')).toBe('var(--g1-gold)');
    expect(css).not.toMatch(/--color-violet-400:\s*#dcb873/);
    expect(css).not.toMatch(/--color-purple-400:\s*#dcb873/);
    expect(css).not.toMatch(/html:root \.g1-cta\s*\{[^}]*gold/);
  });

  it('caps rounded panels at 8px inside main', () => {
    expect(css).toMatch(/\.rounded-2xl[^{]*\{\s*border-radius:\s*8px/);
  });

  it('names DESIGN180 as the active reference', () => {
    expect(css.slice(0, 400)).toContain('DESIGN180');
  });
});
