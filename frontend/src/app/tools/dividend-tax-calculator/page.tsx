import { getServerLocale } from '@/lib/locale-server';
import { localeLabel } from '@/lib/locale';
import React from 'react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { ArrowLeft, Coins } from 'lucide-react';
import { InArticleAdvertisement, MultiplexAdvertisement } from '@/components/public-advertisement';
import { DividendCalculatorClient } from './dividend-calculator-client';
import { DividendCalendarWidget } from '@/components/dividend-calendar-widget';
import { DomesticRegulationBanner } from '@/components/domestic-regulation-banner';

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
      title: '[무료/무로그인] 배당소득세 계산기 — 1초 만에 국내·미국 배당주 15.4% 세후 실수령액 & 2000만원 종합과세 즉시 산출 | 월덕 머니버스',
      description: '[로그인 없이 1초 산출] 배당수익률(Dividend Yield)과 국내·미국 주식 15.4% 원천징수 후 순수령액, 2,000만원 초과 금융소득종합과세 해당 여부를 실시간으로 즉시 확인하세요!',
      canonical: 'https://easy-scraping.com/tools/dividend-tax-calculator',
      keywords: ['배당소득세 계산기', '배당금 세금', '배당수익률 계산', '미국 배당주 세금', '금융소득종합과세 2000만원', '배당 실수령액', 'ISA 계좌 배당 절세'],
    },
    en: {
      title: 'Dividend Income Tax & Withholding Calculator | Free Dividend Yield Simulator | Woldeok Moneyverse',
      description: 'Calculate net dividend payouts after 15.4% withholding tax for domestic and US stocks. Check 20M KRW comprehensive financial income tax thresholds in seconds.',
      canonical: 'https://easy-scraping.com/en/tools/dividend-tax-calculator',
      keywords: ['Dividend Tax Calculator', 'Dividend Yield Simulator', 'Withholding Tax Calculator', 'US Stock Dividend Tax', 'Post-Tax Dividend Calculator'],
    },
    ja: {
      title: '配当所得税・源泉徴収計算機 | 無料シミュレーター | Woldeok Moneyverse',
      description: '国内・米国株式の配当金源泉徴収（15.4％）後の実質手取り額と、2,000万ウォン金融所得総合課税基準を即時シミュレーション。',
      canonical: 'https://easy-scraping.com/ja/tools/dividend-tax-calculator',
      keywords: ['配当所得税 計算機', '配当金 手取り', '配当利回り シミュレーター', '米国株 配当 税金'],
    },
    zh: {
      title: '股息红利所得税与到手收益计算器 | 免费股息模拟器 | Woldeok Moneyverse',
      description: '精准计算国内与美股股息扣除 15.4% 预扣税后的税后实际到手金额，一秒判断是否超出 2000 万韩元综合课税门槛。',
      canonical: 'https://easy-scraping.com/zh/tools/dividend-tax-calculator',
      keywords: ['股息税计算器', '股息率模拟', '美股分红税', '股息实际到手计算'],
    },
    vi: {
      title: 'Máy tính Thuế Thu nhập Cổ tức | Woldeok Moneyverse',
      description: 'Tính toán số tiền cổ tức thực nhận sau thuế khấu trừ 15.4% cho cổ phiếu nội địa và chứng khoán Mỹ, cùng ngưỡng thuế tổng hợp.',
      canonical: 'https://easy-scraping.com/vi/tools/dividend-tax-calculator',
      keywords: ['Thuế cổ tức', 'Máy tính cổ tức', 'Thuế khấu trừ tại nguồn', 'Lợi suất cổ tức'],
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
        'ko-KR': 'https://easy-scraping.com/tools/dividend-tax-calculator',
        'en-US': 'https://easy-scraping.com/en/tools/dividend-tax-calculator',
        'ja-JP': 'https://easy-scraping.com/ja/tools/dividend-tax-calculator',
        'zh-CN': 'https://easy-scraping.com/zh/tools/dividend-tax-calculator',
        'vi-VN': 'https://easy-scraping.com/vi/tools/dividend-tax-calculator',
        'x-default': 'https://easy-scraping.com/tools/dividend-tax-calculator',
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

export default async function DividendTaxCalculatorPage() {
  const locale = await getServerLocale();
  const isEn = locale !== 'ko';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: isEn ? 'Dividend Tax & Dividend Yield Calculator' : '배당소득세 & Dividend Yield 계산기',
    description: isEn ? 'Dividend Yield and Withholding Tax Simulation for Domestic and US Stocks' : '배당수익률 및 국내/미국 주식 배당금 원천징수 세액, 2,000만원 금융소득종합과세 계산기',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'All',
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        {/* 한국 법제도 고유 계산기 글로벌 안내 배너 */}
        <DomesticRegulationBanner
          toolName={localeLabel(
    locale,
    '2026 대한민국 배당소득세 계산기 (South Korea Dividend Tax & 20M KRW Threshold Calculator)',
    'South Korea Dividend Income Tax & 20M KRW Threshold Calculator',
    '韓国 配当所得税および2,000万ウォン総合課税シミュレーター',
    '韩国 股息红利所得税与2000万韩元综合课税测算工具'
  )}
          recommendedAlternativeUrl="/tools/stock-calculator"
          recommendedAlternativeLabel={isEn ? 'Explore Global Stock DCA Calculator' : '글로벌 주식 물타기/DCA 계산기 보기'}
        />

        {/* 상단 내비게이션 */}
        <div className="flex items-center justify-between">
          <Link
            href={locale === 'ko' ? '/tools' : `/${locale}/tools`}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{localeLabel(locale, '금융 계산기 목록으로', 'Back to Tools Hub', '計算機一覧へ戻る', '返回金融工具列表', 'Quay lại danh sách máy tính')}</span>
          </Link>
          <span className="text-xs text-zinc-500 font-mono">FIN-CALC-DIVIDEND-V1</span>
        </div>

        {/* 헤더 */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
            <Coins className="w-3.5 h-3.5" />
            <span>{isEn ? '2026 Dividend Tax & Comprehensive Taxation Benchmarks' : '2026년 배당소득세 및 금융종합과세 기준'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            {localeLabel(
              locale,
              '배당소득세 계산기 (국내 · 미국주식)',
              'Dividend Income Tax Calculator (Domestic & US Stocks)',
              '配当所得税計算機（国内・米国株式）',
              '股息红利所得税计算器（国内 · 美股）',
              'Máy tính Thuế Thu nhập Cổ tức'
            )}
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {isEn
              ? 'Calculate post-tax net dividend income after 15.4% withholding tax and inspect the KRW 20,000,000 comprehensive financial income tax threshold in real time.'
              : '원천징수 15.4% 세액과 통장에 입금되는 실수령 배당금, 2,000만원 초과 시 종합과세 부담을 즉시 계산합니다.'}
          </p>
        </div>

        {/* 메인 계산기 클라이언트 */}
        <DividendCalculatorClient />

        {/* 배당 캘린더 위젯 */}
        <div className="mt-8">
          <DividendCalendarWidget />
        </div>

        {/* 인아티클 광고 */}
        <div className="my-8">
          <InArticleAdvertisement />
        </div>

        {/* 하단 추천 광고 */}
        <MultiplexAdvertisement className="mt-8" />
      </div>
    </div>
  );
}