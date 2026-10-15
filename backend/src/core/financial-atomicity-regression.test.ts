import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('critical financial flows must use one DB connection throughout settlement', () => {
  it.each([
    'src/casino/pvp-arena.repository.ts',
    'src/marketplace/black-market.repository.ts',
  ])('%s uses transaction helper and never writes standalone during settlement', f => {
    const s = readFileSync(f, 'utf8');
    expect(s).toContain('withPgTransaction');
  });
});
