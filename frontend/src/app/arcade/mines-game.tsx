'use client';

import { useState, useMemo } from 'react';
import {
  Bomb,
  Gem,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Coins,
  Trophy,
  Flame,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { groupDigits } from '@/lib/money';
import { demoMinesMultiplier, parseDemoStake } from './simulation-rules';

interface TileState {
  index: number;
  revealed: boolean;
  isMine: boolean;
}

export function MinesGame({
  minStake = '1000',
  maxStake = '10000000',
  remainingStake = '10000000',
  exhausted = false,
}: {
  readonly minStake?: string;
  readonly maxStake?: string;
  readonly remainingStake?: string;
  readonly exhausted?: boolean;
}) {
  const [stake, setStake] = useState<string>('5000');
  const [mineCount, setMineCount] = useState<number>(3); // 1 ~ 24
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [tiles, setTiles] = useState<TileState[]>(() =>
    Array.from({ length: 25 }, (_, i) => ({ index: i, revealed: false, isMine: false }))
  );
  const [gemsFound, setGemsFound] = useState<number>(0);
  const [gameResult, setGameResult] = useState<'won' | 'lost' | null>(null);
  const [cashoutAmount, setCashoutAmount] = useState<number>(0);

  // 배당률 공식 계산 (n=25, m=mines, k=gemsFound)
  // Multiplier = (1 - edge) * (25! / (25-k)!) / ((25-m)! / (25-m-k)!)
  const currentMultiplier = useMemo(
    () => demoMinesMultiplier(mineCount, gemsFound),
    [gemsFound, mineCount],
  );
  const nextMultiplier = useMemo(
    () => demoMinesMultiplier(mineCount, Math.min(gemsFound + 1, 25 - mineCount)),
    [gemsFound, mineCount],
  );

  // 게임 시작 (새 판 생성)
  const startGame = () => {
    // This is a browser-only demo. The limit is a UI bound, not a server stake.
    const bet = parseDemoStake(stake, minStake, maxStake, remainingStake);
    if (bet === null || exhausted) return;

    // 25개 중 mineCount개의 랜덤 지뢰 생성
    const mineIndices = new Set<number>();
    while (mineIndices.size < mineCount) {
      mineIndices.add(Math.floor(Math.random() * 25));
    }

    const newTiles = Array.from({ length: 25 }, (_, i) => ({
      index: i,
      revealed: false,
      isMine: mineIndices.has(i),
    }));

    setTiles(newTiles);
    setGemsFound(0);
    setGameResult(null);
    setCashoutAmount(0);
    setIsPlaying(true);
  };

  // 타일 클릭
  const handleTileClick = (index: number) => {
    const clicked = tiles[index];
    if (!isPlaying || !clicked || clicked.revealed || gameResult !== null) return;

    if (clicked.isMine) {
      // 폭탄 밟음 -> 패배 (전체 공개)
      const revealedAll = tiles.map(t => ({ ...t, revealed: true }));
      setTiles(revealedAll);
      setIsPlaying(false);
      setGameResult('lost');
    } else {
      // 보석 발견 -> 배당 상승
      const newTiles = tiles.map((t, idx) => (idx === index ? { ...t, revealed: true } : t));
      setTiles(newTiles);
      const newGems = gemsFound + 1;
      setGemsFound(newGems);

      // 남은 보석이 0개면 강제 올클리어 승리
      if (newGems === 25 - mineCount) {
        cashOut(newGems);
      }
    }
  };

  // 캐시아웃 (상금 획득 및 종료)
  const cashOut = (overrideGems?: number) => {
    if (!isPlaying) return;
    const g = overrideGems ?? gemsFound;
    if (g === 0) return;

    const bet = parseDemoStake(stake, minStake, maxStake, remainingStake);
    if (bet === null) return;
    // Use the newly revealed count, not the stale multiplier from React's
    // previous render when the last gem triggers automatic demo cash-out.
    const winAmount = Math.round(bet * demoMinesMultiplier(mineCount, g));
    setCashoutAmount(winAmount);
    setIsPlaying(false);
    setGameResult('won');

    // 나머지 타일 오픈
    setTiles(prev => prev.map(t => ({ ...t, revealed: true })));
  };

  // 퀵 베팅 프리셋
  const addStake = (amount: number) => {
    if (isPlaying) return;
    setStake(prev => {
      const cur = Number(prev) || 0;
      const next = Math.min(Number(maxStake), cur + amount);
      return String(next);
    });
  };

  return (
    <Card className="border-border shadow-sm overflow-hidden min-h-[480px] flex flex-col justify-between">
      <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Gem className="w-5 h-5" />
            </span>
            <div>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                Mines 지뢰찾기 보물찾기 · 모의 체험
                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                  최대 24.5배+
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                WLD 거래가 없는 연습 게임입니다. 5x5 타일의 모의 배당을 체험해 보세요.
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono text-xs">
              모의 배당률: {currentMultiplier}x
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 flex-1 space-y-6">
        <p role="status" className="rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
          모의 체험 전용입니다. 실제 WLD 잔액은 차감되지 않으며 상금 지급이나 거래 영수증은 생성되지 않습니다.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Controls Panel */}
          <div className="md:col-span-5 space-y-4">
            {/* Stake Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <Label htmlFor="mines-stake" className="font-semibold">모의 금액 (WLD 단위)</Label>
                <span className="text-muted-foreground font-mono">{groupDigits(stake || '0')} WLD</span>
              </div>
              <Input
                id="mines-stake"
                type="number"
                disabled={isPlaying}
                value={stake}
                onChange={e => setStake(e.target.value)}
                className="h-10 text-sm font-mono"
              />
              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPlaying}
                  onClick={() => addStake(1000)}
                  className="h-7 text-[11px] px-2"
                >
                  +1K
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPlaying}
                  onClick={() => addStake(5000)}
                  className="h-7 text-[11px] px-2"
                >
                  +5K
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPlaying}
                  onClick={() => addStake(10000)}
                  className="h-7 text-[11px] px-2"
                >
                  +10K
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPlaying}
                  onClick={() => addStake(50000)}
                  className="h-7 text-[11px] px-2"
                >
                  +50K
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isPlaying}
                  onClick={() => setStake(maxStake)}
                  className="h-7 text-[11px] px-2 text-rose-500 font-bold"
                >
                  MAX
                </Button>
              </div>
            </div>

            {/* Mines Count Selector */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <Label className="font-semibold">지뢰 개수 (난이도)</Label>
                <span className="font-mono text-rose-500 font-bold">{mineCount}개 지뢰</span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {[1, 3, 5, 10, 24].map(count => (
                  <Button
                    key={count}
                    type="button"
                    variant={mineCount === count ? 'default' : 'outline'}
                    disabled={isPlaying}
                    size="sm"
                    onClick={() => setMineCount(count)}
                    className="h-8 text-xs font-mono"
                  >
                    {count}개
                  </Button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              {!isPlaying ? (
                <Button
                  type="button"
                  onClick={startGame}
                  disabled={exhausted || parseDemoStake(stake, minStake, maxStake, remainingStake) === null}
                  className="w-full h-12 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                >
                  모의 게임 시작 (탐사 개시)
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => cashOut()}
                  disabled={gemsFound === 0}
                  className="w-full h-12 text-sm font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm gap-2"
                >
                  <Trophy className="w-4 h-4" />
                  {currentMultiplier}x 모의 정산 (
                  {groupDigits(String(Math.round((Number(stake) || 0) * currentMultiplier)))} WLD)
                </Button>
              )}
            </div>

            {/* Current Game Stats */}
            {isPlaying && (
              <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">발견한 보석:</span>
                  <span className="font-bold font-mono text-emerald-500">{gemsFound} / {25 - mineCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">다음 타일 모의 배당:</span>
                  <span className="font-bold font-mono text-amber-500">{nextMultiplier}x</span>
                </div>
              </div>
            )}
          </div>

          {/* 5x5 Mines Grid */}
          <div className="md:col-span-7 flex flex-col items-center justify-center">
            <div className="grid grid-cols-5 gap-2 w-full max-w-[340px] aspect-square p-3 bg-muted/40 rounded-xl border border-border">
              {tiles.map((tile) => (
                <button
                  key={tile.index}
                  type="button"
                  disabled={!isPlaying || tile.revealed}
                  onClick={() => handleTileClick(tile.index)}
                  aria-label={`모의 타일 ${tile.index + 1}`}
                  className={`relative flex items-center justify-center rounded-lg font-bold transition-all aspect-square min-h-[44px] min-w-[44px] shadow-sm select-none ${
                    !tile.revealed
                      ? 'bg-card hover:bg-muted/80 border border-border cursor-pointer active:scale-95'
                      : tile.isMine
                      ? 'bg-rose-500/20 border-rose-500/60 text-rose-500'
                      : 'bg-emerald-500/20 border-emerald-500/60 text-emerald-500 animate-in zoom-in-75 duration-200'
                  }`}
                >
                  {tile.revealed && (
                    tile.isMine ? (
                      <Bomb className="w-6 h-6 text-rose-500 animate-bounce" />
                    ) : (
                      <Gem className="w-6 h-6 text-emerald-500 drop-shadow-md" />
                    )
                  )}
                  {!tile.revealed && isPlaying && (
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                  )}
                </button>
              ))}
            </div>

            {/* Status Message Overlay */}
            {gameResult && (
              <div className="mt-3 text-center animate-in fade-in duration-300">
                {gameResult === 'won' ? (
                  <div className="text-emerald-500 font-bold text-sm flex items-center gap-1.5 justify-center">
                    <Trophy className="w-4 h-4" />
                    모의 정산 결과: {currentMultiplier}x (+{groupDigits(String(cashoutAmount))} WLD 상당, 실제 지급 없음)
                  </div>
                ) : (
                  <div className="text-rose-500 font-bold text-sm flex items-center gap-1.5 justify-center">
                    <Bomb className="w-4 h-4" />
                    지뢰 폭발! 모의 게임에서 실패했습니다. 실제 WLD는 차감되지 않았습니다.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
