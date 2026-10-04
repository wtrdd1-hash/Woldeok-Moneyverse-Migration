import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ISA_SCENARIOS } from '@/config/pseo-tax-retirement.config';
import IsaCalculatorPage from '../page';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return ISA_SCENARIOS.map((sc) => ({
    slug: sc.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const scenario = ISA_SCENARIOS.find((s) => s.slug === slug);
  if (!scenario) return {};

  const title = `${scenario.title} | 2026 ISA 비과세 절세 계산기`;
  const description = `${scenario.description} 일반 증권 계좌 대비 절세액과 9.9% 분리과세 혜택을 실시간 확인하세요.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://easy-scraping.com/tools/isa-calculator/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://easy-scraping.com/tools/isa-calculator/${slug}`,
      type: 'website',
    },
  };
}

export default async function IsaScenarioPage({ params }: Props) {
  const { slug } = await params;
  const scenario = ISA_SCENARIOS.find((s) => s.slug === slug);

  if (!scenario) {
    notFound();
  }

  return <IsaCalculatorPage />;
}
