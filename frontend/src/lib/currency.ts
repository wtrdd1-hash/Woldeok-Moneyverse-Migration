import type { Locale } from './locale';
import { canonicalIntegerString, groupDigits } from './money';

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
      vi: 'Won Hàn Quốc (KRW)',
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
      vi: 'Đô la Mỹ (USD)',
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
      vi: 'Yên Nhật (JPY)',
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
      vi: 'Nhân dân tệ (CNY)',
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
    case 'vi':
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
  if (canonical === null) return Number.NaN;

  const config = CURRENCY_CONFIG[currency] ?? CURRENCY_CONFIG.KRW;
  const wldValue = Number(canonical);
  // A rounded JavaScript double must never masquerade as an exact balance.
  if (!Number.isSafeInteger(wldValue)) return Number.NaN;

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
  if (!Number.isFinite(amount)) return '—';
  const config = CURRENCY_CONFIG[currency] ?? CURRENCY_CONFIG.KRW;
  const absAmount = Math.abs(amount);
  const sign = amount < 0 ? '−' : '';

  const formattedNumber = new Intl.NumberFormat(
    locale === 'ko' ? 'ko-KR' : locale === 'ja' ? 'ja-JP' : locale === 'zh' ? 'zh-CN' : locale === 'vi' ? 'vi-VN' : 'en-US',
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

  const fiatStr = formatFiatFromWld(canonical, currency, locale);
  if (fiatStr === '—') return '—';

  if (currency === 'KRW') {
    return `${fiatStr} (WLD)`;
  }

  return `≈ ${fiatStr} ${currency}`;
}

/**
 * Exact WLD-to-fiat display. Configured WLD rates are whole integers; perform
 * rounding in BigInt minor units and group canonical digits as text. Never
 * route stored balances through Number(), even for a display-only estimate.
 * Rates are a presentation approximation, not an executable FX quote.
 */
export function formatFiatFromWld(
  wldAmount: unknown,
  currency: Currency = 'KRW',
  _locale: Locale = 'ko',
): string {
  const canonical = canonicalIntegerString(wldAmount);
  if (canonical === null) return '—';
  const config = CURRENCY_CONFIG[currency] ?? CURRENCY_CONFIG.KRW;
  if (!Number.isSafeInteger(config.rateAgainstWld) || config.rateAgainstWld <= 0 ||
      !Number.isSafeInteger(config.decimals) || config.decimals < 0 || config.decimals > 20) return '—';
  const negative = canonical.startsWith('-');
  const magnitude = BigInt(negative ? canonical.slice(1) : canonical);
  const denominator = BigInt(config.rateAgainstWld);
  const scale = 10n ** BigInt(config.decimals);
  const inMinorUnits = (magnitude * scale * 2n + denominator) / (denominator * 2n);
  const major = groupDigits((inMinorUnits / scale).toString());
  const minor = config.decimals > 0
    ? `.${(inMinorUnits % scale).toString().padStart(config.decimals, '0')}`
    : '';
  const symbol = currency === 'USD' ? '$' : currency === 'KRW' ? '' : '¥';
  const suffix = currency === 'KRW' ? '원' : '';
  const sign = negative && inMinorUnits !== 0n ? '−' : '';
  return `${sign}${symbol}${major}${minor}${suffix}`;
}
