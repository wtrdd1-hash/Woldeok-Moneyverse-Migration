import type { Locale } from './locale';

/** Human-reviewed glossary math; never render unreviewed Hangul formulas in foreign SEO snippets. */
const LOCALIZED_FORMULAS: Record<string, Partial<Record<Locale, string>>> = {
  'operating-margin': {
    en: 'Operating margin = Operating profit / Revenue × 100%',
    ja: '営業利益率 = 営業利益 ÷ 売上高 × 100%',
    zh: '营业利润率 = 营业利润 ÷ 营业收入 × 100%',
  },
  'dividend-yield': {
    en: 'Dividend yield = Annual dividends per share / Share price × 100%',
    ja: '配当利回り = 1株当たり年間配当金 ÷ 株価 × 100%',
    zh: '股息率 = 每股年度股息 ÷ 当前股价 × 100%',
  },
  cagr: {
    en: 'CAGR = (Ending value / Beginning value)^(1 / Years) − 1',
    ja: '年平均成長率 = (最終価値 ÷ 初期価値)^(1 ÷ 年数) − 1',
    zh: '年复合增长率 = (期末价值 ÷ 期初价值)^(1 ÷ 年数) − 1',
  },
  'dividend-income-tax': {
    en: 'Korean resident withholding example = Gross dividend × 15.4% (rules vary)',
    ja: '韓国居住者の源泉徴収例 = 配当金総額 × 15.4%（条件により異なる）',
    zh: '韩国居民预扣税示例 = 股息总额 × 15.4%（依具体情况而定）',
  },
};

export function getLocalizedGlossaryFormula(slug: string, locale: Locale, source?: string): string | null {
  if (locale === 'ko') return source ?? null;
  if (LOCALIZED_FORMULAS[slug]?.[locale]) return LOCALIZED_FORMULAS[slug]![locale]!;
  // A symbol-only formula is language neutral. Korean prose is not.
  return source && !/[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(source) ? source : null;
}
