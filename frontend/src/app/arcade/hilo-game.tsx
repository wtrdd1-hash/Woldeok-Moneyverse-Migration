'use client';

import { useActionState, useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Coins,
  Flame,
  Trophy,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { groupDigits } from '@/lib/money';
import { absAmount } from './coin';
import { playHiLo20 } from './actions';
import { CASINO_IDLE } from './casino-state';
import {
  playBetChipSound,
  playCardFlipSound,
  playWinSound,
} from '@/lib/audio-effects';
import { synthSound } from '@/lib/audio/synth-sound';

function minAmount(...values: readonly string[]): string {
  return values.reduce((lowest, value) => (BigInt(value) < BigInt(lowest) ? value : lowest));
}

export function HiLoCardGame({
  minStake,
  maxStake,
  remainingStake,
  exhausted,
  winProbability,
  payoutMultiplier,
}: {
  readonly minStake: string;
  readonly maxStake: string;
  readonly remainingStake: string;
  readonly exhausted: boolean;
  readonly winProbability: string;
  readonly payoutMultiplier: string;
}) {
  const [state, formAction, pending] = useActionState(playHiLo20, CASINO_IDLE);
  const [choice, setChoice] = useState<'high' | 'low'>('high');
  const [stake, setStake] = useState<string>(() => {
    const min = BigInt(minStake || '10');
    return min > 1000n ? min.toString() : '1000';
  });
  const [isFlipping, setIsFlipping] = useState(false);
  const [revealedNumber, setRevealedNumber] = useState<number | null>(null);
  const [streakCount, setStreakCount] = useState(0);

  const maxPlayable = minAmount(maxStake, remainingStake);

  const outcomeFace = state.themeOutcome ? Number(state.themeOutcome) : null;
  const serverSide =
    outcomeFace === null ? null : outcomeFace >= 11 ? 'High (11~20)' : 'Low (1~10)';

  // 서버 결과 반환 시 3D 카드 플립 연출 & 사운드 동기화
  useEffect(() => {
    if (state.status === 'ok') {
      setIsFlipping(true);
      playCardFlipSound();

      const timer = setTimeout(() => {
        setIsFlipping(false);
        setRevealedNumber(outcomeFace);

        if (state.result === 'win') {
          playWinSound();
          setStreakCount((prev) => prev + 1);
        } else {
          synthSound.playLoss();
          setStreakCount(0);
        }
      }, 500);

      return () => clearTimeout(timer);
    } else if (state.status === 'error') {
      setIsFlipping(false);
    }
  }, [state, outcomeFace]);

  // 퀵 베팅 프리셋 핸들러
  const handleQuickStake = (amount: number) => {
    playBetChipSound();
    const current = BigInt(stake || '0');
    const max = BigInt(maxPlayable);
    const next = current + BigInt(amount);
    setStake((next > max ? max : next).toString());
  };

  const handleMaxStake = () => {
    playBetChipSound();
    setStake(maxPlayable);
  };

  const handleChoiceChange = (newChoice: 'high' | 'low') => {
    playBetChipSound();
    setChoice(newChoice);
  };

  const resultText =
    state.status === 'ok' && outcomeFace !== null && state.netAmount
      ? `${state.replayed ? '이미 처리된 판 · ' : ''}서버 추첨 숫자 ${outcomeFace} → ${serverSide}. ${
          state.result === 'win'
            ? `${groupDigits(absAmount(state.netAmount))} WLD 획득 (+${payoutMultiplier}배)`
            : state.result === 'loss'
              ? `${groupDigits(absAmount(state.netAmount))} WLD 손실`
              : '정산 0 WLD'
        }`
      : null;

  return (
    <Card className="border-indigo-500/20 bg-gradient-to-b from-card to-indigo-500/5 shadow-md">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-indigo-500">
            <Sparkles className="size-5 text-indigo-500" />
            <span>하이 / 로우 20 (High / Low 20)</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            {streakCount > 0 && (
              <Badge variant="outline" className="border-amber-500/40 bg-amber-500/10 text-xs font-bold text-amber-500 flex items-center gap-1 animate-pulse">
                <Flame className="size-3.5 text-amber-500" />
                {streakCount}연승 달성!
              </Badge>
            )}
            <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="size-3.5 text-emerald-500" />
              19+ 공정성 검증 준수
            </Badge>
          </div>
        </div>
        <CardDescription className="text-xs sm:text-sm leading-relaxed [word-break:keep-all]">
          서버가 1부터 20까지의 균등 난수를 암호화 추첨합니다. High는 11~20, Low는 1~10이며 적중 시{' '}
          <strong className="text-indigo-500 font-bold">{payoutMultiplier}배</strong> 배당으로 실시간 원자적 정산됩니다.
        </CardDescription>
      </CardHeader>

      <CardContent className="grid gap-6">
        {/* 3D 카드 스테이지 */}
        <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-black/70 p-6 shadow-inner flex flex-col items-center justify-center min-h-[160px]">
          <div
            className="perspective-[1000px] select-none"
            style={{ perspective: '1000px' }}
          >
            <div
              className={`size-28 sm:size-32 rounded-2xl border-2 flex flex-col items-center justify-center font-mono shadow-2xl transition-all duration-500 transform-gpu ${
                isFlipping
                  ? 'rotate-y-180 scale-95 border-indigo-400 bg-indigo-950/60'
                  : revealedNumber !== null
                    ? revealedNumber >= 11
                      ? 'border-rose-500/70 bg-rose-950/40 text-rose-400 scale-100'
                      : 'border-cyan-500/70 bg-cyan-950/40 text-cyan-400 scale-100'
                    : 'border-indigo-500/40 bg-indigo-950/20 text-indigo-400 scale-100'
              }`}
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipping ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {revealedNumber !== null && !isFlipping ? (
                <>
                  <span className="text-4xl sm:text-5xl font-black">{revealedNumber}</span>
                  <span className="mt-1 text-xs font-bold tracking-tight opacity-90">
                    {revealedNumber >= 11 ? '🔺 HIGH (11~20)' : '🔻 LOW (1~10)'}
                  </span>
                </>
              ) : (
                <>
                  <span className="text-3xl sm:text-4xl font-bold opacity-80">?</span>
                  <span className="mt-1 text-[11px] font-semibold text-muted-foreground">
                    {pending || isFlipping ? '카드 오픈 중…' : '선택 대기'}
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs font-mono text-muted-foreground">
            <Coins className="size-3.5 text-indigo-400" />
            <span>선택: {choice === 'high' ? 'High (11~20)' : 'Low (1~10)'} · 배당률: {payoutMultiplier}배</span>
          </div>
        </div>

        {/* High / Low 방향 선택 버튼 */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant={choice === 'high' ? 'default' : 'outline'}
            onClick={() => handleChoiceChange('high')}
            disabled={pending || isFlipping || exhausted}
            className={`h-14 text-sm sm:text-base font-bold transition-all gap-1.5 ${
              choice === 'high'
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-900/30'
                : 'border-rose-500/30 hover:bg-rose-500/10 text-rose-500'
            }`}
          >
            <ArrowUpRight className="size-5" />
            <span>High (11~20)</span>
          </Button>
          <Button
            type="button"
            variant={choice === 'low' ? 'default' : 'outline'}
            onClick={() => handleChoiceChange('low')}
            disabled={pending || isFlipping || exhausted}
            className={`h-14 text-sm sm:text-base font-bold transition-all gap-1.5 ${
              choice === 'low'
                ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-900/30'
                : 'border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-500'
            }`}
          >
            <ArrowDownRight className="size-5" />
            <span>Low (1~10)</span>
          </Button>
        </div>

        {/* 게임 참여 폼 인터페이스 */}
        <form action={formAction} className="grid gap-5">
          <input type="hidden" name="choice" value={choice} />

          <div className="grid gap-2">
            <div className="flex items-center justify-between text-xs">
              <Label htmlFor="hilo-stake" className="font-semibold text-sm">
                도전할 WLD 수량
              </Label>
              <span className="text-muted-foreground">
                한도: {groupDigits(minStake)} ~ {groupDigits(maxPlayable)} WLD
              </span>
            </div>
            <div className="relative">
              <Input
                id="hilo-stake"
                name="stake"
                type="text"
                inputMode="numeric"
                value={stake}
                onChange={(e) => setStake(e.target.value.replace(/[^0-9]/g, ''))}
                disabled={pending || isFlipping || exhausted}
                className="h-12 font-mono text-base font-bold pr-14"
                placeholder="도전할 WLD 수량"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">
                WLD
              </span>
            </div>

            {/* 퀵 프리셋 버튼 */}
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {[1000, 5000, 10000, 50000].map((amt) => (
                <Button
                  key={amt}
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pending || isFlipping || exhausted}
                  onClick={() => handleQuickStake(amt)}
                  className="text-[11px] font-bold h-8 border-border/80 hover:bg-indigo-500/10 hover:text-indigo-500"
                >
                  +{amt >= 10000 ? `${amt / 10000}만` : `${amt / 1000}천`}
                </Button>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pending || isFlipping || exhausted}
                onClick={handleMaxStake}
                className="text-[11px] font-bold h-8 border-indigo-500/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10"
              >
                MAX
              </Button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={pending || isFlipping || exhausted}
            className="h-12 w-full gap-2 rounded-xl text-base font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md disabled:opacity-50"
          >
            {pending || isFlipping ? (
              <>
                <RotateCcw className="size-4 animate-spin" />
                <span>카드 오픈 중…</span>
              </>
            ) : exhausted ? (
              <span>오늘 이용 한도 소진</span>
            ) : (
              <>
                <Coins className="size-4" />
                <span>
                  {groupDigits(stake || '0')} WLD로 {choice === 'high' ? 'High' : 'Low'} 도전
                </span>
              </>
            )}
          </Button>

          {resultText && (
            <div
              role="status"
              className={`rounded-xl border p-4 text-center text-sm font-semibold transition-all ${
                state.result === 'win'
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                  : 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {state.result === 'win' ? (
                  <>
                    <Trophy className="size-5 text-amber-500 animate-bounce" />
                    <span className="font-bold">{resultText}</span>
                  </>
                ) : (
                  <span>{resultText}</span>
                )}
              </div>
            </div>
          )}

          {state.status === 'error' && state.message && (
            <div role="status" className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-center text-sm text-destructive font-semibold">
              {state.message}
            </div>
          )}
        </form>

        {/* 자가 책임 한도 배너 */}
        <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <ShieldCheck className="size-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed [word-break:keep-all]">
              분산 원장 암호화 난수 추첨으로 조작이 불가능하며, 당첨금은 즉시 지갑 원장에 직결되어 안전하게 보호됩니다.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
