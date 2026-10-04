import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RETIREMENT_SCENARIOS } from '@/config/pseo-tax-retirement.config';
import RetirementCalculatorPage from '../page';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return RETIREMENT_SCENARIOS.map((sc) => ({
    slug: sc.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const scenario = RETIREMENT_SCENARIOS.find((s) => s.slug === slug);
  if (!scenario) return {};

  const title = `${scenario.title} | 2026 퇴직금 실수령액 계산기`;
  const description = `${scenario.description} 세후 실수령액 및 IRP 계좌 이체 시 절세액을 무료로 실시간 계산하세요.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://easy-scraping.com/tools/retirement-calculator/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://easy-scraping.com/tools/retirement-calculator/${slug}`,
      type: 'website',
    },
  };
}

export default async function RetirementScenarioPage({ params }: Props) {
  const { slug } = await params;
  const scenario = RETIREMENT_SCENARIOS.find((s) => s.slug === slug);

  if (!scenario) {
    notFound();
  }

  return <RetirementCalculatorPage />;
}
