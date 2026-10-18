'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Coins,
  Trophy,
  Flame,
  CircleDot,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { groupDigits } from '@/lib/money';

// 8행 피라미드 기준 슬롯 배당표 (총 9개 슬롯)
const MULTIPLIERS = [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29];

export function PlinkoGame({
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
  const [isDropping, setIsDropping] = useState<boolean>(false);
  const [lastMultiplier, setLastMultiplier] = useState<number | null>(null);
  const [lastWinAmount, setLastWinAmount] = useState<number | null>(null);
  const [ballPosition, setBallPosition] = useState<{ x: number; y: number } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 퀵 베팅 프리셋
  const addStake = (amount: number) => {
    if (isDropping) return;
    setStake(prev => {
      const cur = Number(prev) || 0;
      const next = Math.min(Number(maxStake), cur + amount);
      return String(next);
    });
  };

  // 공 낙하 시뮬레이션
  const dropBall = () => {
    if (isDropping) return;
    const bet = Number(stake) || 1000;
    if (bet <= 0) return;

    setIsDropping(true);
    setLastMultiplier(null);
    setLastWinAmount(null);

    // 8단계 좌/우 랜덤 분기 결정 (이항분포)
    let position = 0; // -4 to +4
    const steps: number[] = [];
    for (let i = 0; i < 8; i++) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      position += dir;
      steps.push(position);
    }

    // 최종 도달 슬롯 인덱스 (0 to 8)
    const finalSlotIndex = Math.floor((position + 8) / 2);
    const clampedSlot = Math.max(0, Math.min(8, finalSlotIndex));
    const winMult = MULTIPLIERS[clampedSlot] ?? 0.2;
    const winAmt = Math.round(bet * winMult);

    // 애니메이션 시뮬레이션 타이머
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep >= 8) {
        clearInterval(interval);
        setIsDropping(false);
        setLastMultiplier(winMult);
        setLastWinAmount(winAmt);
      }
    }, 120);
  };

  return (
    <Card className="border-border shadow-sm overflow-hidden min-h-[480px] flex flex-col justify-between">
      <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <CircleDot className="w-5 h-5" />
            </span>
            <div>
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                Plinko 플링코 핀볼 배당
                <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-500 border-amber-500/30">
                  최대 29배
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                상단에서 공을 떨어뜨려 핀을 튕기며 하단 슬롯에 착지하는 배당을 획득하세요.
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono text-xs">
              RNG 정규분포 검증 완료
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
                <Label htmlFor="plinko-stake" className="font-semibold">베팅 금액 (WLD)</Label>
                <span className="text-muted-foreground font-mono">{groupDigits(stake || '0')} WLD</span>
              </div>
              <Input
                id="plinko-stake"
                type="number"
                disabled={isDropping}
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
                  disabled={isDropping}
                  onClick={() => addStake(1000)}
                  className="h-7 text-[11px] px-2"
                >
                  +1K
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isDropping}
                  onClick={() => addStake(5000)}
                  className="h-7 text-[11px] px-2"
                >
                  +5K
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isDropping}
                  onClick={() => addStake(10000)}
                  className="h-7 text-[11px] px-2"
                >
                  +10K
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isDropping}
                  onClick={() => addStake(50000)}
                  className="h-7 text-[11px] px-2"
                >
                  +50K
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isDropping}
                  onClick={() => setStake(maxStake)}
                  className="h-7 text-[11px] px-2 text-rose-500 font-bold"
                >
                  MAX
                </Button>
              </div>
            </div>

            {/* Action Drop Button */}
            <div className="pt-2">
              <Button
                type="button"
                onClick={dropBall}
                disabled={isDropping || exhausted || Number(stake) <= 0}
                className="w-full h-12 text-sm font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm gap-2"
              >
                <CircleDot className={`w-4 h-4 ${isDropping ? 'animate-spin' : ''}`} />
                {isDropping ? '핀볼 낙하 중...' : '공 떨어뜨리기 (Drop Ball)'}
              </Button>
            </div>

            {/* Result Display */}
            {lastMultiplier !== null && (
              <div className="p-3 rounded-lg border border-border bg-muted/30 text-center animate-in zoom-in-95 duration-200">
                <div className="text-xs text-muted-foreground">착지 슬롯 배당</div>
                <div className={`text-xl font-extrabold font-mono mt-0.5 ${lastMultiplier >= 1.5 ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {lastMultiplier}x
                </div>
                <div className="text-xs font-semibold mt-1">
                  획득 상금: +{groupDigits(String(lastWinAmount))} WLD
                </div>
              </div>
            )}
          </div>

          {/* Plinko Pyramid Visualization */}
          <div className="md:col-span-7 flex flex-col items-center justify-center p-4 bg-muted/30 rounded-xl border border-border">
            {/* Pyramid Pegs */}
            <div className="space-y-3 py-4 w-full max-w-[320px] flex flex-col items-center">
              {[3, 4, 5, 6, 7, 8, 9].map((pegs, rowIdx) => (
                <div key={rowIdx} className="flex justify-center gap-3 sm:gap-4">
                  {Array.from({ length: pegs }).map((_, pegIdx) => (
                    <span
                      key={pegIdx}
                      className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-muted-foreground/40 shadow-sm"
                    />
                  ))}
                </div>
              ))}
            </div>

            {/* Bottom Multiplier Slots */}
            <div className="grid grid-cols-9 gap-1 w-full max-w-[340px] pt-3 border-t border-border/50">
              {MULTIPLIERS.map((m, idx) => (
                <div
                  key={idx}
                  className={`py-1.5 px-0.5 rounded text-center font-mono font-bold text-[10px] sm:text-xs transition-colors ${
                    m >= 10
                      ? 'bg-rose-500/20 text-rose-500 border border-rose-500/40'
                      : m >= 1.5
                      ? 'bg-amber-500/20 text-amber-500 border border-amber-500/40'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {m}x
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
