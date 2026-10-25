import { getServerLocale } from '@/lib/locale-server';
import { type Locale, localeLabel } from '@/lib/locale';
import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Landmark, Info, HelpCircle, ShieldCheck } from 'lucide-react';
import { InArticleAdvertisement, MultiplexAdvertisement } from '@/components/public-advertisement';
import { CalculatorSaveAction } from '@/components/calculator-save-action';
import { LoanCalculatorClient } from './loan-calculator-client';
import { canonicalUrl, buildOgImageUrl } from '@/lib/seo';
import { t } from '@/lib/translations';

const META_BY_LOCALE: Record<Locale, { title: string; description: string; canonical: string }> = {
  ko: {
    title: '[무료/무로그인] 대출이자 계산기 — 1초 만에 2억·3억 대출 원리금균등 월 납입금 & 총이자 즉시 비교 | 월덕 머니버스',
    description: '[로그인 없이 1초 산출] 1억·2억·3억·5억 주택담보대출 및 신용대출 30년 상환 시 월 납입금과 총 대출이자 정밀 산출! 원리금균등, 원금균등, 만기일시 상환방식별 총 이자와 월 상환액을 한눈에 즉시 비교하세요.',
    canonical: '/tools/loan-interest-calculator',
  },
  en: {
    title: 'Loan Interest & Amortization Calculator | Free Mortgage & Credit Loan Simulator | Woldeok Moneyverse',
    description: 'Calculate monthly loan repayments and total interest for mortgages and personal loans across equal principal & interest, equal principal, and balloon repayment schedules in 1 second. Free and login-free.',
    canonical: '/en/tools/loan-interest-calculator',
  },
  ja: {
    title: 'ローン利息・元利均等返済計算機 | 住宅ローン＆信用融資シミュレーター | ウォルドクマネーバース',
    description: '住宅ローンや信用借入の月々返済額と総支払利息を即座に試算。元利均等返済・元金均等返済・一括返済の比較を1秒で確認できます。',
    canonical: '/ja/tools/loan-interest-calculator',
  },
  zh: {
    title: '贷款利息与等额本息还款计算器 | 房贷与消费贷月供试算 | 沃尔德克金融元宇宙',
    description: '一键精确测算房贷与信用贷款在等额本息、等额本金及先息后本模式下的每月还款额与累计总利息。无须登录，免费即用。',
    canonical: '/zh/tools/loan-interest-calculator',
  },
  vi: {
    title: 'Máy tính Lãi suất & Trả nợ Khoản vay | Mô phỏng Vay Mua nhà & Tín chấp | Woldeok Moneyverse',
    description: 'Tính toán số tiền trả góp hàng tháng và tổng lãi vay theo phương thức trả gốc và lãi đều hoặc gốc đều hoàn toàn miễn phí.',
    canonical: '/vi/tools/loan-interest-calculator',
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const meta = META_BY_LOCALE[locale] ?? META_BY_LOCALE.en;

  return {
    title: meta.title,
    description: meta.description,
    keywords: [
      '대출이자 계산기',
      '원리금균등상환',
      'Loan Amortization Calculator',
      'Mortgage Repayment Calculator',
      'ローン返済計算機',
      '等额本息计算器',
    ],
    alternates: {
      canonical: canonicalUrl(meta.canonical),
      languages: {
        'ko-KR': canonicalUrl('/tools/loan-interest-calculator'),
        'en-US': canonicalUrl('/en/tools/loan-interest-calculator'),
        'ja-JP': canonicalUrl('/ja/tools/loan-interest-calculator'),
        'zh-CN': canonicalUrl('/zh/tools/loan-interest-calculator'),
        'vi-VN': canonicalUrl('/vi/tools/loan-interest-calculator'),
        'x-default': canonicalUrl('/tools/loan-interest-calculator'),
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonicalUrl(meta.canonical),
      type: 'website',
      images: [
        {
          url: buildOgImageUrl({
            title: localeLabel(locale, '대출이자 계산기', 'Loan Interest Calculator', 'ローン利息計算機', '贷款利息计算器', 'Máy tính Lãi suất Vay'),
            description: meta.description,
            badge: localeLabel(locale, '무료 대출 시뮬레이터', 'Free Loan Simulator', '無料ローン試算', '免费贷款测算', 'Mô phỏng Khoản vay'),
            type: 'default',
          }),
          width: 1200,
          height: 630,
          alt: meta.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
    },
  };
}

export default async function LoanInterestCalculatorPage() {
  const locale = await getServerLocale();
  const toolsHubPath = locale === 'ko' ? '/tools' : `/${locale}/tools`;

  return (
    <div className="container max-w-5xl py-8 space-y-8">
      {/* Navigation & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-4">
        <Link
          href={toolsHubPath}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>{t('tools.back_to_hub', locale)}</span>
        </Link>
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
          <Landmark className="size-3.5" />
          <span>{t('loan_calc.badge', locale)}</span>
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
          <Landmark className="size-7 text-primary" />
          <span>{t('loan_calc.title', locale)}</span>
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t('loan_calc.desc', locale)}
        </p>
      </div>

      {/* Main Interactive Client Calculator */}
      <LoanCalculatorClient />

      <InArticleAdvertisement />
    </div>
  );
}
