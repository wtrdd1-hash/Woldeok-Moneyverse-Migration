import { describe, expect, it } from 'vitest';
import {
  convertWldToFiat,
  formatFiat,
  formatWldWithFiat,
  getLocaleDefaultCurrency,
  isCurrency,
} from './currency';

describe('currency conversion engine', () => {
  it('validates currency identifiers correctly', () => {
    expect(isCurrency('KRW')).toBe(true);
    expect(isCurrency('USD')).toBe(true);
    expect(isCurrency('JPY')).toBe(true);
    expect(isCurrency('CNY')).toBe(true);
    expect(isCurrency('EUR')).toBe(false);
    expect(isCurrency(null)).toBe(false);
  });

  it('maps locales to default currencies', () => {
    expect(getLocaleDefaultCurrency('ko')).toBe('KRW');
    expect(getLocaleDefaultCurrency('en')).toBe('USD');
    expect(getLocaleDefaultCurrency('ja')).toBe('JPY');
    expect(getLocaleDefaultCurrency('zh')).toBe('CNY');
  });

  it('converts WLD to fiat values accurately', () => {
    // 1 USD = 1350 WLD
    expect(convertWldToFiat('1350', 'USD')).toBeCloseTo(1.0, 4);
    expect(convertWldToFiat('1350000', 'USD')).toBeCloseTo(1000.0, 4);

    // 1 JPY = 9 WLD
    expect(convertWldToFiat('900', 'JPY')).toBeCloseTo(100.0, 4);

    // 1 CNY = 190 WLD
    expect(convertWldToFiat('19000', 'CNY')).toBeCloseTo(100.0, 4);

    // 1 KRW = 1 WLD
    expect(convertWldToFiat('50000', 'KRW')).toBe(50000);
  });

  it('formats fiat currency correctly with symbols and localization', () => {
    expect(formatFiat(1000.5, 'USD', 'en')).toBe('$1,000.50');
    expect(formatFiat(1234, 'JPY', 'ja')).toBe('¥1,234');
    expect(formatFiat(567.8, 'CNY', 'zh')).toBe('¥567.80');
    expect(formatFiat(50000, 'KRW', 'ko')).toBe('50,000원');
  });

  it('formats bilingual WLD with fiat text', () => {
    expect(formatWldWithFiat('1350000', 'USD', 'en')).toBe('≈ $1,000.00 USD');
    expect(formatWldWithFiat('9000', 'JPY', 'ja')).toBe('≈ ¥1,000 JPY');
    expect(formatWldWithFiat('190000', 'CNY', 'zh')).toBe('≈ ¥1,000.00 CNY');
    expect(formatWldWithFiat('10000', 'KRW', 'ko')).toBe('10,000원 (WLD)');
  });
});
