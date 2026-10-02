import type { Locale } from './locale';
import { canonicalIntegerString } from './money';

export type Currency = 'KRW' | 'USD' | 'JPY' | 'CNY';

export const CURRENCY_COOKIE = 'wdmv_currency';
export const DEFAULT_CURRENCY: Currency = 'KRW';

export interface CurrencyMeta {
  readonly code: Currency;
  readonly symbol: string;
  readonly name: Record<Locale, string>;
  readonly rateAgainstWld: number; // How many WLD per 1 unit of Fiat
  readonly decimals: number;
}

/**
 * Authoritative Currency Conversion Table (SSOT)
 * 1 WLD = 1 KRW base.
 */
export const CURRENCY_CONFIG: Record<Currency, CurrencyMeta> = {
  KRW: {
    code: 'KRW',
    symbol: '₩',
    name: {
      ko: '대한민국 원 (KRW)',
      en: 'Korean Won (KRW)',
      ja: '韓国ウォン (KRW)',
      zh: '韩元 (KRW)',
    },
    rateAgainstWld: 1.0,
    decimals: 0,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: {
      ko: '미국 달러 (USD)',
      en: 'US Dollar (USD)',
      ja: '米ドル (USD)',
      zh: '美元 (USD)',
    },
    rateAgainstWld: 1350.0,
    decimals: 2,
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: {
      ko: '일본 엔 (JPY)',
      en: 'Japanese Yen (JPY)',
      ja: '日本円 (JPY)',
      zh: '日元 (JPY)',
    },
    rateAgainstWld: 9.0,
    decimals: 0,
  },
  CNY: {
    code: 'CNY',
    symbol: '¥',
    name: {
      ko: '중국 위안 (CNY)',
      en: 'Chinese Yuan (CNY)',
      ja: '中国人民元 (CNY)',
      zh: '人民币 (CNY)',
    },
    rateAgainstWld: 190.0,
    decimals: 2,
  },
};

export const ALL_CURRENCIES: readonly Currency[] = ['KRW', 'USD', 'JPY', 'CNY'];

export function isCurrency(value: unknown): value is Currency {
  return typeof value === 'string' && ALL_CURRENCIES.includes(value as Currency);
}

export function getLocaleDefaultCurrency(locale: Locale): Currency {
  switch (locale) {
    case 'en':
      return 'USD';
    case 'ja':
      return 'JPY';
    case 'zh':
      return 'CNY';
    case 'ko':
    default:
      return 'KRW';
  }
}

/**
 * Converts a WLD amount (canonical integer string) to a floating-point Fiat value.
 */
export function convertWldToFiat(wldAmount: unknown, currency: Currency = 'KRW'): number {
  const canonical = canonicalIntegerString(wldAmount);
  if (canonical === null) return 0;

  const config = CURRENCY_CONFIG[currency] ?? CURRENCY_CONFIG.KRW;
  const wldValue = Number(canonical);
  if (!Number.isFinite(wldValue)) return 0;

  return wldValue / config.rateAgainstWld;
}

/**
 * Formats a Fiat amount with currency symbol and localized digit grouping.
 */
export function formatFiat(
  amount: number,
  currency: Currency = 'KRW',
  locale: Locale = 'ko',
): string {
  const config = CURRENCY_CONFIG[currency] ?? CURRENCY_CONFIG.KRW;
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '−' : '';

  const formattedNumber = new Intl.NumberFormat(
    locale === 'ko' ? 'ko-KR' : locale === 'ja' ? 'ja-JP' : locale === 'zh' ? 'zh-CN' : 'en-US',
    {
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
    },
  ).format(absAmount);

  if (currency === 'USD') {
    return `${sign}$${formattedNumber}`;
  }
  if (currency === 'JPY' || currency === 'CNY') {
    return `${sign}¥${formattedNumber}`;
  }
  return `${sign}${formattedNumber}원`;
}

/**
 * Helper to produce a full bilingual representation:
 * e.g., "1,250,000 WLD (≈ $925.92 USD)"
 */
export function formatWldWithFiat(
  wldAmount: unknown,
  currency: Currency = 'KRW',
  locale: Locale = 'ko',
): string {
  const canonical = canonicalIntegerString(wldAmount);
  if (canonical === null) return '—';

  const fiatValue = convertWldToFiat(canonical, currency);
  const fiatStr = formatFiat(fiatValue, currency, locale);

  if (currency === 'KRW') {
    return `${fiatStr} (WLD)`;
  }

  return `≈ ${fiatStr} ${currency}`;
}
