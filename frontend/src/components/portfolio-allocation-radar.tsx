'use client';

import { useState, useId } from 'react';
import Link from 'next/link';
import { PieChart, TrendingUp, ShieldCheck, ArrowRight, Sparkles, Scale, Info, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { groupDigits } from '@/lib/money';
import { useLocale } from '@/components/locale-provider';
import { localeLabel } from '@/lib/locale';
import { cn } from '@/lib/cn';

export interface PortfolioAllocationRadarProps {
  readonly cashWld?: number;
  readonly stocksWld?: number;
  readonly bondsWld?: number;
  readonly savingsWld?: number;
  readonly className?: string;
}

interface AssetSlice {
  readonly id: 'cash' | 'stocks' | 'bonds' | 'savings';
  readonly label: string;
  readonly value: number;
  readonly color: string;
  readonly bgClass: string;
  readonly textClass: string;
}

export function PortfolioAllocationRadar({
  cashWld = 1000000,
  stocksWld = 450000,
  bondsWld = 200000,
  savingsWld = 350000,
  className = '',
}: PortfolioAllocationRadarProps) {
  const { locale } = useLocale();
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [strategy, setStrategy] = useState<'buffett' | 'allWeather' | 'conservative'>('buffett');

  const totalWealth = Math.max(1, cashWld + stocksWld + bondsWld + savingsWld);

  const assets: AssetSlice[] = [
    {
      id: 'cash',
      label: localeLabel(locale, '현금 잔고', 'Cash', '現金', '现金'),
      value: cashWld,
      color: '#10b981', // emerald-500
      bgClass: 'bg-emerald-500/15',
      textClass: 'text-emerald-400',
    },
    {
      id: 'stocks',
      label: localeLabel(locale, '가상 주식', 'Stocks', '株式', '虚拟股票'),
      value: stocksWld,
      color: '#3b82f6', // blue-500
      bgClass: 'bg-blue-500/15',
      textClass: 'text-blue-400',
    },
    {
      id: 'bonds',
      label: localeLabel(locale, '국채 (KTB)', 'Bonds', '国債', '国债'),
      value: bondsWld,
      color: '#8b5cf6', // violet-500
      bgClass: 'bg-violet-500/15',
      textClass: 'text-violet-400',
    },
    {
      id: 'savings',
      label: localeLabel(locale, '정기 예적금', 'Savings', '定期預金', '定期储蓄'),
      value: savingsWld,
      color: '#f59e0b', // amber-500
      bgClass: 'bg-amber-500/15',
      textClass: 'text-amber-400',
    },
  ];

  // 도넛 차트 둘레 및 오프셋 계산
  const radius = 70;
  const circumference = 2 * Math.PI * radius; // ~439.82
  let accumulatedPercent = 0;

  const slices = assets.map((asset) => {
    const percent = (asset.value / totalWealth) * 100;
    const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += percent;
    return {
      ...asset,
      percent,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  // AI 리밸런싱 조언 모델
  const cashRatio = (cashWld / totalWealth) * 100;
  const stockRatio = (stocksWld / totalWealth) * 100;

  let adviceTitle = '';
  let adviceDesc = '';
  let suggestedAction = '';
  let actionLink = '/stocks';

  if (strategy === 'buffett') {
    // 버핏 90:10 모델 (주식 90%, 현금 10%)
    if (stockRatio < 50) {
      adviceTitle = localeLabel(
        locale,
        '워렌 버핏 공격형 성장 모델 제안',
        'Buffett Aggressive Growth Recommendation',
        'バフェット式成長モデルの提案',
        '巴菲特成长型配置建议',
      );
      adviceDesc = localeLabel(
        locale,
        `현재 주식 비중(${stockRatio.toFixed(1)}%)이 목표(90%)보다 현저히 낮습니다. 현금을 우량 가상 주식(CHIPS, DUCKS)에 분할 투자하여 자산 복리 성장을 가속화하세요.`,
        `Current stock ratio (${stockRatio.toFixed(1)}%) is below target (90%). Consider investing idle cash into prime stocks.`,
        `現在の株式比率（${stockRatio.toFixed(1)}%）が目標より低めです。主力銘柄への分散投資をお勧めします。`,
        `当前股票比例（${stockRatio.toFixed(1)}%）低于目标配置。建议将闲置资金配置至核心股票。`,
      );
      suggestedAction = localeLabel(locale, '우량주 모의투자 바로가기', 'Explore Stocks', '株式投資へ', '前往股票交易');
      actionLink = '/stocks';
    } else {
      adviceTitle = localeLabel(
        locale,
        '최적의 성장 포트폴리오 유지 중',
        'Optimal Growth Ratio Maintained',
        '最適な成長ポートフォリオを維持中',
        '配置比例良好',
      );
      adviceDesc = localeLabel(
        locale,
        '주식과 성장 자산 비중이 건강하게 유지되고 있습니다. 정기 배당 수취 후 재투자 전략을 유지하세요.',
        'High equity ratio maintained. Keep reinvesting dividends.',
        '株式比率が良好です。配当の再投資を継続してください。',
        '权益类资产配置健康，建议保持股息再投资。',
      );
      suggestedAction = localeLabel(locale, '배당 현황 확인', 'Check Dividends', '配当確認', '查看分红');
      actionLink = '/stocks/portfolio';
    }
  } else if (strategy === 'allWeather') {
    // 올웨더 모델 (주식 30%, 국채 40%, 예금/현금 30%)
    adviceTitle = localeLabel(
      locale,
      '레이 달리오 올웨더 4계절 방어형 모델',
      'Ray Dalio All-Weather Defense Model',
      'レイ・ダリオ全天候型防御モデル',
      '全天候防守型配置模型',
    );
    adviceDesc = localeLabel(
      locale,
      `급격한 시장 변동성에 대비해 확정 이자 국채(KTB)와 분산 예금 비중을 40% 이상 확보하여 하락장 리스크를 헤지하세요.`,
      `Secure over 40% in fixed-coupon KTB bonds and deposits to hedge market volatility.`,
      `市場の変動に備え、確定利回り国債や定期預金の比率を40%以上確保しましょう。`,
      `配置40%以上的固定票息国债和储蓄以对冲市场波动风险。`,
    );
    suggestedAction = localeLabel(locale, '국채(KTB) 거래소 가기', 'View KTB Bonds', '国債取引所へ', '前往国债市场');
    actionLink = '/bonds';
  } else {
    // 안정 지향 (현금/예금 중심)
    adviceTitle = localeLabel(
      locale,
      '무위험 일일 복리 이자 극대화 모델',
      'Risk-Free Compound Interest Maximizer',
      '元本保証・複利利息最大化モデル',
      '低风险复利最大化模型',
    );
    adviceDesc = localeLabel(
      locale,
      `가상 은행의 일일 복리 예금 포켓에 현금을 거치하여 원금 손실 0%로 매일 자정 확정 이자를 파밍하세요.`,
      `Deposit cash into Virtual Bank to farm risk-free daily compound interest.`,
      `仮想銀行の複利口座に預け入れ、ノーリスクで毎日利息を獲得しましょう。`,
      `存入虚拟银行复利账户，无风险每日获取利息收益。`,
    );
    suggestedAction = localeLabel(locale, '가상 은행 예금하기', 'Deposit to Bank', '銀行へ預金', '前往银行存入');
    actionLink = '/bank';
  }

  return (
    <div
      className={cn(
        'rounded-2xl border border-border/80 bg-card p-5 shadow-sm text-card-foreground space-y-5',
        className,
      )}
    >
      {/* 상단 타이틀 & 전략 전환 탭 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <PieChart className="size-5" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              {localeLabel(
                locale,
                '실시간 자산 배분 & AI 리밸런싱 레이더',
                'Asset Allocation & Rebalancing Radar',
                '資産配分＆AIリバランスレーダー',
                '资产配置与AI动态再平衡',
              )}
              <Badge className="bg-primary/15 text-primary border-primary/30 text-[10px] px-1.5 py-0 font-bold">
                FINTECH
              </Badge>
            </h3>
            <p className="text-xs text-muted-foreground">
              {localeLabel(
                locale,
                '보유 현금, 주식, 국채, 예적금 비중을 실시간 진단하고 최적의 포트폴리오를 제안합니다.',
                'Real-time diagnosis of cash, stocks, bonds, and deposits with optimal allocation advice.',
                '現金・株式・国債・預金の比率をリアルタイムで診断し最適な配分を提案します。',
                '实时监测现金、股票、国债及储蓄比例并提供科学调仓建议。',
              )}
            </p>
          </div>
        </div>

        {/* 벤치마크 선택 버튼군 */}
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setStrategy('buffett')}
            className={cn(
              'px-2.5 py-1 text-xs font-bold rounded-lg transition-all',
              strategy === 'buffett'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {localeLabel(locale, '워렌 버핏 (성장형)', 'Buffett (Growth)', 'バフェット型', '巴菲特成长型')}
          </button>
          <button
            type="button"
            onClick={() => setStrategy('allWeather')}
            className={cn(
              'px-2.5 py-1 text-xs font-bold rounded-lg transition-all',
              strategy === 'allWeather'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {localeLabel(locale, '올웨더 (균형형)', 'All-Weather', '全天候型', '全天候平衡型')}
          </button>
          <button
            type="button"
            onClick={() => setStrategy('conservative')}
            className={cn(
              'px-2.5 py-1 text-xs font-bold rounded-lg transition-all',
              strategy === 'conservative'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {localeLabel(locale, '복리예금 (안정형)', 'Safe Yield', '安定預金型', '稳健储蓄型')}
          </button>
        </div>
      </div>

      {/* 중앙 2열: 인터랙티브 SVG 도넛 차트 + 자산군 리스트 */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* SVG 도넛 차트 */}
        <div className="md:col-span-5 flex flex-col items-center justify-center relative py-2">
          <div className="relative size-44 sm:size-48">
            <svg viewBox="0 0 180 180" className="size-full -rotate-90">
              <circle
                cx="90"
                cy="90"
                r={radius}
                className="stroke-muted/30"
                strokeWidth="20"
                fill="none"
              />
              {slices.map((slice) => (
                <circle
                  key={slice.id}
                  cx="90"
                  cy="90"
                  r={radius}
                  stroke={slice.color}
                  strokeWidth={selectedAsset === slice.id ? 26 : 20}
                  strokeDasharray={slice.strokeDasharray}
                  strokeDashoffset={slice.strokeDashoffset}
                  strokeLinecap="butt"
                  fill="none"
                  className="transition-all duration-300 cursor-pointer hover:opacity-90"
                  onMouseEnter={() => setSelectedAsset(slice.id)}
                  onMouseLeave={() => setSelectedAsset(null)}
                />
              ))}
            </svg>
            {/* 도넛 차트 중앙 텍스트 */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-[11px] font-bold text-muted-foreground">
                {localeLabel(locale, '총 자산(AUM)', 'Total Wealth', '総資産', '总资产')}
              </span>
              <span className="text-base sm:text-lg font-black font-mono text-foreground tracking-tight">
                {groupDigits(totalWealth.toString())}
              </span>
              <span className="text-[10px] font-bold text-primary font-mono">WLD</span>
            </div>
          </div>
        </div>

        {/* 자산군별 세부 비중 리스트 */}
        <div className="md:col-span-7 space-y-2.5">
          {slices.map((slice) => {
            const isHovered = selectedAsset === slice.id;
            return (
              <div
                key={slice.id}
                onMouseEnter={() => setSelectedAsset(slice.id)}
                onMouseLeave={() => setSelectedAsset(null)}
                className={cn(
                  'flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer',
                  isHovered
                    ? 'border-primary/60 bg-primary/5 shadow-xs scale-[1.01]'
                    : 'border-border/60 bg-muted/20 hover:border-border',
                )}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="size-3 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: slice.color }}
                  />
                  <div>
                    <span className="text-xs font-bold text-foreground block">
                      {slice.label}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {groupDigits(slice.value.toString())} WLD
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={cn('text-sm font-extrabold font-mono', slice.textClass)}>
                    {slice.percent.toFixed(1)}%
                  </span>
                  <div className="w-20 sm:w-28 bg-muted rounded-full h-1.5 mt-1 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, slice.percent)}%`,
                        backgroundColor: slice.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 하단: AI 리밸런싱 조언 & 원클릭 이동 배너 */}
      <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <h4 className="text-xs font-extrabold text-foreground">{adviceTitle}</h4>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {adviceDesc}
          </p>
        </div>

        <Button
          asChild
          size="sm"
          className="shrink-0 h-9 font-bold gap-1.5 shadow-sm active:scale-95 transition-transform"
        >
          <Link href={actionLink}>
            <span>{suggestedAction}</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
