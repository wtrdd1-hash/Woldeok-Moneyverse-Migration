import type { MetadataRoute } from 'next';
import { getPublicSitemapRoutes } from '@/config/routes.config';
import { ALL_SEO_PRESETS } from '@/config/seo-presets.config';
import { ALL_PSEO_POPULAR_SLUGS } from '@/config/pseo-stocks.config';
import { REAL_ESTATE_PRESETS } from '@/config/real-estate-presets.config';
import { KIMCHI_PREMIUM_PRESETS } from '@/config/kimchi-premium-presets.config';
import { CAPITAL_GAINS_TAX_PRESETS } from '@/config/capital-gains-tax-presets.config';
import { 
  RETIREMENT_SCENARIOS, 
  PENSION_TAX_SCENARIOS, 
  ISA_SCENARIOS 
} from '@/config/pseo-tax-retirement.config';
import { PSEO_LOAN_PRESETS } from '@/config/pseo-loan.config';
import { PSEO_DIVIDEND_STOCKS } from '@/config/pseo-dividend.config';
import { GLOSSARY_TERMS } from '@/config/pseo-glossary.config';
import { GIFT_TAX_PRESETS } from '@/config/pseo-gift-tax.config';

/**
 * 1-Hour ISR Caching for Sitemap.

 * Prevents unnecessary re-computation and shields backend from crawler storms.
 */
export const revalidate = 3600;

/**
 * Authoritative release timestamp for static public routes.
 * Using a fixed release timestamp instead of request-time new Date() ensures
 * search engines receive honest, cacheable modification dates.
 */
const RELEASE_TIMESTAMP = new Date('2026-09-29T00:00:00.000Z');

/**
 * 18 Canonical Virtual Stock Symbols (10 Classic + 8 WDX Listed) for SEO Long-tail Indexing.
 */
