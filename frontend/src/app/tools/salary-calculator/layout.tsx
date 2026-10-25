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
      title: '[2026 최신] 연봉 실수령액 계산기 — [무료/1초] 4대보험·소득세 공제 후 세후 월급 즉시 확인 | 월덕 머니버스',
      description: '[2026년 최신 요율 100% 반영] 연봉 3천만~1억 원 구간별 실수령 월급과 국민연금, 건강보험, 장기요양, 고용보험, 근로소득세 공제 총액을 로그인 없이 1초 만에 즉시 확인하세요! 부양가족별 세후 월급 비교 표 제공.',
      canonical: 'https://easy-scraping.com/tools/salary-calculator',
      keywords: ['연봉 실수령액 계산기', '2026 연봉 계산기', '세후 월급 계산', '4대보험 공제액', '근로소득세 간이세액표', '연봉 5000 실수령액', '연봉 1억 실수령액', '월급 실수령액 표'],
    },
    en: {
      title: 'South Korea Net Salary & Payroll Tax Calculator (2026) | Free Deductions Simulator | Woldeok Moneyverse',
      description: 'Calculate post-tax monthly take-home pay under South Korea payroll laws. Accurately deducts National Pension, Health Insurance, Employment Insurance, and Income Tax.',
      canonical: 'https://easy-scraping.com/en/tools/salary-calculator',
      keywords: ['Korea Salary Calculator', 'South Korea Net Pay', 'Korea Payroll Tax', 'Four Social Insurances Korea', 'Korea Take-Home Salary Calculator'],
    },
    ja: {
      title: '韓国 給与手取り額・四大保険計算機 (2026年最新) | 無料シミュレーター | Woldeok Moneyverse',
      description: '韓国の給与所得税と四大社会保険料（国民年金、健康保険、長期療養、雇用保険）を自動控除した最新の手取り月給を算出。',
      canonical: 'https://easy-scraping.com/ja/tools/salary-calculator',
      keywords: ['韓国 給与手取り 計算機', '韓国 所得税', '韓国 四大保険', '韓国 年収 手取り'],
    },
    zh: {
      title: '韩国 税后年薪与四大社会保险计算器 (2026最新) | 免费工薪模拟 | Woldeok Moneyverse',
      description: '100% 匹配韩国 2026 最新四大保险与个人所得税简易税表。秒算韩国工作税后到手月薪，精准扣减国民年金与健保。',
      canonical: 'https://easy-scraping.com/zh/tools/salary-calculator',
      keywords: ['韩国年薪计算器', '韩国税后工资', '韩国四大保险', '韩国国民年金扣缴'],
    },
    vi: {
      title: 'Máy tính lương thực nhận & 4 loại bảo hiểm Hàn Quốc (2026) | Woldeok Moneyverse',
      description: 'Tính toán lương về tay sau khi khấu trừ 4 loại bảo hiểm xã hội và thuế thu nhập cá nhân tại Hàn Quốc theo biểu thuế mới nhất 2026.',
      canonical: 'https://easy-scraping.com/vi/tools/salary-calculator',
      keywords: ['Máy tính lương Hàn Quốc', 'Lương thực nhận Hàn Quốc', 'Bảo hiểm xã hội Hàn Quốc', 'Thuế thu nhập Hàn Quốc'],
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
        'ko-KR': 'https://easy-scraping.com/tools/salary-calculator',
        'en-US': 'https://easy-scraping.com/en/tools/salary-calculator',
        'ja-JP': 'https://easy-scraping.com/ja/tools/salary-calculator',
        'zh-CN': 'https://easy-scraping.com/zh/tools/salary-calculator',
        'vi-VN': 'https://easy-scraping.com/vi/tools/salary-calculator',
        'x-default': 'https://easy-scraping.com/tools/salary-calculator',
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

const FAQS = [
  {
    question: '2026년 4대보험 근로자 부담 요율은 어떻게 되나요?',
    answer:
      '국민연금 4.5%, 건강보험 3.545%, 장기요양보험은 건강보험료의 12.95%(급여 대비 약 0.459%), 고용보험 0.9%가 근로자 급여에서 원천징수됩니다.',
  },
  {
    question: '비과세 식대 한도는 실수령액에 어떻게 반영되나요?',
    answer:
      '식대 비과세 한도는 월 20만 원입니다. 비과세 식대는 4대보험료 및 근로소득세 산정 기준이 되는 과세급여에서 제외되므로 과세표준을 낮춰 실수령액이 증가하는 효과가 있습니다.',
  },
];

export default function SalaryCalculatorLayout({ children }: { children: React.ReactNode }) {
  const breadcrumbs = breadcrumbJsonLd([
    { name: '홈', path: '/' },
    { name: '금융 도구 허브', path: '/tools' },
    { name: '2026 연봉 실수령액 계산기', path: '/tools/salary-calculator' },
  ]);
  const faqData = faqPageJsonLd(FAQS);
  const appSchema = softwareApplicationJsonLd({
    name: '2026 연봉 실수령액 계산기',
    description: '4대보험 및 근로소득세 공제 후 실제 세후 월급을 계산하는 정밀 시뮬레이터',
    urlPath: '/tools/salary-calculator',
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