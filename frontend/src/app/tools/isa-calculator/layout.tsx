import type { Metadata } from 'next';
import { headers } from 'next/headers';
import {
  breadcrumbJsonLd,
  softwareApplicationJsonLd,
} from '@/lib/seo';
import { jsonLd } from '@/lib/json-ld';

type SupportedLocale = 'ko' | 'en' | 'ja' | 'zh' | 'vi';

function getLocaleFromPath(pathname: string): SupportedLocale {
  if (pathname.startsWith('/en')) return 'en';
  if (pathname.startsWith('/ja')) return 'ja';
  if (pathname.startsWith('/zh')) return 'zh';
  if (pathname.startsWith('/vi')) return 'vi';
  return 'ko';
}

export async function generateMetadata(): Promise<Metadata> {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || headerList.get('x-invoke-path') || '';
  const locale = getLocaleFromPath(pathname);

  const metaByLocale: Record<SupportedLocale, { title: string; description: string; canonical: string; keywords: string[] }> = {
    ko: {
      title: '[2026 최신] ISA 계좌 절세 계산기 — [무료/1초] 일반형·서민형 비과세 한도 & 9.9% 분리과세 즉시 비교 | 월덕 머니버스',
      description: '[로그인 없이 1초 산출] ISA 일반형(200만)·서민형(400만) 비과세 한도와 초과분 9.9% 분리과세 시뮬레이션! 일반 계좌(15.4% 배당소득세) 대비 순 절세액을 실시간으로 즉시 계산하세요.',
      canonical: 'https://easy-scraping.com/tools/isa-calculator',
      keywords: ['ISA 계산기', 'ISA 계좌 절세', 'ISA 일반형 서민형', 'ISA 비과세 한도', 'ISA 9.9% 분리과세'],
    },
    en: {
      title: 'South Korea ISA Tax-Free Account & 9.9% Tax Shield Calculator | Free Simulator | Woldeok Moneyverse',
      description: 'Simulate net tax savings under South Korea Individual Savings Account (ISA). Compare KRW 2M/4M tax exemptions and 9.9% separate taxation against 15.4% standard withholding tax.',
      canonical: 'https://easy-scraping.com/en/tools/isa-calculator',
      keywords: ['Korea ISA Calculator', 'Individual Savings Account Korea', 'Tax-free Investment Korea', '9.9% Separate Taxation'],
    },
    ja: {
      title: '韓国 ISA（個人総合資産管理口座）非課税＆節税計算機 | 無料シミュレーター | Woldeok Moneyverse',
      description: '韓国のISA一般型（200万ウォン）および庶民型（400万ウォン）非課税枠と、超過分の9.9％分離課税による実質節税効果を即時算出。',
      canonical: 'https://easy-scraping.com/ja/tools/isa-calculator',
      keywords: ['韓国 ISA 計算機', '非課税投資 韓国', '9.9% 分離課税', '節税シミュレーター'],
    },
    zh: {
      title: '韩国 ISA 个人综合资产管理账户免税与节税计算器 | 免费金融工具 | Woldeok Moneyverse',
      description: '模拟韩国 ISA 普通型 200 万韩元与普惠型 400 万韩元免税额度，对比 9.9% 分离课税与普通账户 15.4% 预扣税的实际节税金额。',
      canonical: 'https://easy-scraping.com/zh/tools/isa-calculator',
      keywords: ['韩国ISA计算器', '个人综合资产管理账户', '免税投资韩国', '分离课税9.9%'],
    },
    vi: {
      title: 'Máy tính Tiết kiệm Thuế Tài khoản ISA Hàn Quốc | Woldeok Moneyverse',
      description: 'Tính toán số tiền thuế tiết kiệm được với tài khoản ISA Hàn Quốc, so sánh hạn mức miễn thuế và mức thuế ưu đãi 9.9% với thuế thông thường 15.4%.',
      canonical: 'https://easy-scraping.com/vi/tools/isa-calculator',
      keywords: ['Máy tính ISA Hàn Quốc', 'Miễn thuế đầu tư', 'Tài khoản quản lý tài sản cá nhân'],
    },
  };

  const currentMeta = metaByLocale[locale] ?? metaByLocale['ko'];

  return {
    title: currentMeta.title,
    description: currentMeta.description,
    keywords: currentMeta.keywords,
    alternates: {
      canonical: currentMeta.canonical,
      languages: {
        'ko-KR': 'https://easy-scraping.com/tools/isa-calculator',
        'en-US': 'https://easy-scraping.com/en/tools/isa-calculator',
        'ja-JP': 'https://easy-scraping.com/ja/tools/isa-calculator',
        'zh-CN': 'https://easy-scraping.com/zh/tools/isa-calculator',
        'vi-VN': 'https://easy-scraping.com/vi/tools/isa-calculator',
        'x-default': 'https://easy-scraping.com/tools/isa-calculator',
      },
    },
    openGraph: {
      title: currentMeta.title,
      description: currentMeta.description,
      url: currentMeta.canonical,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: currentMeta.title,
      description: currentMeta.description,
    },
  };
}

const breadcrumbs = breadcrumbJsonLd([
  { name: '홈', path: '/' },
  { name: '금융 도구 허브', path: '/tools' },
  { name: 'ISA 계좌 절세 계산기', path: '/tools/isa-calculator' },
]);

export default function IsaCalculatorLayout({ children }: { children: React.ReactNode }) {
  const appSchema = softwareApplicationJsonLd({
    name: 'ISA 계좌 절세 계산기',
    description: '일반형·서민형 비과세 및 9.9% 분리과세 절세액 비교 계산기',
    urlPath: '/tools/isa-calculator',
    applicationCategory: 'FinanceApplication',
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(appSchema) }} />
      {children}
    </>
  );
}