export const STOCK_SYMBOLS = [
  'WDG',
  'CHIMU314',
  'WDM',
  'WDB',
  'WDT',
  'MYUY',
  'CHIPS',
  'DUCK',
  'WFIN',
  'SPACE',
  'WDX-TEC',
  'WDX-FIN',
  'WDX-RET',
  'WDX-LOG',
  'WDX-BIO',
  'WDX-ENT',
  'WDX-ENG',
  'WDX-DEF',
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  if (process.env.SEO_INDEXING_ENABLED === 'false') return [];
  const base = (process.env.APP_BASE_URL || 'https://easy-scraping.com').replace(/\/$/, '');
  const publicRoutes = getPublicSitemapRoutes();

  const entries: MetadataRoute.Sitemap = [];
  const registeredUrls = new Set<string>();

  const addEntry = (
    path: string,
    priority = 0.7,
    changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly',
  ) => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const canonicalUrl = `${base}${cleanPath === '/' ? '' : cleanPath}`;
    if (registeredUrls.has(canonicalUrl)) return;
    registeredUrls.add(canonicalUrl);

    const enUrl = `${base}/en${cleanPath === '/' ? '' : cleanPath}`;
    const jaUrl = `${base}/ja${cleanPath === '/' ? '' : cleanPath}`;
    const zhUrl = `${base}/zh${cleanPath === '/' ? '' : cleanPath}`;
    const koUrl = `${base}${cleanPath === '/' ? '' : cleanPath}`;

    entries.push({
      url: canonicalUrl,
      lastModified: RELEASE_TIMESTAMP,
      changeFrequency: changeFrequency || 'daily',
      priority,
      alternates: {
        languages: {
          ko: koUrl,
          'ko-KR': koUrl,
          en: enUrl,
          'en-US': enUrl,
          ja: jaUrl,
          'ja-JP': jaUrl,
          zh: zhUrl,
          'zh-CN': zhUrl,
          'x-default': canonicalUrl,
        },
      },
    });
  };

  // 1. Static Public Routes from SSOT
  for (const route of publicRoutes) {
    if (route.path.includes('[')) continue; // Dynamic route templates skipped
    const freq = route.changeFrequency === 'never' ? undefined : route.changeFrequency;
    addEntry(route.path, route.sitemapPriority || 0.7, freq);
  }

  // 2. 30+ Longtail Financial Calculator Presets
  for (const preset of ALL_SEO_PRESETS) {
    if (preset.category === 'compound') {
      addEntry(`/tools/compound-calculator/${preset.slug}`, 0.9, 'daily');
    } else if (preset.category === 'stock') {
      addEntry(`/tools/stock-calculator/${preset.slug}`, 0.9, 'daily');
    } else if (preset.category === 'farming') {
      addEntry(`/tools/farming-calculator/${preset.slug}`, 0.85, 'daily');
    }
  }

  // 2.5. 200+ pSEO Popular Stock Calculator Presets (삼성전자, 테슬라, 엔비디아 등)
  for (const slug of ALL_PSEO_POPULAR_SLUGS) {
    addEntry(`/tools/stock-calculator/${slug}`, 0.85, 'daily');
  }

  // 2.6. 신규 가상 부동산 월세 임대수익률 10대 프리셋
  for (const p of REAL_ESTATE_PRESETS) {
    addEntry(`/tools/real-estate-calculator/${p.slug}`, 0.9, 'daily');
  }

  // 2.7. 신규 코인 김치프리미엄 10대 프리셋
  for (const p of KIMCHI_PREMIUM_PRESETS) {
    addEntry(`/tools/kimchi-premium-calculator/${p.slug}`, 0.9, 'daily');
  }

  // 2.8. 신규 주식 양도소득세 & 절세 10대 프리셋
  for (const p of CAPITAL_GAINS_TAX_PRESETS) {
    addEntry(`/tools/capital-gains-tax-calculator/${p.slug}`, 0.9, 'daily');
  }

  // 2.9. 신규 직장인 3대 고검색량 금융 계산기 허브 및 롱테일 시나리오
  addEntry('/tools/retirement-calculator', 0.95, 'daily');
  for (const sc of RETIREMENT_SCENARIOS) {
    addEntry(`/tools/retirement-calculator/${sc.slug}`, 0.9, 'daily');
  }

  addEntry('/tools/pension-tax-calculator', 0.95, 'daily');
  for (const sc of PENSION_TAX_SCENARIOS) {
    addEntry(`/tools/pension-tax-calculator/${sc.slug}`, 0.9, 'daily');
  }

  addEntry('/tools/isa-calculator', 0.95, 'daily');
  for (const sc of ISA_SCENARIOS) {
    addEntry(`/tools/isa-calculator/${sc.slug}`, 0.9, 'daily');
  }

  // 2.10. 신규 대출이자 및 배당소득세 계산기 허브 & 롱테일 프리셋
  addEntry('/tools/loan-interest-calculator', 0.95, 'daily');
  for (const lp of PSEO_LOAN_PRESETS) {
    addEntry(`/tools/loan-interest-calculator/${lp.slug}`, 0.9, 'daily');
  }

  addEntry('/tools/dividend-tax-calculator', 0.95, 'daily');
  for (const ds of PSEO_DIVIDEND_STOCKS) {
    addEntry(`/tools/dividend-tax-calculator/${ds.ticker.toLowerCase()}`, 0.9, 'daily');
  }

  // 2.11. 신규 50대 투자 & 금융 용어사전 pSEO 허브 및 4개 언어 상세 사전 라우트 (총 200개 URL)
  addEntry('/guide/glossary', 0.95, 'daily');
  addEntry('/en/guide/glossary', 0.95, 'daily');
  addEntry('/ja/guide/glossary', 0.95, 'daily');
  addEntry('/zh/guide/glossary', 0.95, 'daily');
  for (const term of GLOSSARY_TERMS) {
    addEntry(`/guide/glossary/${term.slug}`, 0.9, 'daily');
    addEntry(`/en/guide/glossary/${term.slug}`, 0.9, 'daily');
    addEntry(`/ja/guide/glossary/${term.slug}`, 0.9, 'daily');
    addEntry(`/zh/guide/glossary/${term.slug}`, 0.9, 'daily');
  }

  // 2.12. 신규 2026 증여세 계산기 및 13개 롱테일 프리셋 URL
  addEntry('/tools/gift-tax-calculator', 0.95, 'daily');
  for (const gp of GIFT_TAX_PRESETS) {
    addEntry(`/tools/gift-tax-calculator/${gp.slug}`, 0.9, 'daily');
  }

  // 3. 18 Virtual Stocks Clean Canonical URLs

  for (const symbol of STOCK_SYMBOLS) {
    addEntry(`/stocks/${symbol}`, 0.9, 'daily');
  }

  return entries;
}
