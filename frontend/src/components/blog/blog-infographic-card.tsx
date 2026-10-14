'use client';

import React from 'react';
import { TrendingUp, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Props {
  readonly type?: 'COMPOUND_CURVE' | 'MACRO_RADAR' | 'TAX_WATERFALL' | 'DCA_BENCHMARK';
  readonly currentLocale?: 'ko' | 'en' | 'ja' | 'zh';
}

export function BlogInfographicCard({ type = 'COMPOUND_CURVE', currentLocale = 'ko' }: Props) {
  const i18n = {
    ko: {
      badge: '수학적 인포그래픽',
      title: '아인슈타인 복리 스노우볼 곡선 & 72의 법칙 골든크로스',
      desc: '원금(초록 실선) 대비 복리 자산(골드 곡선)이 8년 차에 원금을 추월하는 기하급수 성장 모델',
      rule72Title: '72의 법칙 원금 2배 달성 주기',
      year4: '연 4%: 18년',
      year6: '연 6%: 12년',
      year8: '연 8%: 9년',
      year10: '연 10%: 7.2년',
      year12: '연 12%: 6년',
      goldenCross: '8년차 골든크로스 (이자 > 원금)',
      tagPrincipal: '누적 납입 원금 (선형)',
      tagCompound: '복리 만기 총자산 (지수형)',
      verifiedBadge: '테일러 급수 ln(2) 수학 검증 완료',
    },
    en: {
      badge: 'Mathematical Infographic',
      title: 'Einstein Compound Interest Curve & Rule of 72 Golden Cross',
      desc: 'Exponential growth model where compound balance surpasses total deposits in Year 8',
      rule72Title: 'Rule of 72 Doubling Time',
      year4: '4% APY: 18 yrs',
      year6: '6% APY: 12 yrs',
      year8: '8% APY: 9 yrs',
      year10: '10% APY: 7.2 yrs',
      year12: '12% APY: 6 yrs',
      goldenCross: 'Year 8 Golden Cross (Interest > Principal)',
      tagPrincipal: 'Cumulative Deposits (Linear)',
      tagCompound: 'Compound Total Assets (Exponential)',
      verifiedBadge: 'Taylor Series ln(2) Verified',
    },
    ja: {
      badge: '数学的インフォグラフィック',
      title: 'アインシュタイン複利曲線と72の法則ゴールデンクロス',
      desc: '元本に対し複利資産が8年目に元本を上回る指数関数的資産成長モデル',
      rule72Title: '72の法則 元本2倍所要期間',
      year4: '年利 4%: 18年',
      year6: '年利 6%: 12年',
      year8: '年利 8%: 9年',
      year10: '年利 10%: 7.2年',
      year12: '年利 12%: 6年',
      goldenCross: '8年目ゴールデンクロス（利息 > 元本）',
      tagPrincipal: '累計積立元本（線形）',
      tagCompound: '複利総資産額（指数関数）',
      verifiedBadge: 'テイラー展開 ln(2) 数式検証済',
    },
    zh: {
      badge: '数学可视化信息图',
      title: '爱因斯坦复利雪球曲线与72法则黄金交叉',
      desc: '本金与复利总资产在第8年迎来利息超越本金的指数级增长模型',
      rule72Title: '72法则本金翻倍周期',
      year4: '年化 4%: 18年',
      year6: '年化 6%: 12年',
      year8: '年化 8%: 9年',
      year10: '年化 10%: 7.2年',
      year12: '年化 12%: 6年',
      goldenCross: '第8年黄金交叉 (利息 > 本金)',
      tagPrincipal: '累计投入本金 (线性)',
      tagCompound: '复利总资产 (指数级)',
      verifiedBadge: '泰勒级数 ln(2) 数学验证完成',
    },
  }[currentLocale] || {
    badge: '수학적 인포그래픽',
    title: '아인슈타인 복리 스노우볼 곡선 & 72의 법칙 골든크로스',
    desc: '원금(초록 실선) 대비 복리 자산(골드 곡선)이 8년 차에 원금을 추월하는 기하급수 성장 모델',
    rule72Title: '72의 법칙 원금 2배 달성 주기',
    year4: '연 4%: 18년',
    year6: '연 6%: 12년',
    year8: '연 8%: 9년',
    year10: '연 10%: 7.2년',
    year12: '연 12%: 6년',
    goldenCross: '8년차 골든크로스 (이자 > 원금)',
    tagPrincipal: '누적 납입 원금 (선형)',
    tagCompound: '복리 만기 총자산 (지수형)',
    verifiedBadge: '테일러 급수 ln(2) 수학 검증 완료',
  };

  return (
    <div className="w-full my-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-card via-card/90 to-background/95 p-4 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-[11px] px-2.5 py-0.5">
            <Sparkles className="size-3 mr-1" /> {i18n.badge}
          </Badge>
          <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
            <ShieldCheck className="size-3 text-emerald-400" /> {i18n.verifiedBadge}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <span className="inline-block size-2 rounded-full bg-emerald-400" /> {i18n.tagPrincipal}
          </span>
          <span className="flex items-center gap-1 text-amber-400 font-bold ml-2">
            <span className="inline-block size-2 rounded-full bg-amber-400" /> {i18n.tagCompound}
          </span>
        </div>
      </div>

      {/* Title & Desc */}
      <div className="relative z-10 mb-4">
        <h4 className="text-base sm:text-lg font-black text-foreground flex items-center gap-2">
          <TrendingUp className="size-4 text-emerald-400 shrink-0" />
          <span>{i18n.title}</span>
        </h4>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          {i18n.desc}
        </p>
      </div>

      {/* Interactive Vector SVG Canvas */}
      <div className="relative z-10 w-full overflow-x-auto rounded-xl bg-zinc-950/70 border border-border/60 p-3 sm:p-4">
        <svg viewBox="0 0 760 260" className="w-full h-auto min-w-[540px] text-xs font-mono select-none" fill="none">
          {/* Grid lines */}
          <line x1="50" y1="30" x2="720" y2="30" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <line x1="50" y1="80" x2="720" y2="80" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <line x1="50" y1="130" x2="720" y2="130" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <line x1="50" y1="180" x2="720" y2="180" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <line x1="50" y1="220" x2="720" y2="220" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />

          {/* Y Axis labels */}
          <text x="40" y="34" textAnchor="end" fill="#9ca3af" fontSize="10">2.5억 WLD</text>
          <text x="40" y="84" textAnchor="end" fill="#9ca3af" fontSize="10">1.8억 WLD</text>
          <text x="40" y="134" textAnchor="end" fill="#9ca3af" fontSize="10">1.0억 WLD</text>
          <text x="40" y="184" textAnchor="end" fill="#9ca3af" fontSize="10">5,000만</text>
          <text x="40" y="224" textAnchor="end" fill="#9ca3af" fontSize="10">0</text>

          {/* X Axis labels (Years) */}
          <text x="70" y="238" textAnchor="middle" fill="#9ca3af" fontSize="10">0년차</text>
          <text x="180" y="238" textAnchor="middle" fill="#9ca3af" fontSize="10">3년차</text>
          <text x="320" y="238" textAnchor="middle" fill="#9ca3af" fontSize="10">5년차</text>
          <text x="460" y="238" textAnchor="middle" fill="#f59e0b" fontWeight="bold" fontSize="10">8년차 (역전)</text>
          <text x="580" y="238" textAnchor="middle" fill="#9ca3af" fontSize="10">10년차</text>
          <text x="700" y="238" textAnchor="middle" fill="#00F59B" fontWeight="bold" fontSize="10">15년차 (폭발)</text>

          {/* Linear Principal Path (Emerald) */}
          <path
            d="M 70 220 L 180 200 L 320 185 L 460 165 L 580 145 L 700 115"
            stroke="#10b981"
            strokeWidth="2.5"
            strokeDasharray="4 4"
          />

          {/* Exponential Compound Path (Gold Gradient) */}
          <defs>
            <linearGradient id="compoundArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <path
            d="M 70 220 Q 250 215, 320 180 T 460 135 T 580 75 T 700 25 L 700 220 Z"
            fill="url(#compoundArea)"
          />
          <path
            d="M 70 220 Q 250 215, 320 180 T 460 135 T 580 75 T 700 25"
            stroke="#f59e0b"
            strokeWidth="3.5"
          />

          {/* Golden Cross Marker (Year 8) */}
          <circle cx="460" cy="135" r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
          <line x1="460" y1="135" x2="460" y2="220" stroke="#f59e0b" strokeDasharray="2 2" strokeWidth="1" />
          <rect x="400" y="105" width="130" height="22" rx="4" fill="#18181b" stroke="#f59e0b" strokeWidth="1" />
          <text x="465" y="120" textAnchor="middle" fill="#f59e0b" fontSize="9.5" fontWeight="bold">
            골든크로스: 이자 &gt; 원금
          </text>

          {/* Final Milestone (Year 15) */}
          <circle cx="700" cy="25" r="6" fill="#00F59B" stroke="#ffffff" strokeWidth="2" />
          <rect x="620" y="10" width="95" height="20" rx="4" fill="#000000" stroke="#00F59B" strokeWidth="1" />
          <text x="668" y="24" textAnchor="middle" fill="#00F59B" fontSize="9.5" fontWeight="bold">
            2억 4,800만 WLD
          </text>
        </svg>
      </div>

      {/* Bottom Rule of 72 Strip */}
      <div className="relative z-10 mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
        <div className="p-2 rounded-lg bg-zinc-900/60 border border-border/50">
          <div className="text-muted-foreground text-[10px]">KDIC 안심정기</div>
          <div className="font-mono font-bold text-foreground mt-0.5">{i18n.year4}</div>
        </div>
        <div className="p-2 rounded-lg bg-zinc-900/60 border border-border/50">
          <div className="text-muted-foreground text-[10px]">청년도약 패키지</div>
          <div className="font-mono font-bold text-emerald-400 mt-0.5">{i18n.year6}</div>
        </div>
        <div className="p-2 rounded-lg bg-zinc-900/60 border border-border/50">
          <div className="text-muted-foreground text-[10px]">우량 배당주</div>
          <div className="font-mono font-bold text-blue-400 mt-0.5">{i18n.year8}</div>
        </div>
        <div className="p-2 rounded-lg bg-zinc-900/60 border border-border/50">
          <div className="text-muted-foreground text-[10px]">성장 펀드</div>
          <div className="font-mono font-bold text-amber-400 mt-0.5">{i18n.year10}</div>
        </div>
        <div className="p-2 rounded-lg bg-zinc-900/60 border border-border/50 col-span-2 sm:col-span-1">
          <div className="text-muted-foreground text-[10px]">퀀트 트레이딩</div>
          <div className="font-mono font-bold text-rose-400 mt-0.5">{i18n.year12}</div>
        </div>
      </div>
    </div>
  );
}
