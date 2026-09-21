'use client';

import { useLocale } from '@/components/locale-provider';
import { TrendingUp, Coins, Briefcase, Activity, ShieldCheck } from 'lucide-react';

export function FintechTickerBar() {
  const { locale } = useLocale();
  const isEn = locale === 'en';

  const items = [
    {
      icon: Coins,
      label: isEn ? 'WLD Network Ledger' : 'WLD 원장 상태',
      value: isEn ? 'Optimal (805 Active Nodes)' : '정상 가동 (805개 노드)',
      color: 'text-amber-500',
    },
    {
      icon: TrendingUp,
      label: isEn ? 'Top Mover: WDG' : '최고 상승: 월덕게임즈',
      value: '+4.8% ▲',
      color: 'text-emerald-500 font-bold',
    },
    {
      icon: Briefcase,
      label: isEn ? 'Daily Work Window' : '일일 직업 보상창',
      value: isEn ? 'Open · 8 Careers Active' : '진행 중 · 8대 직업 가동',
      color: 'text-blue-500',
    },
    {
      icon: ShieldCheck,
      label: isEn ? 'System Integrity' : '금융 무결성',
      value: '100.0% Verified',
      color: 'text-emerald-500',
    },
    {
      icon: Activity,
      label: isEn ? 'Live Faucet / Sink' : '통화 유동성 지수',
      value: 'Balanced (0.98)',
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="w-full border-b border-border/40 bg-muted/20 backdrop-blur-sm overflow-hidden py-1 px-3 select-none">
      <div className="mx-auto max-w-[1440px] flex items-center justify-between gap-4 text-[11px] sm:text-xs">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <span className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
            {isEn ? 'LIVE METRICS' : '실시간 지표'}
          </span>
        </div>

        <div className="flex flex-1 items-center justify-end sm:justify-start gap-4 sm:gap-8 overflow-x-auto no-scrollbar scroll-smooth">
          {items.map((it, idx) => {
            const Icon = it.icon;
            return (
              <div key={idx} className="flex items-center gap-1.5 shrink-0">
                <Icon className="size-3.5 text-muted-foreground/70" />
                <span className="text-muted-foreground hidden sm:inline">{it.label}:</span>
                <span className={`font-mono ${it.color}`}>{it.value}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
