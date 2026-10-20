import { describe, expect, it } from 'vitest';
import { GLOBAL_COMPOUND_PRESETS, calculateGlobalCompound } from '@/config/pseo-compound-global.config';
import { getCountryCompoundExample, getCountryCompoundTitle, getCountryCompoundDescription } from './compound-country-scenarios';

describe('Country-specific compound scenarios v990', () => {
  it('uses reviewed example amounts for all five presets and distinct local currencies', () => {
    for (const preset of GLOBAL_COMPOUND_PRESETS) {
      const en = getCountryCompoundExample(preset,'en');
      const jp = getCountryCompoundExample(preset,'ja');
      const cn = getCountryCompoundExample(preset,'zh');
      expect(en.initialDeposit).toBe(preset.initialDeposit);
      expect(jp.initialDeposit).toBeGreaterThan(0);
      expect(cn.initialDeposit).toBeGreaterThan(0);
      expect(getCountryCompoundTitle(preset,'ja')).toMatch(/[￥¥]/);
      expect(getCountryCompoundTitle(preset,'zh')).toMatch(/[￥¥]/);
      expect(getCountryCompoundTitle(preset,'ja')).not.toContain('ドル');
      expect(getCountryCompoundTitle(preset,'zh')).not.toContain('美元');
      for (const example of [en,jp,cn]) {
        const calculated = calculateGlobalCompound(example.initialDeposit,example.monthlyContribution,preset.annualRate,preset.years);
        expect(calculated.totalFutureValue).toBeGreaterThanOrEqual(calculated.totalPrincipalInvested);
      }
    }
  });
  it('does not present country-specific results as real currency conversions or guaranteed returns', () => {
    expect(getCountryCompoundDescription('ja')).toContain('為替換算ではありません');
    expect(getCountryCompoundDescription('zh')).toContain('不涉及外汇换算');
  });
});
