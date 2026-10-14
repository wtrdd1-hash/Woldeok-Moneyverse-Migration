'use client';

import React from 'react';
import Link from 'next/link';
import { Gift, Bot, ArrowRight, ShieldCheck, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * 블로그 아티클 하단에 배치되는 고전환 신규 회원 가입 웰컴 패키지 및 AI 어드바이저 연결 카드 배너
 */
export function BlogConversionBanner() {
  return (
    <div className="my-10 p-6 sm:p-8 rounded-3xl border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-zinc-900/90 to-zinc-950 text-white shadow-xl relative overflow-hidden">
      {/* 배경 장식 광선 */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <Gift className="w-3.5 h-3.5" />
            신규 시민 웰컴 패키지
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            KDIC 예금자 보호 원장
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            글에서 본 금융 전략, 머니버스에서 <span className="text-amber-400">무료 10,000 WLD</span>로 실전 검증해 보세요!
          </h3>
          <p className="text-sm text-zinc-300 max-w-2xl leading-relaxed">
            월덕 머니버스는 실시간 가상 주식 거래소, 복리 정기예금, 그리고 300+개 정밀 금융 계산기가 완비된 가상 경제 시뮬레이션 플랫폼입니다. 지금 가입 즉시 정착 지원금과 1등 당첨 복권을 드립니다.
          </p>
        </div>

        {/* 혜택 2종 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 font-mono font-bold text-lg">
              10K
            </div>
            <div>
              <div className="text-xs text-zinc-400 font-medium">기본 정착 지원금</div>
              <div className="text-sm font-bold text-white">10,000 WLD 전원 즉시 지급</div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 font-mono font-bold text-lg">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-zinc-400 font-medium">국가 공식 복권 혜택</div>
              <div className="text-sm font-bold text-white">1등 1,000만 WLD 즉석 복권 1장</div>
            </div>
          </div>
        </div>

        {/* CTA 버튼 그룹 */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
          <Button
            asChild
            size="lg"
            className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Link href="/register">
              10,000 WLD 받고 머니버스 시작하기
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-zinc-700 bg-zinc-800/60 hover:bg-zinc-700/80 text-white font-semibold text-sm"
          >
            <Link href="/advisor" className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-blue-400" />
              AI 어드바이저 덕이 진단실 가기
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
