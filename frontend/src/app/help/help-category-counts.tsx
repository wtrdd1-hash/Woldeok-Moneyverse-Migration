import type { HelpLocale } from './locale';

const CATEGORY_NAMES = {
  ko: { account: '계정', wallet: '지갑', shop: '상점', community: '커뮤니티', support: '고객지원' },
  en: { account: 'Account', wallet: 'Wallet', shop: 'Shop', community: 'Community', support: 'Support' },
} as const;

export function HelpCategoryCounts({ locale, counts }: { locale: HelpLocale; counts: Record<string, string> | null }) {
  return <section aria-labelledby="help-category-count-heading" className="grid gap-2">
    <h2 id="help-category-count-heading" className="text-lg font-semibold">{locale === 'ko' ? '한국어 도움말 분야별 문서 수' : 'English help articles by category'}</h2>
    {counts === null
      ? <p role="status">{locale === 'ko' ? '현재 문서 수를 확인할 수 없습니다.' : 'Category counts are unavailable.'}</p>
      : <ul className="flex flex-wrap gap-3 text-sm">{Object.entries(CATEGORY_NAMES[locale]).map(([key, name]) =>
          <li key={key} className="rounded-md border px-3 py-2">{name}: {counts[key] ?? '0'}</li>
        )}</ul>}
  </section>;
}
