import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * DESIGN180 home (plan task 5): page head with actions, a three-cell StatRow
 * from live sources (own balance, market breadth, base rate), then the market
 * table beside notices and next steps. No G1/G2 panels or hero.
 */
const source = readFileSync(join(__dirname, 'page.tsx'), 'utf8');

describe('DESIGN180 home', () => {
  it('opens with the DESIGN180 page head and its actions', () => {
    expect(source).toContain("import { PageHeader } from '@/components/page-header'");
    expect(source).toMatch(/<PageHeader[\s\S]*title="길드 홀"/);
    expect(source).toContain('href="/quests"');
  });

  it('summarises balance, market breadth and listed stocks in one StatRow from live sources', () => {
    expect(source).toContain("import { StatRow } from '@/components/d180/primitives'");
    expect(source).toContain("label: '사용 가능 잔액'");
    expect(source).toContain("label: '오늘 시장'");
    expect(source).toContain("label: '상장 종목'");
  });

  it('never shows the Spring macro-pulse figures, which are hard-coded (3.25% etc.)', () => {
    // Regression 2026-11-25: MacroPulseService.getMacroPulse() returns
    // constants, so production showed an invented 기준금리 3.25%.
    expect(source).not.toContain('macro-pulse');
    expect(source).not.toContain('기준금리');
  });

  it('drops the G1/G2 panel and display styles', () => {
    expect(source).not.toContain('g1-panel');
    expect(source).not.toContain('g2-balance');
    expect(source).not.toContain('g1-display');
  });

  it('keeps Korean rise red and fall blue on movers', () => {
    expect(source).toContain("bp > 0n ? 'text-[var(--g1-ember)]'");
    expect(source).toContain("bp < 0n ? 'text-[var(--g1-rare-rare)]'");
  });
});
