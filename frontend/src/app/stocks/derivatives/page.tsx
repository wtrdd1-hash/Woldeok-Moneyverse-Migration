'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Zap,
  Activity,
  Flame,
  Clock,
  Sliders,
  DollarSign,
  Share2,
  XCircle,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  Info,
  CheckCircle2,
  Copy,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  DERIVATIVES_MARKET_SYMBOLS,
  LEVERAGE_PRESETS,
  calculateLiquidationPrice,
  calculateDerivativesPnL,
  calculateFundingFee,
  calculateLiquidationSettlement,
  generateLiquidationHeatmap,
  type DerivativesMarketSymbol,
  type DerivativesPosition,
  type PositionSide,
} from '@moneyverse/contract';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { groupDigits } from '@/lib/money';

export default function DerivativesPage() {
  const [symbols, setSymbols] = useState<DerivativesMarketSymbol[]>(DERIVATIVES_MARKET_SYMBOLS);
  const [selectedSymbol, setSelectedSymbol] = useState<DerivativesMarketSymbol>(DERIVATIVES_MARKET_SYMBOLS[0]!);
  
  // 주문 폼 상태
  const [side, setSide] = useState<PositionSide>('LONG');
  const [leverage, setLeverage] = useState<number>(5);
  const [marginInput, setMarginInput] = useState<string>('1000000'); // 1,000,000 WLD
  const [enableTpSl, setEnableTpSl] = useState<boolean>(false);
  const [tpPriceInput, setTpPriceInput] = useState<string>('');
  const [slPriceInput, setSlPriceInput] = useState<string>('');
  
  // 유저 자산 및 포지션 상태
  const [userWldBalance, setUserWldBalance] = useState<number>(50000000); // 5천만 WLD 가상 시드
  const [positions, setPositions] = useState<DerivativesPosition[]>([
    {
      id: 'pos-1',
      symbol: 'WDG',
      name: '월덕게임즈',
      side: 'LONG',
      marginMode: 'ISOLATED',
      leverage: 10,
      entryPrice: 12100,
      currentPrice: 12500,
      margin: 2000000,
      positionValue: 20000000,
      quantity: 1652.89,
      liquidationPrice: 11495,
      takeProfitPrice: 13500,
      stopLossPrice: 11800,
      pnl: 661157,
      roi: 33.06,
      createdAt: '2026-09-28 00:15:00',
    },
    {
      id: 'pos-2',
      symbol: 'BIO',
      name: '월덕바이오',
      side: 'SHORT',
      marginMode: 'ISOLATED',
      leverage: 5,
      entryPrice: 6500,
      currentPrice: 6200,
      margin: 1500000,
      positionValue: 7500000,
      quantity: 1153.84,
      liquidationPrice: 7475,
      pnl: 346153,
      roi: 23.08,
      createdAt: '2026-09-28 00:45:00',
    },
  ]);

  // 통계 및 알림 상태
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [pnlCardModalPosition, setPnlCardModalPosition] = useState<DerivativesPosition | null>(null);
  const [copiedPnl, setCopiedPnl] = useState<boolean>(false);

  // 실시간 시세 변동 타이머 시뮬레이션
  useEffect(() => {
    const interval = setInterval(() => {
      setSymbols((prev) =>
        prev.map((s) => {
          const delta = (Math.random() - 0.48) * (s.currentPrice * 0.004);
          const nextPrice = Math.max(10, Math.round(s.currentPrice + delta));
          return {
            ...s,
            currentPrice: nextPrice,
          };
        })
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // 선택 종목 동기화 및 포지션 실시간 PnL 갱신
  useEffect(() => {
    const current = symbols.find((s) => s.symbol === selectedSymbol.symbol);
    if (current) {
      setSelectedSymbol(current);
    }

    setPositions((prev) =>
      prev.map((pos) => {
        const symbolData = symbols.find((s) => s.symbol === pos.symbol);
        const currPrice = symbolData ? symbolData.currentPrice : pos.currentPrice;
        const { pnl, roi } = calculateDerivativesPnL(
          pos.entryPrice,
          currPrice,
          pos.margin,
          pos.leverage,
          pos.side
        );
        return {
          ...pos,
          currentPrice: currPrice,
          pnl,
          roi,
        };
      })
    );
  }, [symbols, selectedSymbol.symbol]);

  const marginNumber = Math.max(0, parseInt(marginInput.replace(/,/g, ''), 10) || 0);
  const estimatedLiquidationPrice = calculateLiquidationPrice(selectedSymbol.currentPrice, leverage, side);
  const heatmapClusters = generateLiquidationHeatmap(selectedSymbol.currentPrice);

  // 롱/숏 포지션 오픈 핸들러
  const handleOpenPosition = () => {
    if (marginNumber <= 0) {
      setActionMessage('증거금(Margin)을 1 WLD 이상 입력해주세요.');
      setTimeout(() => setActionMessage(null), 3000);
      return;
    }
    if (marginNumber > userWldBalance) {
      setActionMessage('지갑의 WLD 잔고가 부족합니다.');
      setTimeout(() => setActionMessage(null), 3000);
      return;
    }

    const positionValue = marginNumber * leverage;
    const quantity = Number((positionValue / selectedSymbol.currentPrice).toFixed(2));
    const liqPrice = estimatedLiquidationPrice;
    const tp = enableTpSl && tpPriceInput ? parseInt(tpPriceInput.replace(/,/g, ''), 10) : undefined;
    const sl = enableTpSl && slPriceInput ? parseInt(slPriceInput.replace(/,/g, ''), 10) : undefined;

    const newPosition: DerivativesPosition = {
      id: `pos-${Date.now()}`,
      symbol: selectedSymbol.symbol,
      name: selectedSymbol.name,
      side,
      marginMode: 'ISOLATED',
      leverage,
      entryPrice: selectedSymbol.currentPrice,
      currentPrice: selectedSymbol.currentPrice,
      margin: marginNumber,
      positionValue,
      quantity,
      liquidationPrice: liqPrice,
      takeProfitPrice: tp,
      stopLossPrice: sl,
      pnl: 0,
      roi: 0,
      createdAt: new Date().toLocaleTimeString('ko-KR', { hour12: false }),
    };

    setUserWldBalance((prev) => prev - marginNumber);
    setPositions((prev) => [newPosition, ...prev]);
    setActionMessage(`${selectedSymbol.name} ${leverage}x ${side === 'LONG' ? '롱' : '숏'} 격리 포지션이 체결되었습니다!`);
    setTimeout(() => setActionMessage(null), 4000);
  };

  // 포지션 시장가 종료(정산) 핸들러
  const handleClosePosition = (pos: DerivativesPosition) => {
    const returnAmount = pos.margin + pos.pnl;
    const isLiquidated = pos.pnl <= -pos.margin;

    if (isLiquidated) {
      const settlement = calculateLiquidationSettlement(pos.margin);
      setActionMessage(`[청산 집행] 증거금 ${groupDigits(pos.margin)} WLD 중 50%(${groupDigits(settlement.insuranceFundDeposit)} WLD)는 보험펀드에 적립되고 50%(${groupDigits(settlement.hardBurnWld)} WLD)는 영구 소각(Hard Sink)되었습니다.`);
    } else {
      setUserWldBalance((prev) => Math.max(0, prev + returnAmount));
      setActionMessage(`${pos.name} ${pos.leverage}x 포지션이 정산 종료되었습니다. (손익: ${pos.pnl >= 0 ? '+' : ''}${groupDigits(pos.pnl)} WLD, 원리금 반환: ${groupDigits(Math.max(0, returnAmount))} WLD)`);
    }

    setPositions((prev) => prev.filter((p) => p.id !== pos.id));
    setTimeout(() => setActionMessage(null), 5000);
  };

  // PnL 카드 클립보드 복사
  const handleCopyPnlText = (pos: DerivativesPosition) => {
    const text = `[월덕 파생상품 거래소]\n종목: ${pos.name} (${pos.symbol})\n포지션: ${pos.leverage}x ${pos.side}\n수익률: ${pos.roi >= 0 ? '+' : ''}${pos.roi}%\n손익: ${pos.pnl >= 0 ? '+' : ''}${groupDigits(pos.pnl)} WLD\n진입가: ${groupDigits(pos.entryPrice)} WLD -> 현재가: ${groupDigits(pos.currentPrice)} WLD`;
    navigator.clipboard.writeText(text);
    setCopiedPnl(true);
    setTimeout(() => setCopiedPnl(false), 2500);
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-8 px-3 sm:px-6 py-6 sm:py-8 overflow-x-hidden">
      {/* 1. HERO BENTO GRID HEADER */}
      <section className="rounded-2xl sm:rounded-3xl border border-zinc-800/80 bg-card/95 p-5 sm:p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="flex size-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground">
              WOLDEOK DERIVATIVES · 10X 레버리지 파생상품 선물 거래소
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />
            <span>격리 마진(Isolated) 안전 보호 & 8시간 펀딩비 엔진</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Hero Left: 현재 선택 종목 시세 & 통계 */}
          <div className="space-y-4 lg:col-span-8">
            <div className="flex flex-wrap items-baseline gap-3">
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                {selectedSymbol.name}
                <span className="text-sm sm:text-lg font-mono font-bold text-muted-foreground">
                  {selectedSymbol.symbol}/WLD
                </span>
              </h1>
              <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-purple-400 font-mono text-xs">
                최대 10x 레버리지
              </Badge>
            </div>

            <div className="flex flex-wrap items-baseline gap-4">
              <span className="font-mono text-3xl sm:text-5xl font-black tracking-tight text-foreground">
                {groupDigits(selectedSymbol.currentPrice)}{' '}
                <span className="text-base sm:text-xl font-bold text-muted-foreground">WLD</span>
              </span>
              <span
                className={`flex items-center gap-1 font-mono text-base sm:text-xl font-bold ${
                  selectedSymbol.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {selectedSymbol.change24h >= 0 ? (
                  <TrendingUp className="size-5 shrink-0" />
                ) : (
                  <TrendingDown className="size-5 shrink-0" />
                )}
                {selectedSymbol.change24h >= 0 ? '+' : ''}
                {selectedSymbol.change24h}%
              </span>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground">{selectedSymbol.description}</p>

            {/* 4대 주요 선물 시장 지표 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="rounded-xl border border-zinc-800/80 bg-background/50 p-3">
                <span className="text-[11px] font-medium text-muted-foreground block">8시간 펀딩비율</span>
                <span className={`font-mono text-sm font-bold block mt-0.5 ${selectedSymbol.fundingRate >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {selectedSymbol.fundingRate >= 0 ? '+' : ''}{selectedSymbol.fundingRate}%
                </span>
                <span className="text-[10px] text-muted-foreground/80 mt-0.5 block flex items-center gap-1">
                  <Clock className="size-2.5" /> 4시간 후 정산
                </span>
              </div>
              <div className="rounded-xl border border-zinc-800/80 bg-background/50 p-3">
                <span className="text-[11px] font-medium text-muted-foreground block">24시간 선물 거래대금</span>
                <span className="font-mono text-sm font-bold text-foreground block mt-0.5">
                  {groupDigits(selectedSymbol.volume24h)} WLD
                </span>
                <span className="text-[10px] text-muted-foreground/80 mt-0.5 block">10대 종목 활성</span>
              </div>
              <div className="rounded-xl border border-zinc-800/80 bg-background/50 p-3">
                <span className="text-[11px] font-medium text-muted-foreground block">24H 최고 / 최저가</span>
                <span className="font-mono text-xs font-bold text-foreground block mt-0.5">
                  {groupDigits(selectedSymbol.high24h)} / {groupDigits(selectedSymbol.low24h)}
                </span>
                <span className="text-[10px] text-muted-foreground/80 mt-0.5 block">변동폭 정상</span>
              </div>
              <div className="rounded-xl border border-zinc-800/80 bg-background/50 p-3">
                <span className="text-[11px] font-medium text-muted-foreground block">롱/숏 포지션 비율</span>
                <div className="flex items-center justify-between text-[11px] font-mono font-bold mt-0.5">
                  <span className="text-emerald-400">L {selectedSymbol.longRatio}%</span>
                  <span className="text-rose-400">S {selectedSymbol.shortRatio}%</span>
                </div>
                <div className="w-full bg-rose-500/30 h-1.5 rounded-full overflow-hidden mt-1 flex">
                  <div className="bg-emerald-500 h-full" style={{ width: `${selectedSymbol.longRatio}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Hero Right: 내 선물 지갑 & 포지션 종합 요약 */}
          <div className="rounded-2xl border border-zinc-800/80 bg-background/60 p-4 sm:p-6 lg:col-span-4 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">내 WLD 가용 증거금</span>
                <Badge variant="secondary" className="font-mono text-[10px] bg-emerald-500/10 text-emerald-400 border-none">
                  격리 잔고 실시간
                </Badge>
              </div>
              <div className="mt-2 font-mono text-2xl sm:text-3xl font-black text-foreground">
                {groupDigits(userWldBalance)}{' '}
                <span className="text-xs sm:text-sm font-bold text-muted-foreground">WLD</span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-border/40 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">오픈 포지션 수</span>
                <span className="font-mono font-bold text-foreground">{positions.length}개</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">총 담보 예치 증거금</span>
                <span className="font-mono font-bold text-foreground">
                  {groupDigits(positions.reduce((acc, p) => acc + p.margin, 0))} WLD
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">총 미실현 손익 (PnL)</span>
                <span
                  className={`font-mono font-bold ${
                    positions.reduce((acc, p) => acc + p.pnl, 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {positions.reduce((acc, p) => acc + p.pnl, 0) >= 0 ? '+' : ''}
                  {groupDigits(positions.reduce((acc, p) => acc + p.pnl, 0))} WLD
                </span>
              </div>
            </div>

            <Button
              onClick={() => setUserWldBalance((prev) => prev + 10000000)}
              variant="outline"
              size="sm"
              className="w-full text-xs font-bold border-zinc-700 bg-background/80 hover:bg-muted"
            >
              <DollarSign className="size-3.5 mr-1 text-amber-400" />
              모의 선물 시드 +1,000만 WLD 충전
            </Button>
          </div>
        </div>

        {/* 10대 가상 선물 종목 수평 스크롤 탭 */}
        <div className="mt-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none border-t border-border/40 pt-4">
          {symbols.map((sym) => {
            const isSelected = selectedSymbol.symbol === sym.symbol;
            return (
              <button
                key={sym.symbol}
                onClick={() => setSelectedSymbol(sym)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                    : 'border border-zinc-800/80 bg-background/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <span>{sym.name}</span>
                <span className="font-mono font-semibold opacity-80">({sym.symbol})</span>
                <span
                  className={`font-mono text-[11px] font-bold ${
                    isSelected ? 'text-purple-200' : sym.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {sym.change24h >= 0 ? '+' : ''}
                  {sym.change24h}%
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 알림 토스트 배너 */}
      {actionMessage && (
        <div className="rounded-xl border border-purple-500/40 bg-purple-500/10 p-4 text-xs sm:text-sm font-semibold text-purple-300 shadow-md backdrop-blur-md flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-purple-400 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-muted-foreground hover:text-foreground">
            <XCircle className="size-4" />
          </button>
        </div>
      )}

      {/* 2. MAIN 2-COLUMN WORKSPACE GRID */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left 8-Cols: 청산 히트맵 & 활성 포지션 콘솔 */}
        <div className="space-y-6 lg:col-span-8">
          {/* ① 10대 가상 주식 실시간 청산 히트맵 (Liquidation Heatmap) */}
          <Card className="rounded-2xl border-zinc-800/80 bg-card/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                  <Activity className="size-5 text-purple-400" />
                  {selectedSymbol.name} 실시간 청산 히트맵 (Liquidation Heatmap)
                </CardTitle>
                <Badge variant="outline" className="text-[10px] font-mono border-zinc-700">
                  클러스터 밀집도 분석
                </Badge>
              </div>
              <CardDescription className="text-xs">
                현재가({groupDigits(selectedSymbol.currentPrice)} WLD) 기준 레버리지 배율별 롱/숏 강제 청산 위험 가격대 분포입니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {heatmapClusters.map((cluster, idx) => {
                  const isLong = cluster.type === 'LONG_LIQUIDATION';
                  const diffRatio = (
                    ((cluster.price - selectedSymbol.currentPrice) / selectedSymbol.currentPrice) *
                    100
                  ).toFixed(1);
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-zinc-800/60 bg-background/40 p-2.5 text-xs font-mono"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`size-2 rounded-full ${
                            isLong ? 'bg-rose-500' : 'bg-emerald-500'
                          }`}
                        />
                        <span className="font-bold text-foreground">
                          {isLong ? '롱 청산 위험가' : '숏 청산 위험가'}
                        </span>
                        <span className="text-muted-foreground text-[11px]">
                          ({diffRatio.startsWith('-') ? diffRatio : `+${diffRatio}`}%)
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-foreground">{groupDigits(cluster.price)} WLD</span>
                        <div className="w-20 sm:w-32 bg-zinc-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${isLong ? 'bg-rose-500' : 'bg-emerald-500'}`}
                            style={{ width: `${cluster.intensity}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted-foreground w-12 text-right">
                          {groupDigits(cluster.volume / 1000000)}M
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="rounded-xl border border-zinc-800/80 bg-muted/20 p-3 text-[11px] text-muted-foreground flex items-center gap-2">
                <Info className="size-4 text-purple-400 shrink-0" />
                <span>
                  <strong>청산 방어 펀드(Insurance Fund)</strong>: 강제 청산 발생 시 증거금의 50%는 중앙은행 보험기금으로 예치되며 50%는 영구 소각(Hard Sink)되어 WLD 인플레이션을 차단합니다.
                </span>
              </div>
            </CardContent>
          </Card>

          {/* ② 활성 포지션 콘솔 & 실시간 미실현 PnL 게이지 */}
          <Card className="rounded-2xl border-zinc-800/80 bg-card/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                  <Layers className="size-5 text-purple-400" />
                  보유 격리 포지션 ({positions.length})
                </CardTitle>
                <Badge variant="outline" className="text-[10px] font-mono border-zinc-700">
                  실시간 PnL 동기화
                </Badge>
              </div>
              <CardDescription className="text-xs">
                현재 오픈된 격리 마진 포지션 목록입니다. 시장가로 즉시 정산 종료하거나 자랑용 PnL 카드를 생성할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {positions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center text-xs text-muted-foreground">
                  현재 보유 중인 오픈 포지션이 없습니다. 우측 주문 콘솔에서 롱/숏 포지션을 개설해보세요.
                </div>
              ) : (
                <div className="space-y-4">
                  {positions.map((pos) => {
                    const isLong = pos.side === 'LONG';
                    const isProfit = pos.pnl >= 0;
                    return (
                      <div
                        key={pos.id}
                        className="rounded-xl border border-zinc-800/80 bg-background/60 p-4 space-y-3 transition-all hover:border-zinc-700"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              className={`font-mono text-xs font-bold ${
                                isLong
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                              }`}
                            >
                              {pos.leverage}x {pos.side}
                            </Badge>
                            <span className="font-extrabold text-foreground text-sm sm:text-base">
                              {pos.name}
                            </span>
                            <span className="font-mono text-xs text-muted-foreground">({pos.symbol})</span>
                            <Badge variant="secondary" className="text-[10px] font-mono">
                              {pos.marginMode}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => setPnlCardModalPosition(pos)}
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs font-bold border-zinc-700 hover:bg-muted"
                            >
                              <Share2 className="size-3.5 mr-1 text-purple-400" />
                              자랑 카드
                            </Button>
                            <Button
                              onClick={() => handleClosePosition(pos)}
                              variant="destructive"
                              size="sm"
                              className="h-8 text-xs font-bold bg-rose-600 hover:bg-rose-700"
                            >
                              시장가 종료
                            </Button>
                          </div>
                        </div>

                        {/* 포지션 수치 세부 그리드 */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1 border-t border-border/30">
                          <div>
                            <span className="text-muted-foreground text-[11px] block">미실현 손익 (PnL)</span>
                            <span
                              className={`font-mono text-sm font-black block mt-0.5 ${
                                isProfit ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {isProfit ? '+' : ''}
                              {groupDigits(pos.pnl)} WLD ({isProfit ? '+' : ''}
                              {pos.roi}%)
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-[11px] block">진입가 / 현재가</span>
                            <span className="font-mono text-xs font-bold text-foreground block mt-0.5">
                              {groupDigits(pos.entryPrice)} / {groupDigits(pos.currentPrice)} WLD
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-[11px] block">담보 증거금 (Margin)</span>
                            <span className="font-mono text-xs font-bold text-foreground block mt-0.5">
                              {groupDigits(pos.margin)} WLD
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-[11px] block">예상 청산가</span>
                            <span className="font-mono text-xs font-bold text-rose-400 block mt-0.5">
                              {groupDigits(pos.liquidationPrice)} WLD
                            </span>
                          </div>
                        </div>

                        {(pos.takeProfitPrice || pos.stopLossPrice) && (
                          <div className="flex items-center gap-3 text-[11px] font-mono text-muted-foreground bg-muted/20 px-3 py-1.5 rounded-lg">
                            {pos.takeProfitPrice && (
                              <span className="text-emerald-400">
                                TP(익절): {groupDigits(pos.takeProfitPrice)} WLD
                              </span>
                            )}
                            {pos.stopLossPrice && (
                              <span className="text-rose-400">
                                SL(손절): {groupDigits(pos.stopLossPrice)} WLD
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 4-Cols: 격리 마진 롱/숏 주문 콘솔 */}
        <div className="space-y-6 lg:col-span-4">
          <Card className="rounded-2xl border-zinc-800/80 bg-card/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg font-bold flex items-center gap-2">
                <Sliders className="size-5 text-purple-400" />
                선물 주문 콘솔
              </CardTitle>
              <CardDescription className="text-xs">
                격리 마진(Isolated) 모드로 안전하게 1x~10x 레버리지 주문을 실행합니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 롱 / 숏 사이드 셀렉터 */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSide('LONG')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-extrabold transition-all ${
                    side === 'LONG'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'border border-zinc-800 bg-background/50 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <ArrowUpRight className="size-4" />
                  롱 (매수/상승)
                </button>
                <button
                  type="button"
                  onClick={() => setSide('SHORT')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-extrabold transition-all ${
                    side === 'SHORT'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                      : 'border border-zinc-800 bg-background/50 text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <ArrowDownRight className="size-4" />
                  숏 (매도/하락)
                </button>
              </div>

              {/* 레버리지 배율 슬라이더 & 프리셋 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-muted-foreground">레버리지 배율</span>
                  <span className="font-mono text-sm font-black text-purple-400">{leverage}x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={leverage}
                  onChange={(e) => setLeverage(parseInt(e.target.value, 10))}
                  className="w-full accent-purple-500 h-2 bg-zinc-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between gap-1">
                  {LEVERAGE_PRESETS.map((lev) => (
                    <button
                      key={lev}
                      type="button"
                      onClick={() => setLeverage(lev)}
                      className={`flex-1 rounded-lg py-1 text-[11px] font-mono font-bold transition-all ${
                        leverage === lev
                          ? 'bg-purple-600 text-white'
                          : 'border border-zinc-800 bg-background/40 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      {lev}x
                    </button>
                  ))}
                </div>
              </div>

              {/* 담보 증거금 입력 (WLD) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-muted-foreground">담보 증거금 (Margin)</span>
                  <span className="text-[11px] text-muted-foreground">
                    잔고: {groupDigits(userWldBalance)} WLD
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={marginInput}
                    onChange={(e) => setMarginInput(e.target.value)}
                    placeholder="1,000,000"
                    className="w-full rounded-xl border border-zinc-800 bg-background/80 px-3 py-2.5 font-mono text-sm font-bold text-foreground placeholder:text-muted-foreground/50 focus:border-purple-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-2.5 font-mono text-xs font-bold text-muted-foreground">
                    WLD
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setMarginInput(Math.floor((userWldBalance * pct) / 100).toString())}
                      className="rounded-lg border border-zinc-800 bg-background/40 py-1 text-[10px] font-mono font-bold text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {/* TP / SL 예약 토글 및 입력 */}
              <div className="space-y-2 rounded-xl border border-zinc-800/60 bg-background/40 p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground flex items-center gap-1">
                    <Zap className="size-3.5 text-amber-400" />
                    TP / SL 예약 주문
                  </span>
                  <input
                    type="checkbox"
                    checked={enableTpSl}
                    onChange={(e) => setEnableTpSl(e.target.checked)}
                    className="accent-purple-500 cursor-pointer"
                  />
                </div>
                {enableTpSl && (
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div>
                      <label className="text-[10px] text-muted-foreground block mb-1">익절가 (TP)</label>
                      <input
                        type="text"
                        value={tpPriceInput}
                        onChange={(e) => setTpPriceInput(e.target.value)}
                        placeholder={`${Math.round(selectedSymbol.currentPrice * 1.1)}`}
                        className="w-full rounded-lg border border-zinc-800 bg-background px-2 py-1.5 font-mono text-xs font-bold text-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground block mb-1">손절가 (SL)</label>
                      <input
                        type="text"
                        value={slPriceInput}
                        onChange={(e) => setSlPriceInput(e.target.value)}
                        placeholder={`${Math.round(selectedSymbol.currentPrice * 0.95)}`}
                        className="w-full rounded-lg border border-zinc-800 bg-background px-2 py-1.5 font-mono text-xs font-bold text-rose-400"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 주문 요약 정보 */}
              <div className="space-y-1.5 rounded-xl border border-zinc-800/80 bg-background/60 p-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">총 포지션 가치</span>
                  <span className="font-mono font-bold text-foreground">
                    {groupDigits(marginNumber * leverage)} WLD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">예상 체결 수량</span>
                  <span className="font-mono font-bold text-foreground">
                    {Number(((marginNumber * leverage) / selectedSymbol.currentPrice).toFixed(2))} 주
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">예상 강제 청산가</span>
                  <span className="font-mono font-bold text-rose-400">
                    {groupDigits(estimatedLiquidationPrice)} WLD
                  </span>
                </div>
              </div>

              {/* 주문 실행 버튼 */}
              <Button
                onClick={handleOpenPosition}
                className={`w-full py-6 text-sm font-black transition-all ${
                  side === 'LONG'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20'
                    : 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20'
                }`}
              >
                {selectedSymbol.name} {leverage}x {side === 'LONG' ? '롱(매수)' : '숏(매도)'} 진입
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 3. PnL 자랑용 수익률 카드 모달 */}
      {pnlCardModalPosition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-zinc-700 bg-zinc-950 p-6 shadow-2xl space-y-6">
            <button
              onClick={() => setPnlCardModalPosition(null)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <XCircle className="size-5" />
            </button>

            {/* 카드 그래픽 영역 */}
            <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-br from-zinc-900 via-purple-950/40 to-zinc-900 p-6 space-y-4 shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-purple-400" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-purple-300">
                    WOLDEOK DERIVATIVES
                  </span>
                </div>
                <Badge
                  className={`font-mono text-xs font-black ${
                    pnlCardModalPosition.side === 'LONG'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {pnlCardModalPosition.leverage}x {pnlCardModalPosition.side}
                </Badge>
              </div>

              <div>
                <h2 className="text-xl font-black text-foreground">{pnlCardModalPosition.name}</h2>
                <p className="text-xs font-mono text-muted-foreground">{pnlCardModalPosition.symbol}/WLD</p>
              </div>

              <div className="py-2">
                <span className="text-xs font-semibold text-muted-foreground block">수익률 (ROI)</span>
                <span
                  className={`font-mono text-4xl sm:text-5xl font-black tracking-tight ${
                    pnlCardModalPosition.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {pnlCardModalPosition.pnl >= 0 ? '+' : ''}
                  {pnlCardModalPosition.roi}%
                </span>
                <span className="font-mono text-sm font-bold text-muted-foreground block mt-1">
                  손익: {pnlCardModalPosition.pnl >= 0 ? '+' : ''}
                  {groupDigits(pnlCardModalPosition.pnl)} WLD
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono border-t border-zinc-800/80 pt-3">
                <div>
                  <span className="text-muted-foreground text-[10px] block">진입가</span>
                  <span className="font-bold text-foreground">
                    {groupDigits(pnlCardModalPosition.entryPrice)} WLD
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">현재가</span>
                  <span className="font-bold text-foreground">
                    {groupDigits(pnlCardModalPosition.currentPrice)} WLD
                  </span>
                </div>
              </div>
            </div>

            {/* 모달 액션 버튼 */}
            <div className="space-y-2">
              <Button
                onClick={() => handleCopyPnlText(pnlCardModalPosition)}
                className="w-full font-bold bg-purple-600 hover:bg-purple-700 text-white"
              >
                {copiedPnl ? (
                  <>
                    <CheckCircle2 className="size-4 mr-1 text-emerald-400" />
                    클립보드에 복사되었습니다!
                  </>
                ) : (
                  <>
                    <Copy className="size-4 mr-1" />
                    디스코드/SNS 공유 텍스트 복사
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
