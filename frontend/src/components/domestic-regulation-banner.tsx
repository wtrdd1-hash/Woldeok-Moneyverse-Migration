'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowRight, Globe } from 'lucide-react';
import { useLocale } from '@/components/locale-provider';
import { t } from '@/lib/translations';

interface DomesticRegulationBannerProps {
  toolName?: string;
  recommendedAlternativeUrl?: string;
  recommendedAlternativeLabel?: string;
}

export function DomesticRegulationBanner({
  toolName,
  recommendedAlternativeUrl = '/tools/compound-calculator',
  recommendedAlternativeLabel,
}: DomesticRegulationBannerProps) {
  const { locale } = useLocale();

  // 한국어 사용자인 경우 안내 배너를 간결한 뱃지로 표시하거나 숨김
  if (locale === 'ko') {
    return null;
  }

  const title = t('tools.domestic_notice_title', locale);
  const desc = t('tools.domestic_notice_desc', locale);

  const altLabel = recommendedAlternativeLabel || (
    locale === 'en' ? 'Explore Global Compound Calculator' :
    locale === 'ja' ? 'グローバル複利計算機を見る' :
    locale === 'zh' ? '查看全球复利投资计算器' : 'Máy tính Lãi kép Quốc tế'
  );

  return (
    <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 sm:p-5 mb-6 backdrop-blur-sm text-foreground shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-amber-500/20 p-2 text-amber-500 shrink-0 mt-0.5">
            <Globe className="size-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-amber-500 tracking-wider uppercase">
                SOUTH KOREA REGULATION SPECIFIC
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-foreground">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
              {desc}
            </p>
          </div>
        </div>

        <Link
          href={recommendedAlternativeUrl}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 transition-colors shrink-0 shadow-xs"
        >
          <span>{altLabel}</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
