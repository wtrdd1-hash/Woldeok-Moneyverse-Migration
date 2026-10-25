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
      title: 'FIRE족 조기은퇴 4% 룰 계산기 — [무료] 목표 은퇴자산 & 안전 인출률 30년 시뮬레이션 | 월덕 머니버스',
      description: '[로그인 없이 1초 산출] 현재 자산, 월 저축액, 기대 투자수익률로 조기 은퇴 가능 연도와 트리니티 4% 법칙 필요 순자산을 즉시 계산! Lean/Fat/Barista FIRE 유형별 맞춤 로드맵 정밀 시뮬레이터.',
      canonical: 'https://easy-scraping.com/tools/fire-calculator',
      keywords: ['fire족 계산기', '조기은퇴 계산기', '4프로 룰 계산기', '트리니티 스터디', '은퇴 자금 계산기', 'lean fire 계산', '안전 인출률 시뮬레이션', '파이어족 자산 목표'],
    },
    en: {
      title: 'FIRE Calculator & 4% Rule Simulator | Free Early Retirement Planner | Woldeok Moneyverse',
      description: 'Calculate your target retirement net worth, Trinity 4% safe withdrawal rate, and financial freedom year in seconds. Explore Lean, Fat, and Barista FIRE roadmaps with zero login required.',
      canonical: 'https://easy-scraping.com/en/tools/fire-calculator',
      keywords: ['FIRE Calculator', 'Early Retirement Calculator', '4% Rule Simulator', 'Trinity Study Calculator', 'Lean FIRE Planner', 'Barista FIRE', 'Financial Independence Retire Early'],
    },
    ja: {
      title: 'FIRE計算機・4％ルール早期リタイア シミュレーター | 無料 | Woldeok Moneyverse',
      description: 'トリニティ・スタディの4％安全引出率に基づき、目標資産額と早期リタイア可能年数を即時算出。Lean/Fat/Barista FIREのタイプ別資産形成ロードマップ。',
      canonical: 'https://easy-scraping.com/ja/tools/fire-calculator',
      keywords: ['FIRE計算機', '早期リタイア シミュレーター', '4%ルール', 'トリニティスタディ', '早期退職シミュレーション', '不労所得計算'],
    },
    zh: {
      title: 'FIRE 提前退休 4% 法则计算器 | 免费财务自由规划 | Woldeok Moneyverse',
      description: '基于三一学院 4% 安全提款率，秒算目标退休总资产与达成退休年份。支持极简/富足/咖啡师 FIRE 全方位路径规划。',
      canonical: 'https://easy-scraping.com/zh/tools/fire-calculator',
      keywords: ['FIRE计算器', '提前退休模拟器', '4%法则', '三一大学退休研究', '财务自由计算器', '安全提款率'],
    },
    vi: {
      title: 'Công cụ tính nghỉ hưu sớm FIRE & Quy tắc 4% | Woldeok Moneyverse',
      description: 'Tính toán tài sản mục tiêu để nghỉ hưu sớm và số năm đạt tự do tài chính theo quy tắc an toàn rút tiền 4% của nghiên cứu Trinity.',
      canonical: 'https://easy-scraping.com/vi/tools/fire-calculator',
      keywords: ['Máy tính FIRE', 'Nghỉ hưu sớm', 'Quy tắc 4%', 'Tự do tài chính', 'Mô phỏng tích lũy tài sản'],
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
        'ko-KR': 'https://easy-scraping.com/tools/fire-calculator',
        'en-US': 'https://easy-scraping.com/en/tools/fire-calculator',
        'ja-JP': 'https://easy-scraping.com/ja/tools/fire-calculator',
        'zh-CN': 'https://easy-scraping.com/zh/tools/fire-calculator',
        'vi-VN': 'https://easy-scraping.com/vi/tools/fire-calculator',
        'x-default': 'https://easy-scraping.com/tools/fire-calculator',
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

const BREADCRUMB_SCHEMA = breadcrumbJsonLd([
  { name: '홈', path: '/' },
  { name: '금융 도구 허브', path: '/tools' },
  { name: 'FIRE 조기은퇴 계산기', path: '/tools/fire-calculator' },
]);

const FAQ_SCHEMA = faqPageJsonLd([
  {
    question: 'FIRE족의 4% 룰(Four Percent Rule)이란 무엇인가요?',
    answer:
      '미국 트리니티 대학의 연구에 따르면, 총 은퇴 자산의 4%를 첫해에 생활비로 인출하고 매년 물가상승률만큼 증액 인출하더라도 30년 이상 자산이 고갈되지 않을 확률이 95% 이상이라는 금융 통계 법칙입니다. 따라서 연간 생활비의 25배를 모으면 경제적 자유를 달성한 것으로 간주합니다.',
  },
  {
    question: 'Lean FIRE와 Fat FIRE의 차이는 무엇인가요?',
    answer:
      'Lean FIRE는 극단적인 절약으로 최소 생활비만 인출하여 빠르게 은퇴하는 방식이며, Fat FIRE는 풍요로운 생활비를 유지하며 여유롭게 은퇴하는 방식입니다.',
  },
]);

const APP_SCHEMA = softwareApplicationJsonLd({
  name: 'FIRE족 조기은퇴 4% 룰 계산기',
  description: '트리니티 4% 안전 인출률 기반 은퇴 목표 자산 및 달성 가능 연도 실시간 시뮬레이터',
  urlPath: '/tools/fire-calculator',
  applicationCategory: 'FinanceApplication',
});

export default function FireCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(BREADCRUMB_SCHEMA) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(FAQ_SCHEMA) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(APP_SCHEMA) }}
      />
      {children}
    </>
  );
}