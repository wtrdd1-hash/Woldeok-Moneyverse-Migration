import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PENSION_TAX_SCENARIOS } from '@/config/pseo-tax-retirement.config';
import PensionTaxCalculatorPage from '../page';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return PENSION_TAX_SCENARIOS.map((sc) => ({
    slug: sc.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const scenario = PENSION_TAX_SCENARIOS.find((s) => s.slug === slug);
  if (!scenario) return {};

  const title = `${scenario.title} | 2026 연금저축/IRP 세액공제 계산기`;
  const description = `${scenario.description} 이번 연말정산 환급금을 실시간으로 정확히 계산해 보세요.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://easy-scraping.com/tools/pension-tax-calculator/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://easy-scraping.com/tools/pension-tax-calculator/${slug}`,
      type: 'website',
    },
  };
}

export default async function PensionTaxScenarioPage({ params }: Props) {
  const { slug } = await params;
  const scenario = PENSION_TAX_SCENARIOS.find((s) => s.slug === slug);

  if (!scenario) {
    notFound();
  }

  return <PensionTaxCalculatorPage />;
}
