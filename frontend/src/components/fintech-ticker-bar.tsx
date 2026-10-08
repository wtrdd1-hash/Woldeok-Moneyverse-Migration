'use client';

import { useLocale } from '@/components/locale-provider';
import { localeLabel } from '@/lib/locale';
import { TrendingUp, Coins, Briefcase, Activity, ShieldCheck } from 'lucide-react';

export function FintechTickerBar() {
  const { locale } = useLocale();

  const items = [
    {
      icon: Coins,
      label: localeLabel(locale, 'WLD 원장 상태', 'WLD Network Ledger', 'WLD元帳状態', 'WLD账本状态'),
      value: localeLabel(locale, '정상 가동 (805개 노드)', 'Optimal (805 Active Nodes)', '正常稼働 (805ノード)', '正常运行 (805个节点)'),
      color: 'text-amber-500',
    },
    {
      icon: TrendingUp,
      label: localeLabel(locale, '최고 상승: 월덕게임즈', 'Top Mover: WDG', '急上昇銘柄: ウォルドクゲームズ', '最大涨幅: 月德游戏'),
      value: '+4.8% ▲',
      color: 'text-[var(--rise)] font-bold',
    },
    {
      icon: Briefcase,
      label: localeLabel(locale, '일일 직업 보상창', 'Daily Work Window', '日次職業報酬', '每日职业奖励窗口'),
      value: localeLabel(locale, '진행 중 · 8대 직업 가동', 'Open · 8 Careers Active', '進行中 · 8大職業稼働', '进行中 · 8大职业运行'),
      color: 'text-blue-500',
    },
    {
      icon: ShieldCheck,
      label: localeLabel(locale, '금융 무결성', 'System Integrity', '金融の完全性', '金融完整性'),
      value: '100.0% Verified',
      color: 'text-[var(--primary)]',
    },
    {
      icon: Activity,
      label: localeLabel(locale, '통화 유동성 지수', 'Live Faucet / Sink', '通貨流動性指数', '货币流动性指数'),
      value: 'Balanced (0.98)',
      color: 'text-purple-500',
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
