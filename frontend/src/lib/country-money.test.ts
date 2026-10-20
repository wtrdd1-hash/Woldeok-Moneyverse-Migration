import { describe, expect, it } from 'vitest';
import { formatCountryMoney, MONEY_COUNTRIES, moneyCountryForLocale } from './country-money';
import { calculateLoan } from '../app/[locale]/tools/loan-interest-calculator/localized-loan-calculator';

describe('country currency + calculation boundaries v990', () => {
  it('selects country edition currency defaults, not KRW for all pages', () => {
    expect(['ko','en','ja','zh'].map(x => MONEY_COUNTRIES[moneyCountryForLocale(x as 'ko' | 'en' | 'ja' | 'zh')].currency)).toEqual(['KRW','USD','JPY','CNY']);
  });
  it('formats proper currency minor units and currency codes', () => {
    expect(formatCountryMoney(1200.5,'US')).toMatch(/1,200\.50/);
    expect(formatCountryMoney(1200.5,'JP')).not.toMatch(/\.50/);
    expect(formatCountryMoney(1200.5,'CN')).toMatch(/1,200\.50/);
  });
  it('calculates amortization for different selected denominations without FX guesswork', () => {
    const u = calculateLoan(200000,4,30,'fixed');
    const j = calculateLoan(20000000,4,30,'fixed');
    expect(u?.first).toBeGreaterThan(900);
    expect(u?.totalInterest).toBeGreaterThan(0);
    expect(j?.first).toBeCloseTo((u?.first ?? 0)*100,4);
  });
  it('guards against invalid terms, negative rates and invalid amounts', () => {
    expect(calculateLoan(-1,4,30,'fixed')).toBeNull();
    expect(calculateLoan(100000,40,30,'fixed')).toBeNull();
    expect(calculateLoan(100000,4,0,'fixed')).toBeNull();
  });
});
