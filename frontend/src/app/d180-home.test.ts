import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { TRANSLATIONS } from '@/lib/translations';

/**
 * DESIGN180 home (plan task 5): page head with actions, a three-cell StatRow
 * from live sources (own balance, market breadth, base rate), then the market
 * table beside notices and next steps. No G1/G2 panels or hero.
 */
const source = readFileSync(join(__dirname, 'page.tsx'), 'utf8');

describe('DESIGN180 home', () => {
  it('opens with the DESIGN180 page head and its actions', () => {
    expect(source).toContain("import { PageHeader } from '@/components/page-header'");
    // Localised through the catalog since I18N-01 (2026-11-26); Korean copy unchanged.
    expect(source).toMatch(/<PageHeader[\s\S]*title=\{t\('title\.guildHall', locale\)\}/);
    expect(TRANSLATIONS['title.guildHall']?.ko).toBe('길드 홀');
    expect(source).toContain('href="/quests"');
  });

  it('summarises balance, market breadth and listed stocks in one StatRow from live sources', () => {
    expect(source).toContain("import { StatRow } from '@/components/d180/primitives'");
    expect(source).toContain("label: t('home.available', locale)");
    expect(source).toContain("label: t('home.todayMarket', locale)");
    expect(source).toContain("label: t('home.listed', locale)");
    expect(TRANSLATIONS['home.available']?.ko).toBe('사용 가능 잔액');
    expect(TRANSLATIONS['home.todayMarket']?.ko).toBe('오늘 시장');
    expect(TRANSLATIONS['home.listed']?.ko).toBe('상장 종목');
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
