'use client';

import { useLocale } from '@/components/locale-provider';
import { localeLabel } from '@/lib/locale';
import { TrendingUp, Coins, Briefcase, Activity, ShieldCheck } from 'lucide-react';

export function FintechTickerBar() {
  const { locale } = useLocale();

  const items = [
    {
      icon: Coins,
      label: localeLabel(locale, 'WLD 원장 상태', 'WLD Ledger', 'WLD元帳', 'WLD账本'),
      value: localeLabel(locale, '정상 가동 (805개 노드)', 'Optimal (805 Nodes)', '正常稼働 (805ノード)', '正常运行 (805节点)'),
      color: 'text-zinc-300 font-mono',
    },
    {
      icon: TrendingUp,
      label: localeLabel(locale, '최고 상승', 'Top Mover', '急上昇', '最大涨幅'),
      value: 'WDG +4.8% ▲',
      color: 'text-[var(--rise)] font-mono font-bold',
    },
    {
      icon: Briefcase,
      label: localeLabel(locale, '일일 직업 보상', 'Career Reward', '職業報酬', '职业奖励'),
      value: localeLabel(locale, '8대 직업 오픈', '8 Careers Open', '8大職業稼働', '8大职业开放'),
      color: 'text-zinc-300 font-mono',
    },
    {
      icon: ShieldCheck,
      label: localeLabel(locale, '금융 무결성', 'Integrity', '完全性', '完整性'),
      value: '100% Verified',
      color: 'text-emerald-400 font-mono font-semibold',
    },
    {
      icon: Activity,
      label: localeLabel(locale, '통화 유동성 지수', 'Liquidity Index', '流動性指数', '流动性指数'),
      value: '0.98 Balanced',
      color: 'text-zinc-300 font-mono',
    },
  ];

  return (
    <div className="w-full max-w-full min-w-0 border-b border-border/40 bg-muted/20 backdrop-blur-sm overflow-hidden py-1.5 select-none">
      <div className="mx-auto max-w-[1440px] w-full min-w-0 flex items-center justify-between gap-3 text-[11px] sm:text-xs px-2.5 min-[400px]:px-3 min-[480px]:px-4 sm:px-6 lg:px-5 xl:px-8">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--primary)] opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-[var(--primary)]" />
          </span>
          <span className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
            {localeLabel(locale, '실시간 지표', 'LIVE METRICS', 'リアルタイム指標', '实时指标')}
          </span>
        </div>

        <div className="flex flex-1 min-w-0 items-center justify-start gap-4 sm:gap-8 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap">
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
