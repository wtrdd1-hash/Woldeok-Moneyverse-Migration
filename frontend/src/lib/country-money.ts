/**
 * Country is not the same as language: these are documented default country
 * editions for the four current public search locales. Never relabel KRW input
 * as USD/JPY/CNY or claim live foreign-exchange conversions.
 */
export const MONEY_COUNTRIES = {
  KR: { currency: 'KRW', locale: 'ko-KR', principal: 200_000_000 },
  US: { currency: 'USD', locale: 'en-US', principal: 200_000 },
  JP: { currency: 'JPY', locale: 'ja-JP', principal: 20_000_000 },
  CN: { currency: 'CNY', locale: 'zh-CN', principal: 1_000_000 },
} as const;

export type MoneyCountry = keyof typeof MONEY_COUNTRIES;

export function moneyCountryForLocale(locale: 'ko' | 'en' | 'ja' | 'zh'): MoneyCountry {
  return ({ ko: 'KR', en: 'US', ja: 'JP', zh: 'CN' } as const)[locale];
}

export function formatCountryMoney(amount: number, country: MoneyCountry): string {
  const setting = MONEY_COUNTRIES[country];
  return new Intl.NumberFormat(setting.locale, {
    style: 'currency', currency: setting.currency, currencyDisplay: 'symbol',
  }).format(amount);
}
