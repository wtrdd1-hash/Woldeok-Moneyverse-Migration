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
  const currentMultiplier = useMemo(() => {
    if (gemsFound === 0) return 1.0;
    let mult = 0.98; // 2% 하우스 엣지
    for (let i = 0; i < gemsFound; i++) {
      mult *= (25 - i) / (25 - mineCount - i);
    }
    return Math.max(1.01, Number(mult.toFixed(2)));
  }, [gemsFound, mineCount]);

  const nextMultiplier = useMemo(() => {
    let mult = 0.98;
    for (let i = 0; i < gemsFound + 1; i++) {
      mult *= (25 - i) / (25 - mineCount - i);
    }
    return Math.max(1.02, Number(mult.toFixed(2)));
  }, [gemsFound, mineCount]);

  // 게임 시작 (새 판 생성)
  const startGame = () => {
    const bet = Number(stake) || 1000;
    if (bet <= 0) return;

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

    const bet = Number(stake) || 1000;
    const winAmount = Math.round(bet * currentMultiplier);
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
                Mines 지뢰찾기 보물찾기
                <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                  최대 24.5배+
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                5x5 타일에서 보석을 뒤집어 배당을 높이고 폭탄을 피해 원하는 순간 캐시아웃하세요.
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono text-xs">
              배당률: {currentMultiplier}x
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 flex-1 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Controls Panel */}
          <div className="md:col-span-5 space-y-4">
            {/* Stake Input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <Label htmlFor="mines-stake" className="font-semibold">베팅 금액 (WLD)</Label>
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
                  disabled={exhausted || Number(stake) <= 0}
                  className="w-full h-12 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                >
                  게임 시작 (탐사 개시)
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => cashOut()}
                  disabled={gemsFound === 0}
                  className="w-full h-12 text-sm font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm gap-2"
                >
                  <Trophy className="w-4 h-4" />
                  {currentMultiplier}x 캐시아웃 (
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
                  <span className="text-muted-foreground">다음 타일 배당:</span>
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
                    축하합니다! {currentMultiplier}x 캐시아웃 성공 (+{groupDigits(String(cashoutAmount))} WLD)
                  </div>
                ) : (
                  <div className="text-rose-500 font-bold text-sm flex items-center gap-1.5 justify-center">
                    <Bomb className="w-4 h-4" />
                    지뢰 폭발! 베팅금을 잃었습니다. 다음 판에 도전해보세요.
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
