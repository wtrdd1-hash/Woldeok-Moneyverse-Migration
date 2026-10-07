'use client';

import React, { useState } from 'react';
import { Swords, Trophy, ShieldCheck, TrendingUp, Sparkles, RefreshCw, Zap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SocialShareBar } from '@/components/social-share-bar';
import { TranslatedText as T } from '@/components/translated-text';

interface Opponent {
  readonly id: string;
  readonly name: string;
  readonly title: string;
  readonly avatar: string;
  readonly returnRate: number;
  readonly diversityScore: number;
  readonly sharpeRatio: number;
  readonly mainAssets: string;
}

const OPPONENTS: readonly Opponent[] = [
  {
    id: 'whale',
    name: '여의도고래',
    title: '시즌 1위 공격수',
    avatar: '🐋',
    returnRate: 142.8,
    diversityScore: 48,
    sharpeRatio: 1.85,
    mainAssets: 'WDG 70%, WDT 30%',
  },
  {
    id: 'ant',
    name: '판교슈퍼개미',
    title: '시즌 2위 성장주',
    avatar: '🐜',
    returnRate: 98.4,
    diversityScore: 72,
    sharpeRatio: 2.15,
    mainAssets: 'WDT 50%, CHIMU 30%, 예금 20%',
  },
  {
    id: 'turtle',
    name: '안정거북이',
    title: '복리 방어 마스터',
    avatar: '🐢',
    returnRate: 35.6,
    diversityScore: 94,
    sharpeRatio: 2.80,
    mainAssets: '복리 예금 60%, DUCK 20%, 랜드 20%',
  },
];

