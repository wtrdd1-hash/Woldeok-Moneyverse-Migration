'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Cpu,
  TrendingUp,
  Play,
  RotateCcw,
  Sparkles,
  BarChart3,
  Sliders,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  Layers,
  Zap,
} from 'lucide-react';
import {
  INITIAL_QUANT_PRESETS,
  simulateQuantStrategy,
  calculateGridLevels,
  type QuantBotConfig,
  type QuantStrategyType,
  type BacktestResult,
} from '@moneyverse/contract';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { groupDigits } from '@/lib/money';

const HISTORICAL_SAMPLE_PRICES = [
  50000, 48500, 47200, 49000, 51500, 53200, 52000, 54800, 56000, 54500,
  52800, 51000, 49500, 50800, 53500, 55200, 57800, 59000, 57500, 61000,
];

export default function QuantStudioPage() {
  const [bots, setBots] = useState<readonly QuantBotConfig[]>(INITIAL_QUANT_PRESETS);
  const [strategyType, setStrategyType] = useState<QuantStrategyType>('DCA');
  const [symbol, setSymbol] = useState<string>('CHIPS');
  const [capital, setCapital] = useState<number>(100000);
  const [takeProfit, setTakeProfit] = useState<number>(12.0);
  const [stopLoss, setStopLoss] = useState<number>(6.5);
  const [backtestResult, setBacktestResult] = useState<BacktestResult | null>(null);
  const [isRunningTest, setIsRunningTest] = useState<boolean>(false);
  const [createdBotMsg, setCreatedBotMsg] = useState<string | null>(null);

  // 백테스팅 실행 핸들러
  const handleRunBacktest = () => {
    setIsRunningTest(true);
    setTimeout(() => {
      const result = simulateQuantStrategy(
        strategyType,
        capital,
        takeProfit,
        stopLoss,
        HISTORICAL_SAMPLE_PRICES,
      );
      setBacktestResult(result);
      setIsRunningTest(false);
    }, 600);
  };

  // 신규 봇 활성화 등록
  const handleDeployBot = () => {
    const newBot: QuantBotConfig = {
      id: `bot-${Date.now()}`,
      name: `${symbol} ${strategyType} 자동화 봇`,
      symbol,
      strategyType,
      initialCapitalWld: capital,
      intervalMinutes: 60,
      takeProfitPct: takeProfit,
      stopLossPct: stopLoss,
      isActive: true,
    };
    setBots((prev) => [newBot, ...prev]);
    setCreatedBotMsg(`'${newBot.name}'이(가) 활성화되어 백그라운드 자동 매매 풀에 등록되었습니다!`);
    setTimeout(() => {
      setCreatedBotMsg(null);
    }, 4000);
  };

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      {/* Alert Notification */}
      {createdBotMsg && (
        <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 flex items-center gap-3 text-sm font-semibold">
          <CheckCircle2 className="size-5 shrink-0" />
          <span>{createdBotMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-bold text-purple-400">
          <Zap className="size-3.5" />
          <span>노코드 알고리즘 트레이딩 엔진</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-3">
              <Cpu className="size-8 text-purple-400" />
              <span>노코드 퀀트 봇 스튜디오</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1 max-w-2xl leading-relaxed">
              복잡한 파이썬 코드 없이 클릭만으로 DCA, 그리드, RSI 퀀트 전략을 설계하고 과거 시세로 1초 만에 수익률을 백테스팅하세요.
            </p>
          </div>
          <Link
            href="/stocks"
            className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-card/60 px-4 py-2 text-xs font-semibold text-foreground hover:bg-card/90 transition-colors"
          >
            <span>가상 주식 거래소</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Strategy Builder Controls */}
        <Card className="lg:col-span-6 border-border/80 bg-card/80 backdrop-blur-sm">
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Sliders className="size-5 text-purple-400" />
              <span>퀀트 전략 파라미터 빌더</span>
            </CardTitle>
            <CardDescription className="text-xs">
              알고리즘 유형과 종목, 자본금, 리스크 관리 비율을 설정하세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {/* Strategy Select */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">알고리즘 전략 유형</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'DCA', label: 'DCA 분할매수', desc: '정기 저가 매집' },
                  { id: 'GRID', label: '그리드 차익', desc: '박스권 무한 매매' },
                  { id: 'RSI_MOMENTUM', label: 'RSI 모멘텀', desc: '과매도 반등 스윙' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStrategyType(s.id as QuantStrategyType)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      strategyType === s.id
                        ? 'border-purple-500 bg-purple-500/10 text-purple-300 ring-1 ring-purple-500/40'
                        : 'border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <span className="block text-xs font-bold">{s.label}</span>
                    <span className="block text-[10px] text-muted-foreground mt-0.5">{s.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Symbol & Capital */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">타깃 가상 종목</Label>
                <select
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-xs font-mono font-bold"
                >
                  <option value="CHIPS">침팬지 반도체 (CHIPS)</option>
                  <option value="DUCKS">월덕 인더스트리 (DUCKS)</option>
                  <option value="COIN">도지 밈 파이낸스 (COIN)</option>
                  <option value="SPACE">덕스페이스 로켓 (SPACE)</option>
                  <option value="GAME">도파민 게임즈 (GAME)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold">운용 자본금 (WLD)</Label>
                <Input
                  type="number"
                  min="10000"
                  step="10000"
                  value={capital}
                  onChange={(e) => setCapital(Number(e.target.value))}
                  className="font-mono text-xs"
                />
              </div>
            </div>

            {/* Risk Controls: Take Profit & Stop Loss */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-emerald-400">목표 익절율 (+%)</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  step="0.5"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(Number(e.target.value))}
                  className="font-mono text-xs text-emerald-400"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-red-400">손절매 한도 (-%)</Label>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  step="0.5"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(Number(e.target.value))}
                  className="font-mono text-xs text-red-400"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-3">
              <Button
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-11 shadow-sm"
                onClick={handleRunBacktest}
                disabled={isRunningTest}
              >
                <Play className="size-4 mr-1.5" />
                <span>{isRunningTest ? '시뮬레이션 연산 중...' : '1초 백테스팅 실행'}</span>
              </Button>
              <Button
                variant="outline"
                className="flex-1 font-bold text-xs h-11 border-purple-500/40 text-purple-300 hover:bg-purple-500/10"
                onClick={handleDeployBot}
              >
                <Sparkles className="size-4 mr-1.5" />
                <span>실전 자동매매 투입</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Backtest Results & Analytics */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="border-purple-500/40 bg-gradient-to-br from-card via-card to-purple-500/5 shadow-md">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BarChart3 className="size-5 text-purple-400" />
                  <span>백테스팅 시뮬레이션 성과</span>
                </span>
                {backtestResult && (
                  <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    검증 완료
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5 space-y-5">
              {backtestResult ? (
                <>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-muted-foreground block font-semibold">예상 총 수익률</span>
                      <span
                        className={`text-3xl font-black font-mono tracking-tight ${
                          backtestResult.totalReturnPct >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {backtestResult.totalReturnPct >= 0 ? '+' : ''}
                        {backtestResult.totalReturnPct}%
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground block font-semibold">최종 예상 자산</span>
                      <span className="text-xl font-bold font-mono text-purple-300">
                        {groupDigits(backtestResult.finalCapitalWld)} WLD
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-2 text-center">
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                      <span className="text-[11px] text-muted-foreground block">매매 승률</span>
                      <span className="text-sm font-bold font-mono text-emerald-400 mt-0.5 block">
                        {backtestResult.winRatePct}%
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                      <span className="text-[11px] text-muted-foreground block">최대 낙폭 (MDD)</span>
                      <span className="text-sm font-bold font-mono text-red-400 mt-0.5 block">
                        -{backtestResult.maxDrawdownPct}%
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                      <span className="text-[11px] text-muted-foreground block">총 체결 횟수</span>
                      <span className="text-sm font-bold font-mono text-foreground mt-0.5 block">
                        {backtestResult.totalTrades}회
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-10 space-y-2 text-muted-foreground">
                  <Cpu className="size-10 mx-auto text-purple-400/40 animate-pulse" />
                  <p className="text-xs">좌측에서 파라미터를 설정하고 [1초 백테스팅 실행]을 클릭하세요.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Bots List */}
          <Card className="border-border/80 bg-card/60">
            <CardHeader className="py-3 px-4 border-b border-border/60">
              <CardTitle className="text-xs font-bold flex items-center gap-2">
                <Layers className="size-4 text-purple-400" />
                <span>운용 중인 퀀트 봇 프리셋 ({bots.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40 text-xs">
                {bots.map((b) => (
                  <div key={b.id} className="p-3 flex items-center justify-between hover:bg-muted/20 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] font-mono font-bold">
                          {b.strategyType}
                        </Badge>
                        <span className="font-bold text-foreground">{b.name}</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground mt-0.5 block font-mono">
                        자본금 {groupDigits(b.initialCapitalWld)} WLD · 익절 +{b.takeProfitPct}% · 손절 -{b.stopLossPct}%
                      </span>
                    </div>
                    <Badge className={b.isActive ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-muted text-muted-foreground'}>
                      {b.isActive ? '운용중' : '대기'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ for SEO */}
      <div className="rounded-2xl border border-border/70 bg-muted/20 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-foreground font-bold text-base">
          <HelpCircle className="size-5 text-purple-400" />
          <span>노코드 퀀트 봇 자주 묻는 질문 (FAQ)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div className="space-y-1.5">
            <p className="font-semibold text-foreground">Q. 봇이 꺼지면 매매가 중단되나요?</p>
            <p className="leading-relaxed">아닙니다. 브라우저를 닫아도 서버 백그라운드 엔진에서 설정된 주기마다 주문 조건을 자동 체크합니다.</p>
          </div>
          <div className="space-y-1.5">
            <p className="font-semibold text-foreground">Q. 손절매(Stop-Loss)는 어떻게 작동하나요?</p>
            <p className="leading-relaxed">설정한 손절 비율에 도달하면 시장가로 즉시 전량 매도하여 추가 자산 손실을 차단합니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
