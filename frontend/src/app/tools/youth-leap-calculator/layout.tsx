import type { Metadata } from 'next';
import { headers } from 'next/headers';
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
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
      title: '[2026 최신] 청년도약계좌 만기 수령액 계산기 — [무료/1초] 5,000만원 정부기여금 & 비과세 즉시 산출 | 월덕 머니버스',
      description: '[로그인 없이 1초 산출] 월 70만원 납입 시 은행 최고금리(최대 6.0%)와 정부기여금(월 최대 3.3만원 매칭) 및 비과세 혜택을 합산한 5년 만기 실수령액(최대 5,000만원)을 실시간으로 확인하세요!',
      canonical: 'https://easy-scraping.com/tools/youth-leap-calculator',
      keywords: ['청년도약계좌 계산기', '청년도약계좌 만기 수령액', '청년도약계좌 정부기여금', '5000만원 모으기', '청년도약계좌 비과세'],
    },
    en: {
      title: 'South Korea Youth Leap Account Savings & Government Grant Calculator | Free Simulator | Woldeok Moneyverse',
      description: 'Calculate 5-year maturity wealth up to 50M KRW under South Korea Youth Leap Account policy. Simulates 6.0% tax-exempt interest and monthly government matching grants.',
      canonical: 'https://easy-scraping.com/en/tools/youth-leap-calculator',
      keywords: ['Youth Leap Account Calculator', 'Korea Youth Savings Grant', 'Tax-exempt Savings Korea', '50M KRW Wealth Simulator'],
    },
    ja: {
      title: '韓国 青年跳躍口座・政府支援金＆満期受取額計算機 | 無料シミュレーター | Woldeok Moneyverse',
      description: '韓国の青年跳躍口座（月最大70万ウォン積立）の5年満期5,000万ウォン資産形成シミュレーション。政府寄与金と非課税利息を即時算出。',
      canonical: 'https://easy-scraping.com/ja/tools/youth-leap-calculator',
      keywords: ['青年跳躍口座 計算機', '韓国 青年積立', '政府寄与金', '非課税預金'],
    },
    zh: {
      title: '韩国 青年飞跃账户与政府补贴到期收益计算器 | 免费金融工具 | Woldeok Moneyverse',
      description: '模拟韩国青年飞跃账户 5 年期满 5000 万韩元本息。精准计算月存 70 万韩元对应的最高 6.0% 免税利息与政府匹配补贴。',
      canonical: 'https://easy-scraping.com/zh/tools/youth-leap-calculator',
      keywords: ['韩国青年飞跃账户', '韩国储蓄补贴', '免税利息计算器', '5000万韩元积立'],
    },
    vi: {
      title: 'Máy tính Tài khoản Tiết kiệm Thanh niên Hàn Quốc (Youth Leap) | Woldeok Moneyverse',
      description: 'Mô phỏng tích lũy 50 triệu KRW sau 5 năm với tài khoản Youth Leap Hàn Quốc, kết hợp lãi suất miễn thuế 6.0% và trợ cấp chính phủ.',
      canonical: 'https://easy-scraping.com/vi/tools/youth-leap-calculator',
      keywords: ['Tài khoản thanh niên Hàn Quốc', 'Tiết kiệm miễn thuế', 'Trợ cấp chính phủ Hàn Quốc'],
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
        'ko-KR': 'https://easy-scraping.com/tools/youth-leap-calculator',
        'en-US': 'https://easy-scraping.com/en/tools/youth-leap-calculator',
        'ja-JP': 'https://easy-scraping.com/ja/tools/youth-leap-calculator',
        'zh-CN': 'https://easy-scraping.com/zh/tools/youth-leap-calculator',
        'vi-VN': 'https://easy-scraping.com/vi/tools/youth-leap-calculator',
        'x-default': 'https://easy-scraping.com/tools/youth-leap-calculator',
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
  { name: '청년도약계좌 계산기', path: '/tools/youth-leap-calculator' },
]);

const FAQS = [
  {
    question: '청년도약계좌 만기 시 실제로 5,000만원을 모을 수 있나요?',
    answer:
      '월 70만원씩 5년(60개월) 납입 시 본인 원금 4,200만원에 은행 비과세 이자 약 640만원, 정부기여금 최대 198만원이 더해져 만기 시 약 5,000만원 이상의 목돈을 수령하게 됩니다.',
  },
];

export default function YouthLeapCalculatorLayout({ children }: { children: React.ReactNode }) {
  const faqData = faqPageJsonLd(FAQS);
  const appSchema = softwareApplicationJsonLd({
    name: '청년도약계좌 만기 수령액 계산기',
    description: '5,000만원 목돈 마련 정부기여금 및 비과세 이자 계산기',
    urlPath: '/tools/youth-leap-calculator',
    applicationCategory: 'FinanceApplication',
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbs) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(faqData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(appSchema) }} />
      {children}
    </>
  );
}