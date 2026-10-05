'use client';

import React, { useState } from 'react';
import { Share2, Copy, Check, Sparkles, Download, ArrowUpRight, ShieldCheck, Flame, Image as ImageIcon } from 'lucide-react';
import { ViralShareCardDialog } from '@/components/viral-share-card-dialog';
import type { ViralCardPayload } from '@/lib/viral-share-card';

interface ShareDiagnosisCardProps {
  readonly title: string;
  readonly type: 'stock' | 'compound' | 'farming' | 'real-estate' | 'kimchi' | 'tax';
  readonly primaryMetric: {
    readonly label: string;
    readonly value: string;
    readonly subValue?: string;
  };
  readonly secondaryMetric: {
    readonly label: string;
    readonly value: string;
  };
  readonly badge: string;
  readonly summary: string;
  readonly shareUrl?: string;
}

export function ShareDiagnosisCard({
  title,
  type,
  primaryMetric,
  secondaryMetric,
  badge,
  summary,
  shareUrl,
}: ShareDiagnosisCardProps) {
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? shareUrl || window.location.href : 'https://easy-scraping.com';

  const categoryName =
    type === 'stock'
      ? '물타기 진단서'
      : type === 'compound'
      ? '복리 적금 시뮬레이션'
      : type === 'real-estate'
      ? '부동산 임대 수익률'
      : type === 'kimchi'
      ? '김치프리미엄 진단'
      : type === 'tax'
      ? '양도세 절세 시뮬레이션'
      : '농사 수익률 진단서';

  const viralPayload: ViralCardPayload = {
    category: categoryName,
    title,
    subtitle: primaryMetric.subValue,
    keyMetricLabel: primaryMetric.label,
    keyMetricValue: primaryMetric.value,
    badgeText: badge,
    recommendationNote: summary,
    metrics: [
      { label: secondaryMetric.label, value: secondaryMetric.value },
      { label: '시뮬레이션 상태', value: '검증 완료', isPositive: true },
    ],
    shareUrl: currentUrl,
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `[월덕 머니버스] ${title}`,
          text: `${summary}\n지금 무료 진단서 확인하기:`,
          url: currentUrl,
        });
      } catch {
        // User canceled or failed
      }
    } else {
      handleCopy();
    }
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-5 sm:p-6 shadow-xl">
        {/* Glow Accent */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />

        {/* Top Meta */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
              <Sparkles className="h-3 w-3" />
              1초 시뮬레이션 진단서
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs font-medium text-amber-300">
              <Flame className="h-3 w-3" />
              {badge}
            </span>
          </div>

          <span className="text-[11px] font-mono text-zinc-400">easy-scraping.com</span>
        </div>

        {/* Title */}
        <h3 className="text-lg sm:text-xl font-bold text-zinc-100 tracking-tight mb-4">
          {title}
        </h3>

        {/* Metric Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3.5">
            <div className="text-xs text-zinc-400 mb-1">{primaryMetric.label}</div>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              {primaryMetric.value}
            </div>
            {primaryMetric.subValue && (
              <div className="text-xs text-zinc-400 mt-0.5">{primaryMetric.subValue}</div>
            )}
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3.5">
            <div className="text-xs text-zinc-400 mb-1">{secondaryMetric.label}</div>
            <div className="text-2xl font-bold font-mono text-zinc-200">
              {secondaryMetric.value}
            </div>
            <div className="text-xs text-zinc-400 mt-0.5">실시간 통계 반영</div>
          </div>
        </div>

        {/* Summary Quote */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-3 mb-5">
          <p className="text-xs text-zinc-300 leading-relaxed">
            💡 {summary}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex-1 min-w-[130px] inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 active:scale-98 transition shadow-lg shadow-emerald-950/40"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            카드 이미지 생성 & 공유
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900/90 px-3.5 py-2.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 active:scale-98 transition"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? '복사됨' : '링크 복사'}
          </button>

          <button
            type="button"
            onClick={handleNativeShare}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-900/90 px-3.5 py-2.5 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 active:scale-98 transition"
          >
            <Share2 className="h-3.5 w-3.5" />
            공유
          </button>
        </div>
      </div>

      {isModalOpen && (
        <ViralShareCardDialog
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          payload={viralPayload}
        />
      )}
    </>
  );
}
