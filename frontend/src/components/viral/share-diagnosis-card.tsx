'use client';

import React, { useState } from 'react';
import { Share2, Copy, Check, Sparkles, Download, ArrowUpRight, ShieldCheck, Flame } from 'lucide-react';

interface ShareDiagnosisCardProps {
  readonly title: string;
  readonly type: 'stock' | 'compound' | 'farming';
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
  const [isOpen, setIsOpen] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? shareUrl || window.location.href : 'https://easy-scraping.com';

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
          text: `${summary}\n지금 탈출 진단서 확인하기:`,
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
      {/* 트리거 버튼 */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-500/40 text-amber-300 hover:text-amber-200 hover:border-amber-400 font-semibold text-sm transition-all duration-200 shadow-lg shadow-amber-500/10 active:scale-95"
      >
        <Share2 className="w-4 h-4 text-amber-400 animate-pulse" />
        <span>진단서 1초 카카오톡/SNS 공유</span>
      </button>

      {/* 공유 모달 */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-zinc-950 border border-amber-500/30 rounded-3xl p-6 shadow-2xl overflow-hidden">
            {/* 배경 네온 글로우 */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* 헤더 */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="font-bold text-white text-base">공유용 실시간 진단 카드</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-400 hover:text-white text-sm font-medium px-2.5 py-1 rounded-lg hover:bg-zinc-800 transition"
              >
                닫기
              </button>
            </div>

            {/* 카드 본문 (캡처 및 공유 영역) */}
            <div className="mt-5 p-5 rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800/80 relative shadow-inner">
              {/* 카드 상단 브랜딩 */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold tracking-wider uppercase text-amber-400">WOLDEOK MONEYVERSE</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {badge}
                  </span>
                </div>
                <span className="text-[11px] text-zinc-500">실시간 공식 진단서</span>
              </div>

              {/* 제목 */}
              <h3 className="text-lg font-bold text-white tracking-tight mb-4">{title}</h3>

              {/* 핵심 지표 박스 */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800">
                  <span className="text-xs text-zinc-400 block mb-1">{primaryMetric.label}</span>
                  <div className="text-lg font-black text-amber-300 font-mono tracking-tight">{primaryMetric.value}</div>
                  {primaryMetric.subValue && (
                    <span className="text-[11px] text-emerald-400 font-medium block mt-0.5">{primaryMetric.subValue}</span>
                  )}
                </div>
                <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800">
                  <span className="text-xs text-zinc-400 block mb-1">{secondaryMetric.label}</span>
                  <div className="text-lg font-black text-emerald-400 font-mono tracking-tight">{secondaryMetric.value}</div>
                </div>
              </div>

              {/* 요약 */}
              <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/50">
                {summary}
              </p>

              {/* 하단 워터마크 안내 */}
              <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-zinc-800/40">
                <span>금융 계산 & 가상 시뮬레이터</span>
                <span className="text-amber-400/80 font-mono">easy-scraping.com</span>
              </div>
            </div>

            {/* 하단 공유 액션 버튼들 */}
            <div className="mt-6 flex flex-col gap-2.5">
              <button
                onClick={handleNativeShare}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition"
              >
                <Share2 className="w-4 h-4" />
                <span>카카오톡 / SNS 앱으로 바로 공유</span>
              </button>

              <button
                onClick={handleCopy}
                className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-semibold text-sm flex items-center justify-center gap-2 transition active:scale-98"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">링크가 클립보드에 복사되었습니다!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-zinc-400" />
                    <span>진단서 링크 복사하기</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
