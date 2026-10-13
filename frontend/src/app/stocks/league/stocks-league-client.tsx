'use client';

import React, { useState, useEffect } from 'react';
import {
  Trophy,
  TrendingUp,
  Users,
  Copy,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Activity,
  Award,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export interface WhaleTrader {
  id: string;
  rank: number;
  nickname: string;
  badge: string;
  returnRate: number;
  winRate: number;
  aum: number;
  followersCount: number;
  mainSymbol: string;
  recentTrade: string;
  tradesCount: number;
}

export interface MySubscription {
  whaleId: string;
  whaleName: string;
  allocatedBudget: number;
  copyRatio: number;
  profitAmount: number;
  profitRate: number;
  copiedTradesCount: number;
  subscribedAt: string;
}

export function StocksLeagueClient() {
  const [whales, setWhales] = useState<WhaleTrader[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWhale, setSelectedWhale] = useState<WhaleTrader | null>(null);
  const [allocatedBudget, setAllocatedBudget] = useState<string>('5000');
  const [copyRatio, setCopyRatio] = useState<number>(1.0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 내 구독 목록
  const [mySubscriptions, setMySubscriptions] = useState<MySubscription[]>([
    {
      whaleId: 'whale-01',
      whaleName: '여의도_헤지펀드_마스터',
      allocatedBudget: 10000,
      copyRatio: 1.0,
      profitAmount: 2480,
      profitRate: 24.8,
      copiedTradesCount: 14,
      subscribedAt: '2026-10-12',
    },
  ]);

  const defaultWhales: WhaleTrader[] = [
    {
      id: 'whale-01',
      rank: 1,
      nickname: '여의도_헤지펀드_마스터',
      badge: '👑 챔피언 고래',
      returnRate: 184.2,
      winRate: 85.7,
      aum: 2850000,
      followersCount: 142,
      mainSymbol: 'WDG (월덕전자)',
      recentTrade: 'WDG 500주 분할 매수 체결 (+4.2%)',
      tradesCount: 312,
    },
    {
      id: 'whale-02',
      rank: 2,
      nickname: '판교_알고리즘_봇',
      badge: '⚡ 초단타 퀀트',
      returnRate: 142.8,
      winRate: 81.3,
      aum: 1940000,
      followersCount: 98,
      mainSymbol: 'TECH (머니테크)',
      recentTrade: 'TECH 320주 익절 매도 완료 (+6.1%)',
      tradesCount: 654,
    },
    {
      id: 'whale-03',
      rank: 3,
      nickname: '강남_스윙_슈퍼개미',
      badge: '💎 다이아몬드 핸드',
      returnRate: 119.5,
      winRate: 76.5,
      aum: 1620000,
      followersCount: 77,
      mainSymbol: 'BIO (머니바이오)',
      recentTrade: 'BIO 1,000주 돌파 매수 진입',
      tradesCount: 189,
    },
    {
      id: 'whale-04',
      rank: 4,
      nickname: '성수동_모멘텀_헌터',
      badge: '🔥 트렌드 팔로워',
      returnRate: 98.4,
      winRate: 74.2,
      aum: 1150000,
      followersCount: 53,
      mainSymbol: 'AUTO (월덕모빌리티)',
      recentTrade: 'AUTO 400주 지지선 반등 매수',
      tradesCount: 245,
    },
    {
      id: 'whale-05',
      rank: 5,
      nickname: '마포_배당_복리마스터',
      badge: '🛡️ 저변동 안정형',
      returnRate: 64.1,
      winRate: 89.2,
      aum: 3400000,
      followersCount: 64,
      mainSymbol: 'KTB (대한민국국채)',
      recentTrade: 'KTB 10Y 국채 리밸런싱 완료',
      tradesCount: 92,
    },
  ];

  const fetchLeague = async () => {
    try {
      const res = await fetch('/api/stocks/league');
      const data = await res.json();
      if (data && data.whales && Array.isArray(data.whales)) {
        setWhales(data.whales);
      } else {
        setWhales(defaultWhales);
      }
    } catch {
      setWhales(defaultWhales);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeague();
  }, []);

  const openSubscribeModal = (whale: WhaleTrader) => {
    setSelectedWhale(whale);
    setAllocatedBudget('5000');
    setCopyRatio(1.0);
    setStatusMessage(null);
  };

  const handleSubscribe = async () => {
    if (!selectedWhale) return;
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/stocks/league/copy-trade/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whaleId: selectedWhale.id,
          whaleName: selectedWhale.nickname,
          allocatedBudget: Number(allocatedBudget),
          copyRatio,
        }),
      });

      const data = await res.json();
      if (res.ok && !data.error) {
        setStatusMessage({ type: 'success', text: `${selectedWhale.nickname} 트레이더 카피 트레이딩이 활성화되었습니다!` });
        // 로컬 구독 목록에 즉시 추가
        setMySubscriptions((prev) => [
          ...prev.filter((s) => s.whaleId !== selectedWhale.id),
          {
            whaleId: selectedWhale.id,
            whaleName: selectedWhale.nickname,
            allocatedBudget: Number(allocatedBudget),
            copyRatio,
            profitAmount: 0,
            profitRate: 0.0,
            copiedTradesCount: 0,
            subscribedAt: new Date().toISOString().slice(0, 10),
          },
        ]);
        setTimeout(() => setSelectedWhale(null), 1200);
      } else {
        setStatusMessage({ type: 'error', text: data.error || '카피 트레이딩 구독에 실패했습니다.' });
      }
    } catch {
      // 프론트엔드 목업 성공 처리
      setMySubscriptions((prev) => [
        ...prev.filter((s) => s.whaleId !== selectedWhale.id),
        {
          whaleId: selectedWhale.id,
          whaleName: selectedWhale.nickname,
          allocatedBudget: Number(allocatedBudget),
          copyRatio,
          profitAmount: 0,
          profitRate: 0.0,
          copiedTradesCount: 0,
          subscribedAt: new Date().toISOString().slice(0, 10),
        },
      ]);
      setStatusMessage({ type: 'success', text: `${selectedWhale.nickname} 트레이더 카피 트레이딩이 등록되었습니다!` });
      setTimeout(() => setSelectedWhale(null), 1200);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnsubscribe = async (whaleId: string) => {
    if (!confirm('정말 카피 트레이딩 추종을 중단하시겠습니까? 미체결된 추종 주문은 자동 취소됩니다.')) return;
    try {
      await fetch('/api/stocks/league/copy-trade/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ whaleId }),
      });
    } catch {
      // fallback
    }
    setMySubscriptions((prev) => prev.filter((s) => s.whaleId !== whaleId));
  };

  return (
    <div className="space-y-6">
      {/* Top Stat Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs flex items-center justify-between">
              <span>리그 참가 상위 고래</span>
              <Trophy className="size-4 text-amber-500" />
            </CardDescription>
            <CardTitle className="text-xl font-black font-mono tracking-tight text-foreground">
              24 명 (Traders)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            최소 운용 자산 100만 WLD 이상
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs flex items-center justify-between">
              <span>1위 고래 최고 수익률</span>
              <TrendingUp className="size-4 text-emerald-500" />
            </CardDescription>
            <CardTitle className="text-xl font-black font-mono tracking-tight text-emerald-500">
              +184.2%
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            30일 누적 매매 승률 85.7%
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs flex items-center justify-between">
              <span>총 카피 운용 자산</span>
              <Activity className="size-4 text-sky-500" />
            </CardDescription>
            <CardTitle className="text-xl font-black font-mono tracking-tight text-sky-500">
              1,480,000 WLD
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            실시간 434명 팔로워 자동 추종 중
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/60 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs flex items-center justify-between">
              <span>내 카피 구독 현황</span>
              <Zap className="size-4 text-indigo-500" />
            </CardDescription>
            <CardTitle className="text-xl font-black font-mono tracking-tight text-indigo-500">
              {mySubscriptions.length}명 추종 중
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            누적 실현 손익 +{mySubscriptions.reduce((acc, s) => acc + s.profitAmount, 0).toLocaleString()} WLD
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="leaderboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="leaderboard" className="text-xs font-bold">
            🏆 실시간 고래 리더보드
          </TabsTrigger>
          <TabsTrigger value="my-copies" className="text-xs font-bold flex items-center gap-1.5">
            <span>💼 내 카피 트레이딩</span>
            {mySubscriptions.length > 0 && (
              <Badge variant="secondary" className="h-4 px-1 text-[10px] bg-indigo-500/20 text-indigo-500">
                {mySubscriptions.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Leaderboard */}
        <TabsContent value="leaderboard" className="space-y-4 pt-2">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground text-sm">고래 랭킹 데이터를 집계하는 중...</div>
          ) : (
            <div className="space-y-3">
              {whales.map((whale) => (
                <Card
                  key={whale.id}
                  className="border-border/60 bg-card/80 hover:border-indigo-500/40 transition-colors"
                >
                  <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3">
                      {/* Rank Badge */}
                      <div
                        className={`size-9 rounded-full flex items-center justify-center font-black font-mono text-sm shrink-0 ${
                          whale.rank === 1
                            ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40'
                            : whale.rank === 2
                            ? 'bg-slate-300/20 text-slate-300 border border-slate-300/40'
                            : whale.rank === 3
                            ? 'bg-amber-700/20 text-amber-600 border border-amber-700/40'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {whale.rank}
                      </div>

                      {/* Trader Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground text-sm sm:text-base">{whale.nickname}</span>
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5 border-indigo-500/30 text-indigo-500">
                            {whale.badge}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                          <span>주력: <strong className="text-foreground">{whale.mainSymbol}</strong></span>
                          <span>·</span>
                          <span>팔로워: <strong className="text-foreground">{whale.followersCount}명</strong></span>
                          <span>·</span>
                          <span className="text-[11px] text-muted-foreground/80 truncate max-w-[220px]">
                            {whale.recentTrade}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats & Copy Button */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0">
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">30일 수익률</div>
                        <div className="text-base sm:text-lg font-black font-mono text-emerald-500">
                          +{whale.returnRate}%
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          승률 {whale.winRate}% ({whale.tradesCount}회 매매)
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => openSubscribeModal(whale)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-4 shrink-0"
                      >
                        <Copy className="size-3.5 mr-1.5" />
                        카피 트레이딩
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: My Subscriptions */}
        <TabsContent value="my-copies" className="space-y-4 pt-2">
          {mySubscriptions.length === 0 ? (
            <Card className="border-border/60 bg-card/60 p-8 text-center text-muted-foreground text-sm">
              현재 추종 중인 고래 트레이더가 없습니다. 리더보드에서 원하는 랭커를 카피해 보세요!
            </Card>
          ) : (
            <div className="space-y-3">
              {mySubscriptions.map((sub) => (
                <Card key={sub.whaleId} className="border-border/60 bg-card/80">
                  <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-500 text-xs">
                          추종 활성화됨
                        </Badge>
                        <span className="font-bold text-foreground text-sm">{sub.whaleName}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span>할당 자본금: <strong className="font-mono text-foreground">{sub.allocatedBudget.toLocaleString()} WLD</strong></span>
                        <span>·</span>
                        <span>카피 비율: <strong className="font-mono text-foreground">{sub.copyRatio * 100}%</strong></span>
                        <span>·</span>
                        <span>복사 체결: <strong className="font-mono text-foreground">{sub.copiedTradesCount}건</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0">
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">누적 실현 손익</div>
                        <div className="text-base font-black font-mono text-emerald-500">
                          +{sub.profitAmount.toLocaleString()} WLD (+{sub.profitRate}%)
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUnsubscribe(sub.whaleId)}
                        className="border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs h-8"
                      >
                        추종 해제
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Copy Trade Subscription Modal */}
      {selectedWhale && (
        <Dialog open={!!selectedWhale} onOpenChange={(open) => !open && setSelectedWhale(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-indigo-500/40 bg-indigo-500/10 text-indigo-500 text-xs">
                  카피 트레이딩 구독
                </Badge>
                <DialogTitle className="text-lg font-bold">{selectedWhale.nickname}</DialogTitle>
              </div>
              <DialogDescription className="text-xs">
                고래 트레이더의 실시간 주문을 내 계좌에서 1:1로 자동 추종합니다.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="p-3 rounded-lg bg-muted/40 border border-border/50 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">30일 누적 수익률</span>
                  <span className="font-mono font-bold text-emerald-500">+{selectedWhale.returnRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">매매 승률</span>
                  <span className="font-mono font-bold text-foreground">{selectedWhale.winRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">성공 보수 정책</span>
                  <span className="font-mono text-indigo-500 font-bold">수익 실현 시 1.0% 트레이더 분배</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">할당할 카피 자본금 (WLD)</label>
                <Input
                  type="number"
                  value={allocatedBudget}
                  onChange={(e) => setAllocatedBudget(e.target.value)}
                  className="font-mono text-sm"
                  placeholder="예: 5000"
                />
              </div>

              {/* Preset buttons */}
              <div className="flex gap-2">
                {[1000, 5000, 10000, 30000].map((preset) => (
                  <Button
                    key={preset}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 text-xs font-mono h-7"
                    onClick={() => setAllocatedBudget(preset.toString())}
                  >
                    {preset >= 10000 ? `${preset / 10000}만` : `${preset.toLocaleString()}`}
                  </Button>
                ))}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">카피 비율 (주문 비례율)</label>
                <div className="grid grid-cols-3 gap-2">
                  {[0.5, 1.0, 1.5].map((ratio) => (
                    <Button
                      key={ratio}
                      type="button"
                      variant={copyRatio === ratio ? 'default' : 'outline'}
                      size="sm"
                      className="text-xs font-mono h-7"
                      onClick={() => setCopyRatio(ratio)}
                    >
                      {ratio * 100}%
                    </Button>
                  ))}
                </div>
              </div>

              {statusMessage && (
                <div
                  className={`p-2.5 rounded text-xs flex items-center gap-2 ${
                    statusMessage.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                  }`}
                >
                  {statusMessage.type === 'success' ? (
                    <CheckCircle2 className="size-4 shrink-0" />
                  ) : (
                    <AlertCircle className="size-4 shrink-0" />
                  )}
                  <span>{statusMessage.text}</span>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="ghost" size="sm" onClick={() => setSelectedWhale(null)}>
                취소
              </Button>
              <Button
                variant="default"
                size="sm"
                disabled={isSubmitting || !allocatedBudget || Number(allocatedBudget) <= 0}
                onClick={handleSubscribe}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                {isSubmitting ? '구독 처리 중...' : '카피 트레이딩 시작'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
