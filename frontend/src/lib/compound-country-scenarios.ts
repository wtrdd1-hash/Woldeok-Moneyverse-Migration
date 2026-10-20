import type { GlobalCompoundPreset } from '@/config/pseo-compound-global.config';
import { formatCountryMoney, moneyCountryForLocale } from './country-money';

export type CompoundLanguage = 'en' | 'ja' | 'zh';
type Example = { initialDeposit: number; monthlyContribution: number };
const LOCAL_EXAMPLES: Record<string, { ja: Example; zh: Example }> = {
  '500-monthly-20-years-8-percent': {
    ja: { initialDeposit: 500000, monthlyContribution: 50000 },
    zh: { initialDeposit: 35000, monthlyContribution: 3500 },
  },
  '1000-monthly-30-years-10-percent': {
    ja: { initialDeposit: 1000000, monthlyContribution: 100000 },
    zh: { initialDeposit: 70000, monthlyContribution: 7000 },
  },
  '10000-initial-10-years-7-percent': {
    ja: { initialDeposit: 1000000, monthlyContribution: 0 },
    zh: { initialDeposit: 70000, monthlyContribution: 0 },
  },
  '200-monthly-15-years-9-percent': {
    ja: { initialDeposit: 100000, monthlyContribution: 20000 },
    zh: { initialDeposit: 7000, monthlyContribution: 1400 },
  },
  'fire-number-1-million-calculator': {
    ja: { initialDeposit: 2500000, monthlyContribution: 250000 },
    zh: { initialDeposit: 175000, monthlyContribution: 17500 },
  },
};

/** Independently chosen local amounts, not spot FX rates or currency conversions. */
export function getCountryCompoundExample(preset: GlobalCompoundPreset, locale: CompoundLanguage): Example {
  if (locale === 'en') return { initialDeposit: preset.initialDeposit, monthlyContribution: preset.monthlyContribution };
  return LOCAL_EXAMPLES[preset.slug]?.[locale] ?? { initialDeposit: 0, monthlyContribution: 0 };
}

export function getCountryCompoundTitle(preset: GlobalCompoundPreset, locale: CompoundLanguage): string {
  const example = getCountryCompoundExample(preset, locale);
  const recurring = example.monthlyContribution > 0;
  const amount = formatCountryMoney(recurring ? example.monthlyContribution : example.initialDeposit, moneyCountryForLocale(locale));
  if (locale === 'en') return preset.titleEn;
  if (locale === 'ja') return recurring
    ? '毎月' + amount + 'を' + preset.years + '年間・年率' + preset.annualRate + '%で積立試算'
    : amount + 'を' + preset.years + '年間・年率' + preset.annualRate + '%で運用する例';
  return recurring
    ? '每月投入' + amount + '，按年化' + preset.annualRate + '%假设计算' + preset.years + '年复利'
    : amount + '单笔投资，按年化' + preset.annualRate + '%假设计算' + preset.years + '年复利';
}

export function getCountryCompoundDescription(locale: CompoundLanguage): string {
  if (locale === 'en') return 'USD illustration based on the chosen amount and assumed annual rate. Actual investment returns and fees may differ.';
  if (locale === 'ja') return '日本円での計算例です。為替換算ではありません。想定利回りは保証されず、手数料・税金を含みません。';
  return '人民币示例计算，不涉及外汇换算；假设收益率不代表保证收益，未计入费用和税费。';
}