export function PortfolioBattleArena() {
  const [selectedOpponent, setSelectedOpponent] = useState<Opponent>(OPPONENTS[1]!);
  const [isBattling, setIsBattling] = useState<boolean>(false);
  const [battleResult, setBattleResult] = useState<'WIN' | 'LOSE' | null>(null);

  // 내 가상 포트폴리오 스펙 (기본 프리셋)
  const myPortfolio = {
    name: '내 포트폴리오 (Player)',
    returnRate: 112.5,
    diversityScore: 84,
    sharpeRatio: 2.45,
  };

  const handleStartBattle = () => {
    setIsBattling(true);
    setBattleResult(null);

    setTimeout(() => {
      // 3개 지표 가중 합산 점수 비교
      const myScore = myPortfolio.returnRate * 0.4 + myPortfolio.diversityScore * 0.3 + myPortfolio.sharpeRatio * 20;
      const oppScore = selectedOpponent.returnRate * 0.4 + selectedOpponent.diversityScore * 0.3 + selectedOpponent.sharpeRatio * 20;

      setBattleResult(myScore >= oppScore ? 'WIN' : 'LOSE');
      setIsBattling(false);
    }, 1200);
  };

  const shareTitle = battleResult === 'WIN'
    ? `[월덕 머니버스] 포트폴리오 1:1 배틀 승리! ${selectedOpponent.name} 격파 (+500 WLD 보너스 획득) 🏆`
    : `[월덕 머니버스] 가상 자산 포트폴리오 1:1 수익률 & 건전성 배틀에 도전하세요!`;

  return (
    <Card className="rounded-2xl sm:rounded-3xl border border-zinc-800/80 bg-card/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md overflow-hidden">
      <CardHeader className="pb-3 border-b border-border/60">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
              <Swords className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                  <T korean="포트폴리오 1:1 배틀 아레나" english="Portfolio 1v1 Battle Arena" japanese="ポートフォリオ1対1バトルアリーナ" chinese="投资组合1v1对战竞技场" />
                </CardTitle>
                <Badge className="bg-rose-500 text-white text-[10px] font-black">
                  PVP LIVE
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                <T korean="상위 랭커와 7일 수익률, 자산 분산도, 위험 조정 성과를 1:1로 맞붙여 승리 보상을 쟁취하세요." english="Challenge top traders in a 1v1 matchup comparing returns, diversity, and Sharpe ratio." japanese="上位ランカーと収益率、分散度、シャープレシオを1対1で競い勝利報酬を獲得しましょう。" chinese="与顶级交易员进行1v1对战，全面PK收益率、分散度及夏普比率。" />
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/40 border border-border/60">
            {OPPONENTS.map((opp) => (
              <Button
                key={opp.id}
                variant={selectedOpponent.id === opp.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => {
                  setSelectedOpponent(opp);
                  setBattleResult(null);
                }}
                className="text-xs h-7 px-2.5 rounded-lg font-bold"
              >
                <span>{opp.avatar}</span>
                <span className="ml-1 hidden min-[400px]:inline">{opp.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* VS 배틀 카드 매칭 영역 */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-3">
          {/* 내 포트폴리오 */}
          <div className="p-4 rounded-2xl bg-muted/30 border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="size-3.5" /> MY PORTFOLIO
              </span>
              <Badge variant="outline" className="text-[10px] font-mono border-emerald-500/30 text-emerald-400">
                Grade A+
              </Badge>
            </div>
            <div className="space-y-1.5 pt-1 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">7일 수익률:</span>
                <span className="font-black text-emerald-400">+{myPortfolio.returnRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">자산 분산도 (HHI):</span>
                <span className="font-bold text-foreground">{myPortfolio.diversityScore}점</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">샤프 지수 (위험대비):</span>
                <span className="font-bold text-foreground">{myPortfolio.sharpeRatio}</span>
              </div>
            </div>
          </div>

          {/* 중앙 VS 배지 */}
          <div className="grid place-items-center py-1 md:py-0">
            <div className="size-10 rounded-full bg-rose-500 text-white font-black grid place-items-center text-xs shadow-lg shadow-rose-950/40 ring-4 ring-background">
              VS
            </div>
          </div>

          {/* 대전 상대 포트폴리오 */}
          <div className="p-4 rounded-2xl bg-muted/30 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <span>{selectedOpponent.avatar}</span> {selectedOpponent.name}
              </span>
              <Badge variant="outline" className="text-[10px] font-mono border-amber-500/30 text-amber-400">
                {selectedOpponent.title}
              </Badge>
            </div>
            <div className="space-y-1.5 pt-1 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">7일 수익률:</span>
                <span className="font-black text-amber-400">+{selectedOpponent.returnRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">자산 분산도 (HHI):</span>
                <span className="font-bold text-foreground">{selectedOpponent.diversityScore}점</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">샤프 지수 (위험대비):</span>
                <span className="font-bold text-foreground">{selectedOpponent.sharpeRatio}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 배틀 실행 버튼 & 결과 */}
        {!battleResult ? (
          <Button
            size="lg"
            onClick={handleStartBattle}
            disabled={isBattling}
            className="w-full h-12 rounded-xl text-sm font-extrabold bg-gradient-to-r from-rose-600 via-amber-600 to-rose-600 hover:opacity-95 text-white shadow-md active:scale-[0.99] transition-all"
          >
            {isBattling ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="size-4 animate-spin" />
                <T korean="3중 지표 정밀 판정 중..." english="Simulating 3-Factor Duel..." japanese="3大指標を判定中..." chinese="3大指标判定中..." />
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Zap className="size-4" />
                <T korean="1:1 포트폴리오 맞대결 시작" english="Start 1v1 Battle" japanese="1対1対決スタート" chinese="开启1v1对决" />
              </span>
            )}
          </Button>
        ) : (
          <div className={`p-4 rounded-xl border animate-in zoom-in-95 duration-300 space-y-3 ${
            battleResult === 'WIN'
              ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-400'
              : 'bg-rose-950/20 border-rose-500/40 text-rose-400'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {battleResult === 'WIN' ? (
                  <>
                    <Trophy className="size-5 text-emerald-400 animate-bounce" />
                    <span className="text-base font-black">
                      VICTORY! {selectedOpponent.name} 상대로 완승 (+500 WLD 획득)
                    </span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="size-5 text-rose-400" />
                    <span className="text-base font-black">
                      DEFEAT! 상대의 샤프 지수가 더 높았습니다. 포트폴리오를 재정비하세요.
                    </span>
                  </>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBattleResult(null)}
                className="text-xs font-bold rounded-lg"
              >
                다시 대결
              </Button>
            </div>

            {/* 승리 인증 소셜 공유 바 */}
            <div className="pt-2 border-t border-border/40">
              <SocialShareBar
                title={shareTitle}
                url="https://easy-scraping.com"
                description={`머니버스 포트폴리오 배틀 아레나에서 ${selectedOpponent.name}와의 대결 결과를 확인하세요!`}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
