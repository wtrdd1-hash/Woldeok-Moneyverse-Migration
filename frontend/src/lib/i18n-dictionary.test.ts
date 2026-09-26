import { describe, expect, it } from 'vitest';
import { I18N_DICTIONARY, t } from './i18n-dictionary';
import { SUPPORTED_LOCALES } from './locale';

describe('I18N_DICTIONARY Master Coverage & Integrity', () => {
  it('ensures all dictionary entries have non-empty translations for all 4 supported locales', () => {
    const keys = Object.keys(I18N_DICTIONARY);
    expect(keys.length).toBeGreaterThan(30);

    for (const key of keys) {
      const entry = I18N_DICTIONARY[key];
      expect(entry).toBeDefined();
      if (entry) {
        for (const loc of SUPPORTED_LOCALES) {
          expect(entry[loc]).toBeDefined();
          expect(typeof entry[loc]).toBe('string');
          expect(entry[loc].trim().length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('translates navigation and core financial terms seamlessly', () => {
    expect(t('nav.stocks', 'ko')).toBe('가상 주식 거래소');
    expect(t('nav.stocks', 'en')).toBe('Virtual Stock Exchange');
    expect(t('nav.stocks', 'ja')).toBe('仮想株式取引所');
    expect(t('nav.stocks', 'zh')).toBe('虚拟股票交易所');

    expect(t('stocks.orderbook', 'en')).toBe('Real-time 10-Depth Orderbook');
    expect(t('bank.compound_interest', 'ja')).toBe('複利利率');
    expect(t('casino.dice', 'zh')).toBe('骰子大作战 (Dice)');
  });

  it('provides safe fallbacks for missing translation keys', () => {
    expect(t('non.existent.key', 'en', 'Default Text')).toBe('Default Text');
    expect(t('non.existent.key', 'ko')).toBe('non.existent.key');
  });
});
